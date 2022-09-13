import { MemberLoader } from "../../member/member.model";
import { InsertNotification, NotificationTarget } from "../../notification/notification.model";
import { NotificationBuilder } from "../../notification/notificationBuilder";
import { SupportTicketEventHandler } from "../supportTicket.event";

export default (async (ticket, context) => {
  const member = await MemberLoader.load(ticket.memberId);
  const notifies = [
    new NotificationBuilder(`${member.shopName} đã bổ sung thông tin yêu cầu hỗ trợ`, ticket.name)
      .supportTicket(ticket.id)
      .sendTo(NotificationTarget.USER, ticket.assignerId)
      .build(),
  ];

  await InsertNotification(notifies);
}) as SupportTicketEventHandler;
