import moment from "moment-timezone";

import { BaseError, ErrorHelper } from "../../../../base/error";
import { SettingKey } from "../../../../configs/settingData";
import { logger } from "../../../../loaders/logger";
import { counterService } from "../../counter/counter.service";
import { MemberModel } from "../../member/member.model";
import { PaymentLog, PaymentStatus } from "../../mixin/payment.graphql";
import { PaymentMethod } from "../../order/order.model";
import { SettingHelper } from "../../setting/setting.helper";
import { Plan } from "../subscription.model";
import { subscriptionPaymentHandlerWallet } from "./paymentHandler/subscriptionPaymentHandlerWallet";
import { SubscriptionRequestModel } from "./subscriptionRequest.model";

export async function calculateSubscriptionFee(plan: any, months: number) {
  const [basicFee, professionalFee] = await Promise.all([
    SettingHelper.load(SettingKey.PLAN_BASIC_FEE),
    SettingHelper.load(SettingKey.PLAN_PROFESSIONAL_FEE),
  ]);

  // Xác định phí dịch vụ
  let fee = 0;
  if (plan == Plan.BASIC) fee = basicFee * months;
  if (plan == Plan.PROFESSIONAL) fee = professionalFee * months;
  return fee;
}

export function validSubscriptionPlan(plan: any) {
  if (![Plan.FREE, Plan.BASIC, Plan.PROFESSIONAL].includes(plan)) {
    throw ErrorHelper.requestDataInvalid("field Plan sai");
  }
}

export async function validSubscriptionRequestInput(ctx: any) {
  const {
    input: { memberId, plan, months, days },
  } = ctx;
  // check memberId
  if (!memberId) throw ErrorHelper.requestDataInvalid("Thiếu thông tin để tạo gói");
  const member = await MemberModel.findById(memberId);
  if (!member) throw new BaseError(403, "not-found", "Mã chủ shop không đúng");

  // check plan
  validSubscriptionPlan(plan);

  // check inputMonths

  let validMonths;
  if (!months || isNaN(months)) validMonths = 1;
  else validMonths = Math.abs(months);
  return {
    member: member,
    plan: plan,
    months: validMonths,
    days: days || 0,
  };
}

export async function createSubscriptionRequestProcess(ctx: any) {
  const {
    input: { paymentLogMessage },
  } = ctx;
  const { member, plan, months, days } = await validSubscriptionRequestInput(ctx);
  let fee = await calculateSubscriptionFee(plan, months);
  // Khởi tạo yêu cầu đăng ký
  const request = new SubscriptionRequestModel({
    name: await counterService.trigger(`subscriptio-request`).then((res) => `GH` + res),
    memberId: member._id,
    plan: plan,
    amount: fee,
    months: months,
    days: days,
    expiredAt: moment().add(10, "minute").toDate(), // Hết hạn sau 10 phút
  });

  // Tạo log
  let logMessage = `Tạo yêu cầu thanh toán gói thủ công`;
  if (paymentLogMessage) logMessage = paymentLogMessage;
  const log = {
    message: logMessage,
    createdAt: new Date(),
  } as PaymentLog;
  request.payment = {
    method: PaymentMethod.WALLET,
    status: PaymentStatus.pending,
    logs: [log],
  };
  logger.info(`Tạo yêu cầu thanh toán gói dịch vụ`, { request });
  // lưu kết quả
  await request.save();

  ctx.input.subscriptionRequestId = request._id;
  //Thanh toán Wallet
  await subscriptionPaymentHandlerWallet(ctx);

  // Trả về kết quả
  return await SubscriptionRequestModel.findById(request._id);
}
