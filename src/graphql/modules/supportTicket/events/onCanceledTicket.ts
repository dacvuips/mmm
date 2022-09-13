import { InsertNotification, NotificationTarget } from "../../notification/notification.model";
import { NotificationBuilder } from "../../notification/notificationBuilder";
import { SupportTicketEventHandler } from "../supportTicket.event";

export default (async (ticket, context) => {
  const notifies = [
    new NotificationBuilder(`Yêu cầu đã bị huỷ`, ticket.name)
      .supportTicket(ticket.id)
      .sendTo(NotificationTarget.MEMBER, ticket.memberId)
      .build(),
  ];

  await InsertNotification(notifies);
}) as SupportTicketEventHandler;
