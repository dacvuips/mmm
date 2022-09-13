import DataLoader from "dataloader";
import _ from "lodash";
import { Types } from "mongoose";
import { ttlCache } from "../../../../../helpers/ttlCache";
import { RewardPointLogModel } from "../rewardPointLog.model";

export class RewardPointLogStats {
  total = 0;

  static loader = new DataLoader<string, RewardPointLogStats>(
    (ids: string[]) => {
      const objectIds = ids.map(Types.ObjectId);
      return RewardPointLogModel.aggregate([
        { $match: { customerId: { $in: objectIds } } },
        { $group: { _id: "$customerId", total: { $sum: "$value" } } },
      ]).then((res) => {
        const keyByIds = _.keyBy(res, "_id");
        return ids.map((id) => _.get(keyByIds, id, new RewardPointLogStats()));
      });
    },
    { cache: true, cacheMap: ttlCache({ ttl: 10000, maxSize: 100 }) }
  );
}
