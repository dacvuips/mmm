import { Job } from "agenda";
import moment from "moment-timezone";
import { configs } from "../../../configs";
import { CustomerModel, ICustomer } from "../../../graphql/modules/customer/customer.model";
import { Agenda } from "../../agenda";
import { BatchAsync } from "throttle-batch-size";
import { waitForCursor } from "../../../helpers/functions/cursor";
import { triggerService } from "../../../graphql/modules/trigger/trigger.service";
import { logger } from "../../../loaders/logger";
export class CheckCustomerBirthdayJob {
  static jobName = "CheckCustomerBirthday";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    console.log("Execute Job " + CheckCustomerBirthdayJob.jobName, moment().format());
    const today = moment().format("MM-DD");
    const cursor = CustomerModel.aggregate([
      { $match: { birthday: { $exists: true } } },
      {
        $addFields: {
          date: {
            $dateToString: { date: "$birthday", timezone: configs.timezone, format: "%m-%d" },
          },
        },
      },
      { $match: { date: today } },
    ])
      .cursor({})
      .exec();

    const batchAsync = new BatchAsync(async (customers: ICustomer[]) => {
      for (const customer of customers) {
        logger.info(`Check customer birthday ${customer.name}`);
        triggerService.emitEvent("customer:birthday", customer.memberId, {
          ...customer,
          sellerId: customer.memberId,
          buyerId: customer._id,
        });
      }
    });
    cursor.on("data", (data: any) => {
      batchAsync.feed(data);
    });

    await waitForCursor(cursor);
    cursor.close();
    batchAsync.complete();
  }
}

export default CheckCustomerBirthdayJob;
