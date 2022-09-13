import { SubscriptionRequestModel, ISubscriptionRequest } from "../subscriptionRequest.model";
import { logger } from "../../../../../loaders/logger";
import { PaymentStatus } from "../../../mixin/payment.graphql";
import { MemberModel } from "../../../member/member.model";
import { Plan, SubscriptionModel, ISubscription } from "../../subscription.model";
import moment from "moment-timezone";
import { ErrorHelper } from "../../../../../base/error";

export async function createNewSubscription(ctx: any) {
  const {
    input: { subscriptionRequestId },
  } = ctx;

  if (!subscriptionRequestId) throw ErrorHelper.requestDataInvalid("Thiếu thông tin để tạo gói");
  const subscriptionRequest = await SubscriptionRequestModel.findById(subscriptionRequestId);
  if (!subscriptionRequest) {
    // Không có request thanh toán, thì bỏ qua
    logger.info(`Bỏ qua thanh toán vì không tìm thấy yêu cầu,`, {
      requestId: subscriptionRequestId,
    });
    return;
  }

  if (subscriptionRequest.payment.status !== PaymentStatus.filled) {
    // Chưa hoàn tất thanh toán, thì bỏ qua
    logger.info(`Chưa hoàn tất thanh toán, bỏ qua tạo mới gói dịch vụ`);
    return;
  }

  const member = await MemberModel.findById(subscriptionRequest.memberId);
  const { subscription: currentSubscription } = member;

  ctx.meta = {
    ...ctx.meta,
    currentSubscription,
    subscriptionRequest,
  };
  // Tính toán thời gian hết hạn
  const expiredAt = await calculateExpireDay(ctx);
  const subscription = new SubscriptionModel({
    memberId: member._id,
    plan: subscriptionRequest.plan,
    expiredAt: expiredAt,
    fee: subscriptionRequest.amount,
    requestId: subscriptionRequest._id,
  });

  // Lưu thông tin subscription
  await subscription.save();
  await MemberModel.updateOne({ _id: member._id }, { $set: { subscription } });

  ctx.meta = {
    ...ctx.meta,
    currentSubscription,
    subscriptionRequest,
    subscription,
  };
  logger.info(`Đăng ký gói dịch vụ mới thành công`, { subscription });
}

export async function calculateExpireDay(ctx: any): Promise<Date> {
  const {
    meta: { currentSubscription, subscriptionRequest },
  }: {
    meta: {
      currentSubscription: ISubscription;
      subscriptionRequest: ISubscriptionRequest;
    };
  } = ctx;
  let expiredAt = moment()
    .add(1 * subscriptionRequest.months, "months")
    .add(subscriptionRequest.days, "days")
    .toDate();
  if (currentSubscription.plan == Plan.FREE) {
    // Đăng ký gói FREE, trả về 1 tháng kể từ hiện tại
    return expiredAt;
  }
  if (currentSubscription.plan !== subscriptionRequest.plan) {
    // Đăng ký gói khác, trả về 1 tháng kể từ hiện tại
    return expiredAt;
  }
  if (currentSubscription.lockedAt && moment().isAfter(currentSubscription.lockedAt)) {
    // Đăng kí gói cũ sau khi đã bị khóa, trả về 1 tháng kể từ hiện tại
    return expiredAt;
  }

  // Đăng kí gói cũ khi còn thời hạn, trả về 1 tháng cộng vào hạn
  return moment(currentSubscription.expiredAt)
    .add(1 * subscriptionRequest.months, "month")
    .add(subscriptionRequest.days, "days")
    .toDate();
}
