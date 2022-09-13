import _ from "lodash";

import { ROLES } from "../../../constants/role.const";
import { Context } from "../../context";
import { walletService } from "./wallet.service";

const Query = {
  getAllWallet: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    _.set(args, "q.filter.owner._id", context.id);
    if (context.isStaff()) {
      _.set(args, "q.filter.owner._id", context.sellerId);
    }
    return walletService.fetch(args.q);
  },
  getOneWallet: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    const ownerId = context.isStaff() ? context.sellerId : context.id;
    return await walletService.findOne({ _id: id, "owner._id": ownerId });
  },
};

const Wallet = {};

export default {
  Query,
  Wallet,
};
