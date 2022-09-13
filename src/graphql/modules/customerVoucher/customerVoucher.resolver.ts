import { set } from "lodash";

import { ROLES } from "../../../constants/role.const";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { ShopVoucherLoader } from "../shop/shopVoucher/shopVoucher.model";
import { customerVoucherService } from "./customerVoucher.service";

const Query = {
  getAllCustomerVoucher: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    if (context.isCustomer()) {
      set(args, "q.filter.customerId", context.id);
      set(args, "q.filter.status", "STILL_ALIVE");
      set(args, "q.filter.$or", [
        { expiredDate: { $exists: false } },
        { expiredDate: null },
        { expiredDate: { $gt: new Date() } },
      ]);
    }
    return customerVoucherService.fetch(args.q);
  },
  getOneCustomerVoucher: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    return await customerVoucherService.findOne({ _id: id });
  },
};

const CustomerVoucher = {
  voucher: GraphQLHelper.loadById(ShopVoucherLoader, "voucherId"),
};

export default {
  Query,
  CustomerVoucher,
};
