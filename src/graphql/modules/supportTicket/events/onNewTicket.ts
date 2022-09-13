import _ from "lodash";
import { ROLES } from "../../../../constants/role.const";
import cache from "../../../../helpers/cache";
import { MemberLoader } from "../../member/member.model";
import { InsertNotification, NotificationTarget } from "../../notification/notification.model";
import { NotificationBuilder } from "../../notification/notificationBuilder";
import { UserModel, UserRole } from "../../user/user.model";
import { SupportTicketEventHandler } from "../supportTicket.event";

export default (async (ticket, context) => {
  const member = await MemberLoader.load(context.id);
  const userIds = await getAllUserIds();
  const notifies = userIds.map((uid) =>
    new NotificationBuilder(`${member.shopName} yêu cầu hỗ trợ!`, ticket.name)
      .supportTicket(ticket.id)
      .sendTo(NotificationTarget.USER, uid)
      .build()
  );
  await InsertNotification(notifies);
}) as SupportTicketEventHandler;

async function getAllUserIds() {
  const key = `user:ids`;
  const result = JSON.parse(await cache.get(key));
  if (_.isEmpty(result) == false) return result as string[];

  const userIds = await UserModel.find({ role: { $in: [UserRole.ADMIN, UserRole.EDITOR] } })
    .select("_id")
    .then((res) => res.map((r) => r._id));
  await cache.set(key, JSON.stringify(userIds), 60); // cache 1 phút

  return userIds;
}
