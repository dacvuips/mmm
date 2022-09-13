import { helpers } from "faker";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper, ErrorHelper, UtilsHelper } from "../../../helpers";
import { Context } from "../../context";
import { AddressHelper } from "../address/address.helper";
import { MemberLoader, MemberModel } from "../member/member.model";
import { AddressDeliveryHelper } from "./addressDelivery.helper";
import { AddressDeliveryModel, IAddressDelivery } from "./addressDelivery.model";
import { addressDeliveryService } from "./addressDelivery.service";

const Query = {
  getAllAddressDelivery: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    return addressDeliveryService.fetch(args.q);
  },
  getOneAddressDelivery: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await addressDeliveryService.findOne({ _id: id });
  },
};

const Mutation = {
  createAddressDelivery: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const data: IAddressDelivery = args.data;
    const { email } = data;

    if (email && !UtilsHelper.isEmail(email))
      throw ErrorHelper.requestDataInvalid(".Email không đúng định dạng");

    const helper = new AddressDeliveryHelper(new AddressDeliveryModel(data));

    helper.addressDelivery.code = data.code || (await AddressDeliveryHelper.generateCode());

    await Promise.all([
      AddressHelper.setProvinceName(helper.addressDelivery),
      AddressHelper.setDistrictName(helper.addressDelivery),
      AddressHelper.setWardName(helper.addressDelivery),
    ]);

    return await helper.addressDelivery.save();
  },
  updateAddressDelivery: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    // return await addressDeliveryService.updateOne(id, data);
    const data: IAddressDelivery = args.data;
    const { email } = data;

    const existedLocation = await AddressDeliveryModel.findById(id);
    if (!existedLocation) throw ErrorHelper.mgRecoredNotFound("địa điểm nhận hàng");

    if (email && !UtilsHelper.isEmail(email))
      throw ErrorHelper.requestDataInvalid(".Email không đúng định dạng");

    return await addressDeliveryService.updateOne(id, data).then(async (res: IAddressDelivery) => {
      const helper = new AddressDeliveryHelper(res);
      await Promise.all([
        AddressHelper.setProvinceName(helper.addressDelivery),
        AddressHelper.setDistrictName(helper.addressDelivery),
        AddressHelper.setWardName(helper.addressDelivery),
      ]);
      return await helper.addressDelivery.save();
    });
  },

  deleteOneAddressDelivery: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    const existedMembersbyAddress = await MemberModel.find({
      addressDeliveryIds: { $in: [id] },
    });
    // console.log('existedMembersbyAddress',existedMembersbyAddress);
    if (existedMembersbyAddress.length > 0) {
      throw ErrorHelper.requestDataInvalid(". Địa điểm này đang được sử dụng");
    }

    return await addressDeliveryService.deleteOne(id);
  },
};

const AddressDelivery = {
  member: async (root: IAddressDelivery, args: any, context: Context) => {
    return await MemberModel.findOne({ code: root.code });
  },
};

export default {
  Query,
  Mutation,
  AddressDelivery,
};
