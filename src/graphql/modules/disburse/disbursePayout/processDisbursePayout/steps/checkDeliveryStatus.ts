import { DeliveryStatus } from "momo-salary";
import $ from "mongo-dot-notation";
import { Types } from "mongoose";

import { momoSalary1 } from "../../../../../../helpers/momo/momoSalary";
import { DisburseItemModel, DisburseItemStatus } from "../../../disburseItem/disburseItem.model";
import { DisbursePayoutStatus } from "../../disbursePayout.model";
import { ProcessDisbursePayoutContext } from "../common";

export default async function execute(ctx: ProcessDisbursePayoutContext) {
  const {
    input: { payout },
    meta: { deliveryFileId },
  } = ctx;
  console.log("Kiểm tra danh sách nhận");
  try {
    const watchStatus = async () => {
      return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
          momoSalary1
            .getDeliveryFileStatus(deliveryFileId)
            .then((status) => {
              if (status.resultCode == 0) {
                // Hoàn thành xử lý
                clearInterval(interval);
                resolve(status);
              }
            })
            .catch((err) => {
              reject(err);
            });
        }, 10000); // 10s kiểm tra 1 lần
      });
    };
    await watchStatus();
    await payout.updateOne(
      $.flatten({
        processingMsg: `Hoàn tất kiểm tra danh sách nhận`,
      })
    );

    let total = 0;
    let count = 0;
    let page = 1;
    const bulk = DisburseItemModel.collection.initializeUnorderedBulkOp();
    do {
      const result = await momoSalary1.getAllDeliveryList({
        fileId: deliveryFileId,
        page: page++,
        size: 1000,
      });
      total = result.total;
      count += result.data.length;
      for (const item of result.data) {
        try {
          const extra = JSON.parse(item.extra);
          if (item.status != DeliveryStatus.valid) {
            bulk.find({ _id: Types.ObjectId(extra.itemId) }).updateOne(
              $.flatten({
                status: DisburseItemStatus.failed,
                payoutId: $.$unset(),
                meta: {
                  deliveryStatus: item.status,
                  statusName: item.statusName,
                },
              })
            );
          } else {
            bulk.find({ _id: Types.ObjectId(extra.itemId) }).updateOne(
              $.flatten({
                payoutId: payout._id,
                status: DisburseItemStatus.pending,
                meta: { deliveryStatus: item.status, statusName: item.statusName },
              })
            );
          }
        } catch (err) {
          console.log("Lỗi xử lý dữ liệu người nhận", err.message);
        }
      }
    } while (total > 0 && count < total);
    if (bulk.length > 0) {
      await bulk.execute();
    }
    console.log(`Hoàn tất kiểm tra danh sách nhận`);
  } catch (err) {
    await payout.updateOne(
      $.flatten({
        processingMsg: `Lỗi khi kiểm tra danh sách người nhận. ${err.message}`,
        status: DisbursePayoutStatus.error,
      })
    );
    throw err;
  }
}
