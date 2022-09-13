import {
  CustomerVoucherModel,
  CustomerVoucherStatus,
} from "../../../../graphql/modules/customerVoucher/customerVoucher.model";
import { logger } from "../../../../loaders/logger";

export default async function execute() {
  await CustomerVoucherModel.updateMany(
    {
      status: CustomerVoucherStatus.STILL_ALIVE,
      expiredDate: { $lte: new Date() },
    },
    { $set: { status: CustomerVoucherStatus.EXPIRED } }
  );
  logger.info(`Cập nhật khuyến mãi hết hạn`);
}
