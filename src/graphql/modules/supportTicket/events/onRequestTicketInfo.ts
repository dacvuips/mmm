import { MemberLoader } from "../../member/member.model";
import { InsertNotification, NotificationTarget } from "../../notification/notification.model";
import { NotificationBuilder } from "../../notification/notificationBuilder";
import { SupportTicketEventHandler } from "../supportTicket.event";

export default (async (ticket, context) => {
  const member = await MemberLoader.load(ticket.memberId);
  const notifies = [
    new NotificationBuilder(`Yêu cầu bổ sung thông tin`, ticket.name)
      .supportTicket(ticket.id)
      .sendTo(NotificationTarget.MEMBER, member._id)
      .build(),
  ];

  await InsertNotification(notifies);
}) as SupportTicketEventHandler;
