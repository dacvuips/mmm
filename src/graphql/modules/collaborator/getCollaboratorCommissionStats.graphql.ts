import { gql } from "apollo-server-express";
import DataLoader from "dataloader";
import { get, keyBy, set } from "lodash";
import { Types } from "mongoose";
import { UtilsHelper } from "../../../helpers";
import { Context } from "../../context";
import { CommissionLogModel } from "../commissionLog/commissionLog.model";
import { CollaboratorModel, ICollaborator } from "./collaborator.model";

export default {
  schema: gql`
    extend type Collaborator {
      commissionStats(fromDate: String, toDate: String): CollaboratorCommissionStats
    }
    type CollaboratorCommissionStats {
      _id: String
      "Tổng hoa hồng còn lại"
      commission: Float
      "Tổng hoa hồng"
      totalCommission: Float
      "Tổng hoa hồng đã chi"
      totalDisburse: Float
    }
  `,
  resolver: {
    Collaborator: {
      commissionStats: async (root: ICollaborator, args: any, context: Context) => {
        const { fromDate, toDate } = args;
        return getLoader(fromDate, toDate).load(root._id.toString());
      },
    },
  },
};

const loaders = new Map<string, DataLoader<string, any>>();

const getLoader = (fromDate: string, toDate: string) => {
  const hash = fromDate + toDate;
  const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate);
  if (!loaders.has(hash)) {
    loaders.set(
      hash,
      new DataLoader<string, any>(
        async (ids) => {
          const objectIds = ids.map(Types.ObjectId);
          let collaborators = await CollaboratorModel.aggregate([
            {
              $match: {
                _id: { $in: objectIds },
              },
            },
            {
              $group: {
                _id: "$_id",
                memberId: { $first: "$memberId" },
                customerId: { $first: "$customerId" },
              },
            },
          ]);
          const listCollaborators = keyBy(collaborators, "customerId");

          const $match: any = {};
          if (fromDate && $gte) set($match, "createdAt.$gte", $gte);
          if (toDate && $lte) set($match, "createdAt.$lte", $lte);
          set($match, "memberId", collaborators[0].memberId);
          set($match, "customerId.$in", collaborators.map((c) => c.customerId).map(Types.ObjectId));
          const query = [
            { $match: $match },
            {
              $group: {
                _id: "$customerId",
                commission: { $sum: "$value" },
                totalCommission: { $sum: { $cond: [{ $gt: ["$value", 0] }, "$value", 0] } },
                totalDisburse: { $sum: { $cond: [{ $lt: ["$value", 0] }, { $abs: "$value" }, 0] } },
              },
            },
          ];
          return await CommissionLogModel.aggregate(query).then((list) => {
            list.map((eachElement) => {
              let collaborator = get(listCollaborators, eachElement._id, { _id: 0 });
              return (eachElement._id = collaborator._id);
            });
            const listKeyBy = keyBy(list, "_id");
            return ids.map((id) =>
              get(listKeyBy, id, { commission: 0, totalCommission: 0, totalDisburse: 0 })
            );
          });
        },
        { cache: false } // Bỏ cache
      )
    );
  }
  return loaders.get(hash);
};
