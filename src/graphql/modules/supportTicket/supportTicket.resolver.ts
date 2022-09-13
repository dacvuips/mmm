import _ from "lodash";
import moment from "moment";

import { ErrorHelper } from "../../../base/error";
import { ROLES } from "../../../constants/role.const";
import { notFoundHandler } from "../../../helpers/functions/notFoundHandler";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import ClosedSupportTicketJob from "../../../scheduler/jobs/closedSupportTicket.job";
import { Context } from "../../context";
import { counterService } from "../counter/counter.service";
import { MemberLoader } from "../member/member.model";
import { UserLoader } from "../user/user.model";
import { SupportTicketStatus, SupportTicketSubStatus } from "./common";
import { SupportTicketModel } from "./supportTicket.model";
import { supportTicketService } from "./supportTicket.service";

const Query = {
  getAllSupportTicket: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      _.set(args, "q.filter.memberId", context.sellerId);
    }
    return supportTicketService.fetch(args.q);
  },
  getOneSupportTicket: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await supportTicketService.findOne({ _id: id });
  },
};

const Mutation = {
  createSupportTicket: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    data.code = await counterService.trigger("supportTicket").then((res) => "STK" + res);
    data.memberId = context.sellerId;
    data.status = SupportTicketStatus.opening;
    data.subStatus = SupportTicketSubStatus.new;
    data.logs = [
      {
        status: SupportTicketStatus.opening,
        subStatus: SupportTicketSubStatus.new,
        createdAt: new Date(),
      },
    ];
    const ticket = await supportTicketService.create(data);

    // Đóng supportTicket nếu trong 48h không phản hồi
    await ClosedSupportTicketJob.create({ id: ticket._id })
      .schedule(moment().add(48, "hours").toDate())
      .save();

    supportTicketService.event.emit("new", ticket, context);
    return ticket;
  },
  updateSupportTicket: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    const ticket = notFoundHandler(await SupportTicketModel.findById(id));
    if (ticket.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();

    return await supportTicketService.updateOne(id, data);
  },
  deleteOneSupportTicket: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    if (context.isMember() || context.isStaff()) {
      const ticket = notFoundHandler(await SupportTicketModel.findById(id));
      if (ticket.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    }
    return await supportTicketService.deleteOne(id);
  },
};

const SupportTicket = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  assigner: GraphQLHelper.loadById(UserLoader, "assignerId"),
};

export default {
  Query,
  Mutation,
  SupportTicket,
};
