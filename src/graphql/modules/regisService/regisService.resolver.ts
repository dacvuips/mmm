import { keyBy, set } from "lodash";
import { ErrorHelper } from "../../../base/error";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { AddressHelper } from "../address/address.helper";
import { CustomerLoader, CustomerModel } from "../customer/customer.model";
import { MemberLoader, MemberModel } from "../member/member.model";
import { RegisServiceHelper } from "./regisService.helper";
import { ProductLoader, ProductModel, ProductType } from "../product/product.model";
import { RegisServiceModel, RegisServiceStatus } from "./regisService.model";
import { regisServiceService } from "./regisService.service";
import { SettingHelper } from "../setting/setting.helper";
import { SettingKey } from "../../../configs/settingData";
import { CampaignLoader } from "../campaign/campaign.model";
import { campaignService } from "../campaign/campaign.service";
import {
  CampaignSocialResultLoader,
  CampaignSocialResultModel,
} from "../campaignSocialResult/campaignSocialResult.model";

const Query = {
  getAllRegisService: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.sellerId", context.sellerId);
    }
    if (context.isCustomer()) {
      set(args, "q.filter.registerId", context.id);
    }
    return regisServiceService.fetch(args.q);
  },
  getOneRegisService: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    const { id } = args;
    return await regisServiceService.findOne({ _id: id });
  },
};

const Mutation = {
  createRegisService: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.CUSTOMER]);
    const { sellerId, id, campaignCode } = context;
    const customerId = id;
    // const customerId = "5fd88d89cb2e5c6493402e2c";
    const { data } = args;
    const {
      productId,
      registerName,
      registerPhone,
      address,
      provinceId,
      districtId,
      wardId,
    } = data;

    // Ki???m tra s???n ph???m
    const [customer, product, member, campaign] = await Promise.all([
      CustomerModel.findById(customerId),
      ProductModel.findOne({ _id: productId, type: ProductType.SERVICE }),
      MemberModel.findById(sellerId),
      campaignService.getCampaignByCodeAndProduct(campaignCode, productId, sellerId),
    ]);

    // Ki???m tra s???n ph???m
    if (!product) throw ErrorHelper.productNotExist();

    //Ki???m tra s??? ??i???n tho???i h???p l???
    if (registerPhone) RegisServiceHelper.validatePhone(registerPhone);

    if (!customer) {
      throw ErrorHelper.mgRecoredNotFound("Kh??ch h??ng");
    }

    if (!member) {
      throw ErrorHelper.mgRecoredNotFound("Th??nh vi??n");
    }

    const {
      commission0, // Hoa h???ng Mobifone
      commission1, // Hoa h???ng ??i???m b??n
      commission2, // Hoa h???ng gi???i thi???u
      name: productName,
      basePrice,
    } = product;

    const { _id: registerId } = customer;

    let params: any = {
      productId,
      productName,
      registerId,
      basePrice,
      sellerId,
      registerName,
      registerPhone,
      address,
      provinceId,
      districtId,
      wardId,
      commission0,
      commission1,
      commission2,
    };

    // t??nh to??n ??i???m th?????ng cho kh??ch h??ng
    const UNIT_PRICE = await SettingHelper.load(SettingKey.UNIT_PRICE);
    const getPointFromPrice = (factor: any, price: any) =>
      Math.round(((price / UNIT_PRICE) * 100) / 100) * factor;
    // ??i???m th?????ng kh??ch h??ng
    if (product.enabledCustomerBonus)
      params.buyerBonusPoint = getPointFromPrice(product.customerBonusFactor, product.basePrice);
    // ??i???m th?????ng ch??? shop
    if (product.enabledMemberBonus)
      params.sellerBonusPoint = getPointFromPrice(product.memberBonusFactor, product.basePrice);
    // nh??ng campaign v??o ????n

    const campaignSocialResult = campaign
      ? await CampaignSocialResultModel.findOne({
          memberId: sellerId,
          campaignId: campaign.id,
          productId,
        })
      : null;
    const regisServiceIds = campaignSocialResult ? campaignSocialResult.regisServiceIds : null;
    if (campaign) {
      params.campaignId = campaign._id;
      params.campaignSocialResultId = campaignSocialResult._id;
    }
    //create pre mongo model : Order
    const regisService = new RegisServiceModel(params);

    const regisServiceHelper = new RegisServiceHelper(regisService);
    // Ki???m tra ?????a ch???
    await Promise.all([
      regisServiceHelper.setProvinceName(),
      regisServiceHelper.setDistrictName(),
      regisServiceHelper.setWardName(),
    ]);

    regisService.code = await RegisServiceHelper.generateCode();
    // console.log('==============>regisService', regisService);
    // Save l???i
    return await Promise.all([
      regisService.save(),
      campaignSocialResult &&
        CampaignSocialResultModel.findByIdAndUpdate(
          campaignSocialResult.id,
          {
            $set: {
              regisServiceIds: [...regisServiceIds, regisService.id],
            },
          },
          { new: true }
        ),
    ]).then((res) => {
      return res[0];
    });
  },
};

const RegisService = {
  seller: GraphQLHelper.loadById(MemberLoader, "sellerId"),
  product: GraphQLHelper.loadById(ProductLoader, "productId"),
  register: GraphQLHelper.loadById(CustomerLoader, "registerId"),
  campaign: GraphQLHelper.loadById(CampaignLoader, "campaignId"),
  campaignSocialResult: GraphQLHelper.loadById(
    CampaignSocialResultLoader,
    "campaignSocialResultId"
  ),
};

export default {
  Query,
  Mutation,
  RegisService,
};
