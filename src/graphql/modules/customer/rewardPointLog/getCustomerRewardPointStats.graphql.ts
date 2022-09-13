import { gql } from "apollo-server-express";
import { Context } from "../../../context";
import { RewardPointLogStats } from "./loaders/rewardPointLogStats";

export default {
  schema: gql`
    type CustomerRewardPointStats {
      "Tổng điểm còn lại"
      total: Int
    }

    extend type Customer {
      rewardPointStats: CustomerRewardPointStats
    }
  `,
  resolver: {
    Customer: {
      rewardPointStats: async (root: any, args: any, context: Context) => {
        return await RewardPointLogStats.loader.load(root._id.toString());
      },
    },
  },
};
