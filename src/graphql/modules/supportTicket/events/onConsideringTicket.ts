import { MemberLoader } from "../../member/member.model";
import { InsertNotification, NotificationTarget } from "../../notification/notification.model";
import { NotificationBuilder } from "../../notification/notificationBuilder";
import { UserLoader } from "../../user/user.model";
import { SupportTicketEventHandler } from "../supportTicket.event";

export default (async (ticket, context) => {
  const member = await MemberLoader.load(ticket.memberId);
  const assinger = await UserLoader.load(ticket.assignerId);
  const notifies = [
    new NotificationBuilder(`Yêu cầu đang được xem xét`, assinger.name)
      .supportTicket(ticket.id)
      .sendTo(NotificationTarget.MEMBER, member._id)
      .build(),
  ];
  await InsertNotification(notifies);
}) as SupportTicketEventHandler;
