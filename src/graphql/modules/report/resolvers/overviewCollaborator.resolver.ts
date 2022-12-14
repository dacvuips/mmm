import { get, set } from "lodash";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";

import { ROLES } from "../../../../constants/role.const";
import { AuthHelper, UtilsHelper } from "../../../../helpers";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { CollaboratorModel, ICollaborator } from "../../collaborator/collaborator.model";
import { collaboratorService } from "../../collaborator/collaborator.service";
import { CustomerModel } from "../../customer/customer.model";
import {
  CustomerCommissionLogModel,
  ICustomerCommissionLog,
} from "../../customerCommissionLog/customerCommissionLog.model";
import { Gender, MemberLoader, MemberModel } from "../../member/member.model";

const getOverviewCollaboratorReport = async (root: any, args: any, context: Context) => {
  AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
  const filter = get(args, "q.filter", {});
  const $match: any = await getMatch(filter, context);
  const collaboratorCount = await countCollaborator(filter, context);
  const query: any = [
    { $match: $match },
    {
      $group: {
        _id: null,
        value: { $sum: "$value" },
      },
    },
  ];
  const commission = await CustomerCommissionLogModel.aggregate(query).then((res) =>
    get(res, "0.value", 0)
  );

  return {
    commission: commission,
    collaboratorCount: collaboratorCount,
  };
};

const getFilteredCollaborators = async (root: any, args: any, context: Context) => {
  AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
  let { memberId, branchId, code } = get(args, "q.filter", {});
  const $match: any = {};
  if (memberId) set($match, "memberId", memberId);
  if (context.isMember()) set($match, "memberId", memberId);
  if (branchId) {
    const memberIds = await MemberModel.find({ branchId, activated: true })
      .select("_id")
      .then((res) => res.map((r) => r._id));
    set($match, "memberId.$in", memberIds);
  }
  if (code) {
    set($match, "code", get(code, "__exists", false) ? { $ne: "" } : { $eq: "" });
  }
  set(args, "q.filter", $match);
  return await collaboratorService.fetch(args.q);
};

const FilteredCollaborator = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  members: async (root: ICollaborator, args: any, context: Context) => {
    if (root.memberId) {
      const members = await MemberModel.find({ _id: new ObjectId(root.memberId), activated: true });
      // console.log('members', members);
      return members;
    }
    return null;
  },

  customer: async (root: ICollaborator, args: any, context: Context) => {
    if (root.memberId) {
      const member = await MemberModel.findById(root.memberId);
      let customer: any = await CustomerModel.findById(root.customerId);

      if (customer) {
        customer.name = customer.name + " - " + member.shopName;
      } else {
        customer = {
          code: root.code,
          name: root.name + " - Ch??a c?? C???a h??ng",
          facebookName: root.name,
          uid: root.code,
          phone: root.phone,
          password: "1234",
          avatar: "1234",
          gender: Gender.OTHER, // Gi???i t??nh
          birthday: new Date(), // Ng??y sinh
          address: "test", // ?????a ch???
          province: "test", // T???nh / th??nh
          district: "test", // Qu???n / huy???n
          ward: "test", // Ph?????ng / x??
          provinceId: "test", // M?? T???nh / th??nh
          districtId: "test", // M?? Qu???n / huy???n
          wardId: "test", // M?? Ph?????ng / x??
          cumulativePoint: 0, // ??i???m t??ch l??y
          commission: 0, // Hoa h???ng c???ng t??c vi??n
          pageAccounts: [], // Danh s??ch account facebook c???a ng?????i d??ng
          latitude: 0,
          longitude: 0,
        };
      }

      return customer;
    }
    return null;
  },

  total: async (root: ICollaborator, args: any, context: Context) => {
    let { id } = root;
    let { fromDate, toDate } = args;
    let $match = {};

    const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate);

    if ($gte) {
      set($match, "createdAt.$gte", $gte);
    }

    if ($lte) {
      set($match, "createdAt.$lte", $lte);
    }

    set($match, "collaboratorId", id);

    const customerCommissionLog = await CustomerCommissionLogModel.find($match);
    const count = customerCommissionLog.length;

    return count > 0
      ? customerCommissionLog.reduce(
          (total: number, o: ICustomerCommissionLog) => (total += o.value),
          0
        )
      : 0;
  },
};

const Query = {
  getFilteredCollaborators,
  getOverviewCollaboratorReport,
};
export default { Query, FilteredCollaborator };
async function countCollaborator(filter: any = {}, context: Context) {
  const { memberId, branchId } = filter;
  const collaboratorMatch: any = {};
  if (memberId) set(collaboratorMatch, "memberId", memberId);
  if (context.isMember() || context.isStaff()) set(collaboratorMatch, "memberId", context.sellerId);
  if (branchId) {
    const memberIds = await MemberModel.find({ branchId, activated: true })
      .select("_id")
      .then((res) => res.map((r) => r._id));
    set(collaboratorMatch, "memberId.$in", memberIds);
  }
  const collaboratorCount = await CollaboratorModel.count(collaboratorMatch);
  return collaboratorCount;
}

async function getMatch(filter: any = {}, context: Context) {
  let { fromDate, toDate, memberId, branchId } = filter;
  const $match: any = {};
  const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate);
  if ($gte) set($match, "createdAt.$gte", $gte);
  if ($lte) set($match, "createdAt.$lte", $lte);
  if (memberId) set($match, "memberId", Types.ObjectId(memberId));
  if (context.isMember() || context.isStaff())
    set($match, "memberId", Types.ObjectId(context.sellerId));
  if (branchId) {
    const memberIds = await MemberModel.find({ branchId, activated: true })
      .select("_id")
      .then((res) => res.map((r) => r._id));
    set($match, "memberId.$in", memberIds);
  }
  return $match;
}
