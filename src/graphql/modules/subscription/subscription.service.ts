import moment from "moment-timezone";

import { CrudService } from "../../../base/crudService";
import { SettingKey } from "../../../configs/settingData";
import { MainConnection } from "../../../loaders/database";
import { MemberModel } from "../member/member.model";
import { SettingHelper } from "../setting/setting.helper";
import { ISubscription, Plan, SubscriptionModel } from "./subscription.model";

class SubscriptionService extends CrudService<typeof SubscriptionModel> {
  constructor() {
    super(SubscriptionModel);
  }

  async addFreePlan(memberId: string) {
    const session = await MainConnection.startSession();
    try {
      let plan: ISubscription;
      await session.withTransaction(async (session) => {
        const [freePeriod] = await SettingHelper.loadMany([SettingKey.PLAN_FREE_PERIOD]);
        plan = new SubscriptionModel({
          memberId: memberId,
          plan: Plan.FREE,
          expiredAt: moment().add(freePeriod, "day").endOf("day").toDate(),
          fee: 0,
        });
        await plan.save({ session });
        await MemberModel.updateOne(
          { _id: memberId },
          { $set: { subscription: plan, locked: false } },
          { session }
        ).exec();
      });
      return plan;
    } finally {
      session.endSession();
    }
  }
}

const subscriptionService = new SubscriptionService();

export { subscriptionService };
