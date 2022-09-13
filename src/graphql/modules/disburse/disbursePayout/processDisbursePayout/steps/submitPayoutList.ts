import { ProcessDisbursePayoutContext } from "../common";
import $ from "mongo-dot-notation";
import { DisbursePayoutModel, DisbursePayoutStatus } from "../../disbursePayout.model";
import { momoSalary1 } from "../../../../../../helpers/momo/momoSalary";
import { disbursePayoutService } from "../../disbursePayout.service";
export default async function execute(ctx: ProcessDisbursePayoutContext) {
  const {
    input: { payout },
    meta: { payoutFileId },
  } = ctx;
  console.log("Gửi yêu cầu chi");
  try {
    await momoSalary1.submitPayoutList(payoutFileId);
    await payout.updateOne(
      $.flatten({
        status: DisbursePayoutStatus.pending,
        processingMsg: `Đã gửi yêu cầu chi`,
      })
    );
    setTimeout(() => {
      DisbursePayoutModel.findById(payout._id).then((res) => {
        console.log("Cập nhật trạng thái payout");
        disbursePayoutService.updatePayoutDetail(res);
      });
    }, 5000);
  } catch (err) {
    await payout.updateOne(
      $.flatten({
        processingMsg: `Lỗi khi gửi yêu cầu chi. ${err.message}`,
        status: DisbursePayoutStatus.error,
      })
    );
    throw err;
  }
}
