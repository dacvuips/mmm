import { gql } from "apollo-server-express";

import { ROLES } from "../../../constants/role.const";
import { notFoundHandler } from "../../../helpers/functions/notFoundHandler";
import { Context } from "../../context";
import { MemberLoader } from "../member/member.model";
import { UserLoader, UserModel } from "../user/user.model";
import { SupportTicketStatus, SupportTicketSubStatus } from "./common";
import { SupportTicketModel } from "./supportTicket.model";
import { supportTicketService } from "./supportTicket.service";
import { supportTicketCommentService } from "./supportTicketComment/supportTicketComment.service";

export default {
  schema: gql`
    extend type Mutation {
      considerSupportTicket(id: ID!, comment: SupportTicketCommentInput): SupportTicket
      assignSupportTicket(
        id: ID!
        assignerId: ID!
        comment: SupportTicketCommentInput
      ): SupportTicket
      requestInfoSupportTicket(id: ID!, comment: SupportTicketCommentInput): SupportTicket
      submitInfoSupportTicket(id: ID!, comment: SupportTicketCommentInput): SupportTicket
      completeSupportTicket(id: ID!, comment: SupportTicketCommentInput): SupportTicket
      cancelSupportTicket(id: ID!, comment: SupportTicketCommentInput): SupportTicket
    }

    input SupportTicketCommentInput {
      "Nội dung"
      message: String!
      "Hình ảnh"
      images: [String]
    }
  `,
  resolver: {
    Mutation: {
      considerSupportTicket: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { id, comment } = args;
        const data = {
          status: SupportTicketStatus.pending,
          subStatus: SupportTicketSubStatus.considering,
          assignerId: context.id,
        };
        const ticket = await SupportTicketModel.findOneAndUpdate(
          { _id: id },
          {
            $set: data,
            $push: { logs: { ...data, fromUserId: context.id, createdAt: new Date() } },
          }
        );

        if (comment) {
          await addCommentToTicket(ticket._id, comment, context);
        }

        supportTicketService.event.emit("considering", ticket, context);
        return ticket;
      },
      assignSupportTicket: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { id, assignerId, comment } = args;
        const assinger = notFoundHandler(await UserModel.findById(assignerId));
        const data = {
          status: SupportTicketStatus.pending,
          subStatus: SupportTicketSubStatus.assigning,
          assignerId: assinger.id,
        };
        const ticket = await SupportTicketModel.findOneAndUpdate(
          { _id: id },
          {
            $set: data,
            $push: { logs: { ...data, fromUserId: context.id, createdAt: new Date() } },
          }
        );

        if (comment) {
          await addCommentToTicket(ticket._id, comment, context);
        }

        supportTicketService.event.emit("assigning", ticket, context);
        return ticket;
      },
      requestInfoSupportTicket: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { id, comment } = args;
        const data = {
          status: SupportTicketStatus.processing,
          subStatus: SupportTicketSubStatus.request_more_info,
        };
        const ticket = await SupportTicketModel.findOneAndUpdate(
          { _id: id },
          {
            $set: data,
            $push: { logs: { ...data, fromUserId: context.id, createdAt: new Date() } },
          }
        );

        if (comment) {
          await addCommentToTicket(ticket._id, comment, context);
        }

        supportTicketService.event.emit("request_more_info", ticket, context);
        return ticket;
      },
      submitInfoSupportTicket: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);
        const { id, comment } = args;
        const data = {
          status: SupportTicketStatus.processing,
          subStatus: SupportTicketSubStatus.info_completed,
        };
        const ticket = await SupportTicketModel.findOneAndUpdate(
          { _id: id },
          {
            $set: data,
            $push: { logs: { ...data, createdAt: new Date() } },
          }
        );

        if (comment) {
          await addCommentToTicket(ticket._id, comment, context);
        }

        supportTicketService.event.emit("info_completed", ticket, context);
        return ticket;
      },
      completeSupportTicket: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { id, comment } = args;
        const data = {
          status: SupportTicketStatus.closed,
          subStatus: SupportTicketSubStatus.completed,
        };
        const ticket = await SupportTicketModel.findOneAndUpdate(
          { _id: id },
          {
            $set: data,
            $push: { logs: { ...data, createdAt: new Date() } },
          }
        );

        if (comment) {
          await addCommentToTicket(ticket._id, comment, context);
        }

        supportTicketService.event.emit("completed", ticket, context);
        return ticket;
      },
      cancelSupportTicket: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
        const { id, comment } = args;
        const data = {
          status: SupportTicketStatus.closed,
          subStatus: SupportTicketSubStatus.canceled,
        };
        const ticket = await SupportTicketModel.findOneAndUpdate(
          { _id: id },
          {
            $set: data,
            $push: { logs: { ...data, createdAt: new Date() } },
          }
        );

        if (comment) {
          await addCommentToTicket(ticket._id, comment, context);
        }

        supportTicketService.event.emit("canceled", ticket, context);
        return ticket;
      },
    },
  },
};

async function addCommentToTicket(ticketId: string, comment: any, context: Context) {
  if (context.isMember() || context.isStaff()) {
    const member = await MemberLoader.load(context.sellerId);
    await supportTicketCommentService.create({
      ...comment,
      fromMember: true,
      memberId: context.sellerId,
      ticketId,
      name: member.name,
    });
  } else {
    const user = await UserLoader.load(context.id);
    await supportTicketCommentService.create({
      ...comment,
      fromMember: false,
      userId: context.id,
      ticketId,
      name: user.name,
    });
  }
}
