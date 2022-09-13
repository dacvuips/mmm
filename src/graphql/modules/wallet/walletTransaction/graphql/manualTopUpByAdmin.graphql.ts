import { gql } from "apollo-server-express";
import { Context } from "../../../../context";
import { ROLES } from "../../../../../constants/role.const";
import _ from "lodash";
import { WalletTransactionType } from "../walletTransaction.model";
import { walletTransactionService } from "../walletTransaction.service";

export default {
  schema: gql`
    extend type Mutation {
      manualTopUpByAdmin(data: manualTopUpByAdminInput!): WalletTransaction
    }

    input manualTopUpByAdminInput {
      "Mã ví"
      walletId: String!
      "Số tiền"
      amount: Float!
    }
  `,
  resolver: {
    Mutation: {
      manualTopUpByAdmin: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.ADMIN]);

        const { data } = args;
        _.set(data, "tag", "admin:manualTopUp");
        _.set(data, "amount", Math.abs(data.amount));
        _.set(data, "note", "Nạp tiền vào tài khoản bởi Admin");
        _.set(data, "type", WalletTransactionType.DEPOSIT);
        return await walletTransactionService.newTransaction(data);
      },
    },
  },
};
