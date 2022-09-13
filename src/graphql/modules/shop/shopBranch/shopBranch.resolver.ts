import { set, times } from "lodash";
import { ErrorHelper } from "../../../../base/error";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { addressService } from "../../address/address.service";
import { counterService } from "../../counter/counter.service";
import { OperatingTimeStatus } from "./operatingTime.graphql";
import { ShopBranchModel } from "./shopBranch.model";
import { shopBranchService } from "./shopBranch.service";

const Query = {
  getAllShopBranch: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ANONYMOUS_CUSTOMER_MEMBER_STAFF);
    if (context.sellerId) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    return shopBranchService.fetch(args.q);
  },
  getOneShopBranch: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await shopBranchService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopBranch: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    data.memberId = context.sellerId;
    data.operatingTimes = times(7, (i) => ({
      day: i + 1,
      timeFrames: [["07:00", "22:00"]],
      status: OperatingTimeStatus.OPEN,
    }));
    if (!data.code) {
      data.code = await counterService.trigger("shopBranch").then((res) => "CN" + res);
    }

    return await shopBranchService
      .create({
        shipPreparationTime: "30 phút",
        shipDefaultDistance: 2,
        shipDefaultFee: 15000,
        shipNextFee: 5000,
        shipOneKmFee: 0,
        shipUseOneKmFee: true,
        shipNote: "",
        ...data,
      })
      .then(async (res) => {
        await addressService.setAddress(res);
        return await res.save();
      });
  },
  updateShopBranch: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    await protectItem(id, context);
    return await shopBranchService.updateOne(id, data).then(async (res) => {
      await addressService.setAddress(res);
      return await res.save();
    });
  },
  deleteOneShopBranch: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    await protectItem(id, context);
    return await shopBranchService.deleteOne(id);
  },
};

const ShopBranch = {};

export default {
  Query,
  Mutation,
  ShopBranch,
};
async function protectItem(id: any, context: Context) {
  const branch = await ShopBranchModel.findById(id);
  if (branch.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
}
