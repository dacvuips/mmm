import { BaseModel, CrudRepository } from "./crud.repo";
import { Post } from "./post.repo";
import { User } from "./user.repo";

export interface AdminNotification extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  body: string;
  image: string;
  logs: NotifySendLog[];
  action: Action;
}
export interface Action {
  type: AdminNotificationActionType;
  link: string;
  orderId: string;
  productId: string;
  ticketId: string;
}
export interface NotifySendLog {
  id: string;
  createdAt: string;
  updatedAt: string;
  owner: Owner;
  match: number;
  sended: number;
  seen: number;
  targets: string[];
}
interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile: User;
}

export class AdminNotificationRepository extends CrudRepository<AdminNotification> {
  apiName: string = "AdminNotification";
  displayName: string = "Thông báo";
  shortFragment: string = this.parseFragment(`
      id: String
      createdAt: DateTime
      updatedAt: DateTime
      title: String
      body: String
      image: String
      action{
        type: String
        link: String
        orderId: ID
        productId: ID
        ticketId: ID
      }: Action
      `);
  fullFragment: string = this.parseFragment(`
      id: String
      createdAt: DateTime
      updatedAt: DateTime
      title: String
      body: String
      image: String
      logs{
        id: ID
        createdAt: DateTime
        updatedAt: DateTime
        owner{
          id: ID
          name: String
          email: String
          phone: String
          role: String
        }: Owner
        match: Int
        sended: Int
        seen: Int
        targets: [String]
      }: [NotifySendLog]
      action{
        type: String
        link: String
        orderId: ID
        productId: ID
        ticketId: ID
      }: Action
      `);
  async sendAdminNotification(id: string, target: string): Promise<AdminNotification> {
    return await this.mutate({
      mutation: `sendAdminNotification(id:"${id}", target:$target) `,
      options: { variables: { target } },
      variablesParams: `($target:String!)`,
    }).then((res) => {
      return res.data["g0"];
    });
  }
  // async readNotification(id: string): Promise<Order> {
  //   return await this.mutate({
  //     mutation: `readNotification(notificationId: "${id}") {
  //           ${this.fullFragment}
  //         }`,
  //   }).then((res) => {
  //     return res.data["g0"];
  //   });
  // }
}

export const AdminNotificationService = new AdminNotificationRepository();

export type AdminNotificationActionType =
  | "NONE"
  | "WEBSITE"
  | "ORDER"
  | "PRODUCT"
  | "SUPPORT_TICKET";
export const ADMIN_NOTIFICATION_ACTION_TYPES: Option<AdminNotificationActionType>[] = [
  { value: "NONE", label: "Không", color: "slate" },
  { value: "WEBSITE", label: "Trang web", color: "info" },
  { value: "ORDER", label: "Đơn hàng", color: "orange" },
  { value: "PRODUCT", label: "Sản phẩm", color: "danger" },
  { value: "SUPPORT_TICKET", label: "Ticket", color: "purple" },
];
