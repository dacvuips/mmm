import { Job } from "bee-queue";
import { BaseQueue } from "../../../../../queues/queue";
import { DisbursePayoutModel, IDisbursePayout } from "../disbursePayout.model";
import { ProcessDisbursePayoutContext } from "./common";
import checkDeliveryStatus from "./steps/checkDeliveryStatus";
import checkPayoutDetail from "./steps/checkPayoutDetail";
import ensureDisburse from "./steps/ensureDisburse";
import submitPayoutList from "./steps/submitPayoutList";
import uploadDeliveryList from "./steps/uploadDeliveryList";
import uploadPayoutList from "./steps/uploadPayoutList";

class ProcessDisbursePayoutQueue extends BaseQueue {
  constructor() {
    super("process-disburse-payout-queue");
  }

  protected async process(job: Job<IDisbursePayout>) {
    const payout = DisbursePayoutModel.hydrate(job.data);
    const ctx: ProcessDisbursePayoutContext = {
      input: { payout },
      meta: {},
    };
    try {
      await ensureDisburse(ctx);
      await uploadDeliveryList(ctx);
      await checkDeliveryStatus(ctx);
      await uploadPayoutList(ctx);
      await checkPayoutDetail(ctx);
      await submitPayoutList(ctx);

      console.log("Hoàn tất xử lý đợt chi", payout.name);
    } catch (err) {
      console.log(`Lỗi khi xử lý Đợt chi ${payout._id}`, err.message || err);
      throw err;
    }
  }
}

export default new ProcessDisbursePayoutQueue();
