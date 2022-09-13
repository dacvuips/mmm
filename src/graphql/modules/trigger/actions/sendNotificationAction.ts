import { UtilsHelper } from "../../../../helpers";
import { CustomerLoader } from "../../customer/customer.model";
import {
  InsertNotification,
  NotificationTarget,
  NotificationType,
} from "../../notification/notification.model";
import { NotificationBuilder } from "../../notification/notificationBuilder";
import { TriggerActionModule } from "./common";

export default {
  type: "notification",
  handler: async (options = {}, context = {}) => {
    const { buyerId } = context;

    if (!buyerId) return;
    const customer = await CustomerLoader.load(buyerId);
    if (!customer) return;
    const parsedOptions = UtilsHelper.parseObjectWithInfo({ object: options, info: context });

    const { title, body, action } = parsedOptions;

    const builder = new NotificationBuilder(title, body).sendTo(
      NotificationTarget.CUSTOMER,
      customer.id
    );
    if (action && action.active) {
      switch (action.type) {
        case NotificationType.WEBSITE:
          builder.web(action.link);
          break;
        case NotificationType.ORDER:
          builder.order(action.orderId);
          break;
        case NotificationType.PRODUCT:
          builder.product(action.productId);
          break;
      }
    }
    const notify = builder.build();
    InsertNotification([notify]);
  },
} as TriggerActionModule;
