import { SubscriptionRequestModel } from "../subscriptionRequest.model";
import { logger } from "../../../../../loaders/logger";
import { notFoundHandler } from "../../../../../helpers/functions/notFoundHandler";
import { WalletModel } from "../../../wallet/wallet.model";
import { WalletTransactionType } from "../../../wallet/walletTransaction/walletTransaction.model";
import { walletTransactionService } from "../../../wallet/walletTransaction/walletTransaction.service";
import { PaymentStatus } from "../../../mixin/payment.graphql";
import { UtilsHelper } from "../../../../../helpers";
import { createNewSubscription } from "./createNewSubscription";
import { Plan } from "../../subscription.model";

export async function subscriptionPaymentHandlerWallet(ctx: {
  input: { subscriptionRequestId: string };
}) {
  const {
    input: { subscriptionRequestId },
  } = ctx;
  const subscriptionRequest = await SubscriptionRequestModel.findById(subscriptionRequestId);
  if (!subscriptionRequest) {
    // Không có request thanh toán, thì bỏ qua
    logger.info(`Bỏ qua thanh toán vì không tìm thấy yêu cầu,`, {
      requestId: subscriptionRequestId,
    });
    return;
  }

  try {
    if (subscriptionRequest.plan === Plan.FREE) {
      // Cập nhật yêu cầu thanh toán
      await SubscriptionRequestModel.updateOne(
        { _id: subscriptionRequest._id },
        {
          $set: {
            "payment.status": PaymentStatus.filled,
            "payment.filledAmount": 0,
          },
        }
      );
    } else {
      //  Tạo thanh toán
      const wallet = await notFoundHandler(
        await WalletModel.findOne({ "owner._id": subscriptionRequest.memberId })
      );

      const data: any = {
        walletId: wallet.id,
        type: WalletTransactionType.TRANSFER,
        amount: subscriptionRequest.amount,
        tag: "subscription",
        note: `Thanh toán gói dịch vụ ${subscriptionRequest.plan}. Mã yêu cầu: ${subscriptionRequest.name}`,
        extra: {
          subscriptionRequestId: subscriptionRequest._id,
          subscriptionRequestName: subscriptionRequest.name,
          plan: subscriptionRequest.plan,
          memberId: subscriptionRequest.memberId,
          type: "wallet",
        },
      };
      const transaction = await walletTransactionService.newTransferTransactionToGlobalWallet(data);
      if (!transaction) throw new Error("Thanh toán gói không thành công. Lỗi giao dịch");
      // Thanh toán thành công
      subscriptionRequest.payment.status = PaymentStatus.filled;
      subscriptionRequest.payment.filledAmount = Math.abs(transaction.amount);

      // Tạo log thanh toán
      const log = {
        message: `Thanh toán thành công qua Ví. Số tiền: ${UtilsHelper.toMoney(
          transaction.amount
        )}`,
        createdAt: new Date(),
        meta: {
          walletTransaction: {
            _id: transaction._id,
            amount: transaction.amount,
            code: transaction.code,
          },
        },
      };
      // Cập nhật yêu cầu thanh toán
      await SubscriptionRequestModel.updateOne(
        { _id: subscriptionRequest._id },
        {
          $set: {
            "payment.status": subscriptionRequest.payment.status,
            "payment.filledAmount": subscriptionRequest.payment.filledAmount,
          },
          $push: { "payment.logs": log },
        }
      );
    }
  } catch (err) {
    // Thanh toán thất bại
    const log = {
      message: err.message,
      createdAt: new Date(),
      meta: "Thanh toán gói không thành công. Xảy ra lỗi trong quá trình thanh toán gói",
    };
    // Cập nhật yêu cầu thanh toán
    await SubscriptionRequestModel.updateOne(
      { _id: subscriptionRequest._id },
      {
        $set: {
          "payment.status": PaymentStatus.rejected,
        },
        $push: { "payment.logs": log },
      }
    );
  }
  await createNewSubscription(ctx);
}
