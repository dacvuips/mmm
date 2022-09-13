import { SettingKey } from "../../../../configs/settingData";
import { ROLES } from "../../../../constants/role.const";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { AddressHelper } from "../../address/address.helper";
import { MemberModel } from "../../member/member.model";
import { SettingHelper } from "../../setting/setting.helper";
import { ShopCategoryLoader } from "../shopCategory/shopCategory.model";
import {
  IShopRegistration,
  ShopRegistionStatus,
  ShopRegistrationModel,
} from "./shopRegistration.model";
import { shopRegistrationService } from "./shopRegistration.service";
import shortHash from "short-hash";
import passwordHash from "password-hash";
import { MemberHelper } from "../../member/member.helper";
import { ShopConfigModel } from "../shopConfig/shopConfig.model";
import { shopConfigService } from "../shopConfig/shopConfig.service";
import { subscriptionService } from "../../subscription/subscription.service";
import { sendApproveEmail } from "./common";

const Query = {
  getAllShopRegistration: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return shopRegistrationService.fetch(args.q);
  },
  getOneShopRegistration: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await shopRegistrationService.findOne({ _id: id });
  },
};

const Mutation = {
  createShopRegistration: async (root: any, args: any, context: Context) => {
    const { data } = args;
    await AddressHelper.setAddress(data);
    const email = data.email.trim();
    const shopCode = data.shopCode.trim();
    if (await MemberModel.findOne({ username: email })) throw Error("Email đã được sử dụng.");
    if (await MemberModel.findOne({ code: shopCode })) throw Error("Mã cửa hàng đã được sử dụng");
    if (
      await ShopRegistrationModel.findOne({
        email: email,
        status: ShopRegistionStatus.PENDING,
      })
    )
      throw Error("Email đã được sử dụng");
    if (
      await ShopRegistrationModel.findOne({
        shopCode: shopCode,
        status: ShopRegistionStatus.PENDING,
      })
    )
      throw Error("Mã cửa hàng đã được sử dụng");

    const regis: IShopRegistration = await shopRegistrationService.create({
      ...data,
      email,
      shopCode,
    });

    const requireApprove = await SettingHelper.load(SettingKey.REGIS_REQUIRE_APPROVE);
    if (requireApprove) {
      return regis;
    } else {
      // Kích hoạt cửa hàng trực tiếp
      const password = data.password || shortHash(regis.shopCode);
      const hashedPassword = passwordHash.generate(password);
      const helper = new MemberHelper(
        new MemberModel({
          username: regis.email,
          password: hashedPassword,
          phone: regis.phone,
          name: regis.name,
          code: regis.shopCode,
          shopName: regis.shopName,
          shopLogo: regis.shopLogo,
          address: regis.address,
          provinceId: regis.provinceId,
          districtId: regis.districtId,
          wardId: regis.wardId,
          province: regis.province,
          district: regis.district,
          ward: regis.ward,
          birthday: regis.birthday,
          gender: regis.gender,
          categoryId: regis.categoryId,
        })
      );
      await helper.setActivedAt().member.save();
      regis.approvedAt = new Date();
      regis.status = ShopRegistionStatus.APPROVED;
      regis.memberId = helper.member._id;
      await Promise.all([
        regis.save(),
        ShopConfigModel.create({
          memberId: helper.member._id,
          ...shopConfigService.getDefaultConfig(),
        }),
        subscriptionService.addFreePlan(helper.member._id),
      ]);
      shopConfigService.setAhamoveToken(helper.member);
      await sendApproveEmail(regis, password);
      return regis;
    }
  },
};

const ShopRegistration = {
  category: GraphQLHelper.loadById(ShopCategoryLoader, "categoryId"),
};

export default {
  Query,
  Mutation,
  ShopRegistration,
};
