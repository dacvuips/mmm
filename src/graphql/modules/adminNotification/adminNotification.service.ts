import { CrudService } from "../../../base/crudService";
import { AdminNotificationModel } from "./adminNotification.model";
import DataLoader from "dataloader";
import { countBy } from "lodash";
import { INotification } from "../notification/notification.model";
import { notificationService } from "../notification/notification.service";
class AdminNotificationService extends CrudService<typeof AdminNotificationModel> {
  constructor() {
    super(AdminNotificationModel);
  }
}

const adminNotificationService = new AdminNotificationService();

export {  adminNotificationService };