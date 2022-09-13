import _ from "lodash";

import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../context";
import { WalletLoader } from "../wallet.model";
import { walletTransactionService } from "./walletTransaction.service";

const Query = {
  getAllWalletTransaction: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const walletId = _.get(args, "q.filter.walletId");
    if (!walletId) {
      throw new Error("walletId is required");
    }
    const wallet = await WalletLoader.load(walletId);

    // check permission
    if (!(context.isAdmin() || context.isEditor())) {
      const ownerId = context.isStaff() ? context.sellerId : context.id;
      if (!wallet || wallet.owner._id.toString() != ownerId.toString()) {
        throw new Error("wallet not found");
      }
    }
    return walletTransactionService.fetch(args.q);
  },
};

const WalletTransaction = {};

export default {
  Query,
  WalletTransaction,
};
