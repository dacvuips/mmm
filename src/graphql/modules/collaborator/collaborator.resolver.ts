import _, { set } from "lodash";

import { ModelSelectLoader } from "../../../base/baseModel";
import { SettingKey } from "../../../configs/settingData";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper, ErrorHelper, KeycodeHelper } from "../../../helpers";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { counterService } from "../counter/counter.service";
import { CustomerLoader, CustomerModel } from "../customer/customer.model";
import { IMember, MemberLoader, MemberModel } from "../member/member.model";
import { SettingHelper } from "../setting/setting.helper";
import { ShopConfigModel } from "../shop/shopConfig/shopConfig.model";
import { triggerService } from "../trigger/trigger.service";
import {
  CollaboratorLoader,
  CollaboratorModel,
  CollaboratorStatus,
  ICollaborator,
} from "./collaborator.model";
import { collaboratorService } from "./collaborator.service";

const Query = {
  getAllCollaborator: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    return collaboratorService.fetch(args.q);
  },
  getOneCollaborator: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await collaboratorService.findOne({
      _id: id,
    });
  },
};

const Mutation = {
  createCollaborator: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    const { phone } = data;
    await checkDuplicatePhone(phone, context);
    await checkDuplicateCode(data, context);
    if (!data.code) {
      data.code = await counterService.trigger("collaborator").then((res) => "CTV" + res);
    }
    data.memberId = context.sellerId;
    const { shortCode, shortUrl, status } = await collaboratorService.generateShortCode(
      context.sellerId,
      data
    );
    data.shortCode = shortCode;
    data.shortUrl = shortUrl;
    data.status = status;
    const customer = await CustomerModel.findOne({ memberId: context.sellerId, phone: data.phone });
    if (customer) {
      data.customerId = customer._id;
    }
    const newCol = await collaboratorService.create(data);
    if (customer) {
      customer.collaboratorId = newCol._id;
      await customer.save();
    }
    return newCol;
  },

  updateCollaborator: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { id, data } = args;
    await protectDoc(id, context);

    const collaborator = await CollaboratorLoader.load(id);

    if (
      collaborator.status === CollaboratorStatus.PENDING &&
      _.get(data, "status") === CollaboratorStatus.ACTIVE
    ) {
      triggerService.emitEvent("collaborator:registered", collaborator.memberId, {
        ...collaborator,
        sellerId: collaborator.memberId,
        buyerId: collaborator.customerId,
      });
    }
    return await collaboratorService.updateOne(id, data);
  },

  deleteOneCollaborator: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, [ROLES.MEMBER, ROLES.STAFF]);
    const { id } = args;
    await protectDoc(id, context);
    return await collaboratorService.deleteOne(id);
  },
};
const memberLoader = ModelSelectLoader<IMember>(MemberModel, "id shopName shopLogo fanpageImage");

const Collaborator = {
  member: GraphQLHelper.loadById(memberLoader, "memberId"),
  customer: GraphQLHelper.loadById(CustomerLoader, "customerId"),
};

export default {
  Query,
  Mutation,
  Collaborator,
};

async function protectDoc(id: any, context: Context) {
  const col = await CollaboratorLoader.load(id);
  if (col.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
}

async function checkDuplicateCode(data: any, context: Context) {
  if (data.code) {
    if (await CollaboratorModel.findOne({ memberId: context.sellerId, code: data.code })) {
      throw ErrorHelper.duplicateError("Mã CTV");
    }
  }
}

async function checkDuplicatePhone(phone: any, context: Context) {
  const existedCollaborator = await CollaboratorModel.findOne({
    phone,
    memberId: context.sellerId,
  });
  if (existedCollaborator) throw ErrorHelper.duplicateError("Số điện thoại");
}
