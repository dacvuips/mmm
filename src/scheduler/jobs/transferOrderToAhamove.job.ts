import { Job } from "agenda";
import moment from "moment-timezone";
import { transferOrderToAhamove } from "../../graphql/modules/order/ahamove/transferOrderToAhamove";
import { OrderModel, OrderStatus } from "../../graphql/modules/order/order.model";
import { logger } from "../../loaders/logger";
import { Agenda } from "../agenda";

export class TransferOrderToAhamoveJob {
  static jobName = "TransferOrderToAhamove";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    console.log("Execute Job " + TransferOrderToAhamoveJob.jobName, moment().format());
    const { orderId } = job.attrs.data;
    const order = await OrderModel.findById(orderId);

    if (order.status == OrderStatus.PENDING) {
      try {
        await transferOrderToAhamove(order);
      } catch (err) {
        logger.error(`Lỗi khi chuyển đơn Ahamove tự động`, err);
      }
    }

    await job.remove();
  }
}

export default TransferOrderToAhamoveJob;
