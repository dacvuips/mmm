import { Job } from "agenda";
import moment from "moment-timezone";
import { logger } from "../../../loaders/logger";
import { Agenda } from "../../agenda";
import trackingCustomerMomoWalletStatus from "./steps/trackingCustomerMomoWalletStatus";
import updateExpiredCustomerVoucher from "./steps/updateExpiredCustomerVoucher";

export class DailyJob {
  static jobName = "Daily";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    console.log("Execute Job " + DailyJob.jobName, moment().format());

    try {
      await updateExpiredCustomerVoucher();
      await trackingCustomerMomoWalletStatus();
    } catch (err) {
      logger.error(`Lỗi khi xử lý job hàng ngày`, err);
    }
  }
}

export default DailyJob;
