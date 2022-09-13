import { gql } from "apollo-server-express";
import moment from "moment-timezone";

import { ROLES } from "../../../constants/role.const";
import { Context } from "../../context";
import { counterService } from "../counter/counter.service";
import { PaymentStatus } from "../mixin/payment.graphql";
import { PaymentMethod } from "../order/order.model";
import { Plan } from "./subscription.model";
import {
  calculateSubscriptionFee,
  validSubscriptionRequestInput,
} from "./subscriptionRequest/createSubscriptionRequest";
import { createNewSubscription } from "./subscriptionRequest/paymentHandler/createNewSubscription";
import { SubscriptionRequestModel } from "./subscriptionRequest/subscriptionRequest.model";

export default {
  schema: gql`
    extend type Mutation {
      extendSubscription(data: ExtendSubscriptionInput!): ShopSubscription
    }
    input ExtendSubscriptionInput {
        "Id cửa hàng"
        memberId: ID!
        "Gói yêu cầu ${Object.values([Plan.FREE, Plan.BASIC, Plan.PROFESSIONAL])}"
        plan: String!
        "Số tháng đăng ký"
        months: Int
        "Số ngày đăng ký"
        days: Int
    }
  `,
  resolver: {
    Mutation: {
      extendSubscription: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const {
          data: { memberId, plan, months, days },
        } = args;
        const ctx = {
          input: {
            memberId: memberId,
            plan: plan,
            months: months,
            days: days,
          },
        };
        return await extendSubscription(ctx);
      },
    },
  },
};

async function extendSubscription(ctx: any) {
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

  // Dữ liệu thanh toán
  request.payment = {
    method: PaymentMethod.NONE,
    status: PaymentStatus.filled,
    filledAmount: fee,
    logs: [{ message: `Admin: Gia hạn thủ công`, createdAt: new Date() }],
  };

  await request.save();

  ctx.input.subscriptionRequestId = request._id;
  //Thanh toán Wallet
  await createNewSubscription(ctx);
  const {
    meta: { subscription },
  } = ctx;
  return subscription;
}
