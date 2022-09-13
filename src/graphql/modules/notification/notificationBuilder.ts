import { Action, ActionType } from "../mixin/action.graphql";
import { IOrder } from "../order/order.model";
import {
  INotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "./notification.model";

export class NotificationBuilder {
  data: INotification;
  constructor(title: string, body: string) {
    this.data = new NotificationModel({ title, body, type: NotificationType.MESSAGE });
  }
  web(link: string) {
    this.data.type = NotificationType.WEBSITE;
    this.data.link = link;
    return this;
  }
  order(orderId: string) {
    this.data.type = NotificationType.ORDER;
    this.data.orderId = orderId;
    return this;
  }
  product(productId: string) {
    this.data.type = NotificationType.PRODUCT;
    this.data.productId = productId;
    return this;
  }

  supportTicket(ticketId: string) {
    this.data.type = NotificationType.SUPPORT_TICKET;
    this.data.ticketId = ticketId;
    return this;
  }

  action(action: Action) {
    switch (action.type) {
      case ActionType.ORDER:
        this.order(action.orderId);
        break;
      case ActionType.PRODUCT:
        this.product(action.productId);
        break;
      case ActionType.SUPPORT_TICKET:
        this.supportTicket(action.ticketId);
        break;
      case ActionType.WEBSITE:
        this.web(action.link);
        break;
    }
    return this;
  }

  sendTo(target: NotificationTarget, id: string) {
    this.data.target = target;
    switch (target) {
      case NotificationTarget.CUSTOMER:
        this.data.customerId = id;
        break;
      case NotificationTarget.MEMBER:
        this.data.memberId = id;
        break;
      case NotificationTarget.STAFF:
        this.data.staffId = id;
        break;
      case NotificationTarget.USER:
        this.data.userId = id;
    }
    return this;
  }
  build() {
    return this.data;
  }
}
