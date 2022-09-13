import $ from "mongo-dot-notation";

import { momoSalary1 } from "../../../../../../helpers/momo/momoSalary";
import { DisbursePayoutStatus } from "../../disbursePayout.model";
import { ProcessDisbursePayoutContext } from "../common";

export default async function execute(ctx: ProcessDisbursePayoutContext) {
  const {
    input: { payout },
    meta: { payoutFileId },
  } = ctx;
  console.log("Kiểm tra danh sách chi");
  try {
    const watchStatus = async () => {
      return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
          momoSalary1
            .getPayoutFileStatus(payoutFileId)
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
    const payoutDetail = await momoSalary1.getPayoutFileDetail(payoutFileId);
    await payout.updateOne(
      $.flatten({
        processingMsg: `Hoàn tất kiểm tra danh sách chi`,
        meta: { detail: $.$set(payoutDetail) },
      })
    );
    console.log(`Hoàn tất kiểm tra danh sách chi`);
  } catch (err) {
    await payout.updateOne(
      $.flatten({
        processingMsg: `Lỗi khi kiểm tra danh sách chi. ${err.message}`,
        status: DisbursePayoutStatus.error,
      })
    );
    throw err;
  }
}
