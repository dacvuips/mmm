import { trackingMomoWalletStatusQueue } from "../../../../graphql/modules/customer/momoWallet/trackingCustomerMomoWalletStatus.queue";
import { logger } from "../../../../loaders/logger";

export default async function execute() {
  try {
    await trackingMomoWalletStatusQueue.queue().createJob({}).save();
  } catch (err) {
    logger.error(`Lỗi khi kiểm tra trạng thái ví momo hàng ngày`, err);
  }
}
