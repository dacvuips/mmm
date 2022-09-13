import { gql } from "apollo-server-express";
import moment from "moment-timezone";
import { SettingKey } from "../../../configs/settingData";
import { Context } from "../../context";
import { SettingHelper } from "../setting/setting.helper";
import { ISubscription } from "./subscription.model";

export default {
  schema: gql`
    extend type ShopSubscription {
      estimate: Mixed
    }
  `,
  resolver: {
    ShopSubscription: {
      estimate: async (root: ISubscription, args: any, context: Context) => {
        const { expiredAt, remindExpiredAt, lockedAt, remindLockAt } = root;
        const [stopPeriod] = await SettingHelper.loadMany([SettingKey.PLAN_STOP_PERIOD]);
        const estimateLockedAt = lockedAt || moment(expiredAt).add(stopPeriod, "days").toDate();
        return {
          expiredAt: expiredAt,
          remindExpiredAt: remindExpiredAt || moment(expiredAt).subtract(7, "days").toDate(),
          lockedAt: estimateLockedAt,
          remindLockAt: remindLockAt || moment(estimateLockedAt).subtract(3, "days").toDate(),
        };
      },
    },
  },
};
