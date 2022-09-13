import DataLoader from "dataloader";
import { get, keyBy } from "lodash";
import { Types } from "mongoose";

import { CommissionLogModel } from "../graphql/modules/commissionLog/commissionLog.model";
import { CustomerModel } from "../graphql/modules/customer/customer.model";
import { ttlCache } from "../helpers/ttlCache";

export const CustomerCommissionLoader = new DataLoader<
  string,
  { commission: number; order: number }
>(
  (ids: string[]) => {
    const objectIds = ids.map(Types.ObjectId);
    return CommissionLogModel.aggregate([
      { $match: { customerId: { $in: objectIds } } },
      {
        $group: {
          _id: "$customerId",
          commission: { $sum: "$value" },
          totalCommission: { $sum: { $cond: [{ $gt: ["$value", 0] }, "$value", 0] } },
          totalDisburse: { $sum: { $cond: [{ $lt: ["$value", 0] }, "$value", 0] } },
          order: { $sum: { $cond: [{ $not: ["$orderId"] }, 0, 1] } },
        },
      },
    ])
      .then((list) => {
        const bulk = CustomerModel.collection.initializeUnorderedBulkOp();
        list.forEach((l) => {
          bulk.find({ _id: Types.ObjectId(l._id) }).updateOne({
            $set: {
              "context.commission": l.commission,
              "context.commissionOrder": l.order,
              "context.commissionTotal": l.totalCommission,
              "context.commissionDisburse": l.totalDisburse,
            },
          });
        });
        if (bulk.length > 0) {
          bulk.execute().catch((err) => {});
        }
        return list;
      })
      .then((list) => {
        const keyByIds = keyBy(list, "_id");
        return ids.map((id) => get(keyByIds, id, { commission: 0, order: 0 }));
      });
  },
  { cache: true, cacheMap: ttlCache({ ttl: 30000, maxSize: 100 }) }
);
