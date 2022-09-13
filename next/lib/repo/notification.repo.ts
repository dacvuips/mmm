import { BaseModel, CrudRepository } from "./crud.repo";
import { Customer } from "./customer.repo";
import { Member } from "./member.repo";
import { Order } from "./order.repo";
import { Product } from "./product.repo";
import { Staff } from "./staff.repo";
import { SupportTicket } from "./support-ticket.repo";

export type Notification = BaseModel & {
  id: string;
  createdAt: string;
  updatedAt: string;
  target: string; //Gửi tới MEMBER,STAFF,CUSTOMER
  memberId: string;
  staffId: string;
  customerId: string;
  title: string; //Tiêu đề thông báo
  body: string; //Nội dung thông báo
  type: "MESSAGE" | "ORDER" | "PRODUCT" | "WEBSITE" | "SUPPORT_TICKET"; //Loại thông báo MESSAGE,ORDER,PRODUCT,WEBSITE
  seen; //Đã xem
  seenAt: string; //Ngày xem
  image: string;
  sentAt: string; //Ngày gửi
  orderId: string;
  productId: string;
  link: string; //Link website
  member: Member;
  staff: Staff;
  customer: Customer;
  order: Order;
  product: Product;
  ticketId: string;
  ticket: SupportTicket;
};

export class NotificationRepository extends CrudRepository<Notification> {
  apiName: string = "Notification";
  displayName: string = "Notification";
  shortFragment: string = `
        id
        createdAt
        updatedAt
        target
        memberId
        staffId
        customerId
        title
        body
        type
        seen
        seenAt
        image
        sentAt
        orderId
        productId
        link
        member {
          id 
        }
        staff  {
          id 
          name
        }
        customer  {
          id 
          name
        }
        order {
          id
          code
          status
        }
        product {
          id
        }
        ticketId
        ticket{
          id
        }
      `;
  fullFragment: string = `
        id
        createdAt
        updatedAt
        target
        memberId
        staffId
        customerId
        title
        body
        type
        seen
        seenAt
        image
        sentAt
        orderId
        productId
        link
        member {
          id 
        }
        staff {
          id 
          name
        }
        customer  {
          id 
          name
        }
        order {
          id
          code
          status
        }
        product {
          id
        }
        ticketId
        ticket{
          id
        }
      `;
  async readNotification(id: string): Promise<Order> {
    return await this.mutate({
      mutation: `readNotification(notificationId: "${id}") {
            ${this.fullFragment}
          }`,
      clearStore: true,
    }).then((res) => {
      return res.data["g0"];
    });
  }
  async readAllNotification(): Promise<boolean> {
    return await this.mutate({
      mutation: `readAllNotification`,
      clearStore: true,
    }).then((res) => {
      return res.data["g0"];
    });
  }
}

export const NotificationService = new NotificationRepository();
