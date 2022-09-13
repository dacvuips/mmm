import { Job } from "agenda";
import moment from "moment-timezone";
import { Agenda } from "../agenda";
import { MemberModel } from "../../graphql/modules/member/member.model";
import { BatchAsync } from "throttle-batch-size";
import { waitForCursor } from "../../helpers/functions/cursor";
import { OrderModel } from "../../graphql/modules/order/order.model";
import { Types } from "mongoose";

export class UpdateMemberTotalOrderJob {
  static jobName = "UpdateMemberTotalOrder";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    console.log("Execute Job " + UpdateMemberTotalOrderJob.jobName, moment().format());
    // reset old data
    await MemberModel.updateMany({}, { $unset: { "context.totalOrderLast7Days": 1 } });

    // calculate new data
    const last7Days = moment().subtract(7, "days").toDate();
    const cursor = OrderModel.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: "$sellerId",
          totalOrder: { $sum: 1 },
        },
      },
    ])
      .cursor({})
      .exec();

    const batchAsync = new BatchAsync(
      async (totalOrderDataList: [{ _id: string; totalOrder: number }]) => {
        const bulk = MemberModel.collection.initializeUnorderedBulkOp();
        totalOrderDataList.forEach((totalOrderData) => {
          bulk.find({ _id: Types.ObjectId(totalOrderData._id) }).updateOne({
            $set: {
              "context.totalOrderLast7Days": totalOrderData.totalOrder,
            },
          });
        });
        if (bulk.length > 0) {
          bulk.execute().catch((err) => {});
        }
      }
    );
    cursor.on("data", (data: any) => {
      batchAsync.feed(data);
    });

    await waitForCursor(cursor);
    cursor.close();
    batchAsync.complete();
  }
}

export default UpdateMemberTotalOrderJob;
