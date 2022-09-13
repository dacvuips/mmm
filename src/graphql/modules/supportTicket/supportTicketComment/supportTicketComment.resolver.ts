import { ErrorHelper } from "../../../../base/error";
import { ROLES } from "../../../../constants/role.const";
import { notFoundHandler } from "../../../../helpers/functions/notFoundHandler";
import { Context } from "../../../context";
import { MemberLoader } from "../../member/member.model";
import { UserLoader } from "../../user/user.model";
import { SupportTicketModel } from "../supportTicket.model";
import { ISupportTicketComment, SupportTicketCommentModel } from "./supportTicketComment.model";
import { supportTicketCommentService } from "./supportTicketComment.service";

const Query = {
  getAllSupportTicketComment: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    return supportTicketCommentService.fetch(args.q);
  },
  getOneSupportTicketComment: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await supportTicketCommentService.findOne({ _id: id });
  },
};

const Mutation = {
  createSupportTicketComment: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const {
      data: { assingerId, ...data },
    } = args;
    const { ticketId } = data;
    const ticket = notFoundHandler(await SupportTicketModel.findById(ticketId));
    if (context.isMember() || context.isStaff()) {
      if (ticket.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
      const member = await MemberLoader.load(context.sellerId);
      data.fromMember = true;
      data.name = member.name;
      data.memberId = member._id;
    } else {
      const user = await UserLoader.load(context.id);
      data.fromMember = false;
      data.name = user.name;
      data.userId = context.id;
    }

    const comment: ISupportTicketComment = await supportTicketCommentService.create(data);

    return comment;
  },
  updateSupportTicketComment: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER);
    const { id, data } = args;

    if (context.isMember()) {
      const comment = notFoundHandler(await SupportTicketCommentModel.findById(id));
      if (comment.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    }

    return await supportTicketCommentService.updateOne(id, data);
  },
  deleteOneSupportTicketComment: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    if (context.isMember()) {
      const comment = notFoundHandler(await SupportTicketCommentModel.findById(id));
      if (comment.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    }
    return await supportTicketCommentService.deleteOne(id);
  },
};

const SupportTicketComment = {};

export default {
  Query,
  Mutation,
  SupportTicketComment,
};
