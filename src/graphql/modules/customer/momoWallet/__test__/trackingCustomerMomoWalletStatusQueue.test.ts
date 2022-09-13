import { sleep } from "../../../../../helpers/functions/sleep";
import { trackingMomoWalletStatusQueue } from "../trackingCustomerMomoWalletStatus.queue";

export default test("Tracking Customer Momo Wallet Status Queue", async () => {
  const queue = await trackingMomoWalletStatusQueue.queue();

  const job = await queue.createJob({}).save();

  await sleep(30000);

  console.log("done");
}, 60000);
