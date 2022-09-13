import { gql } from "apollo-server-express";
import _, { compact, set } from "lodash";
import { ROLES } from "../../../constants/role.const";
import { Context } from "../../context";
import { customerService } from "../customer/customer.service";
import { CustomerGroupModel } from "./customerGroup.model";

export default {
  schema: gql`
    extend type Query {
      fetchCustomerGroup(groupId: ID!, q: QueryGetListInput): CustomerPageData
    }
  `,
  resolver: {
    Query: {
      fetchCustomerGroup: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.MEMBER_STAFF);
        const { groupId } = args;
        const group = await CustomerGroupModel.findById(groupId);
        if (!group || group.memberId.toString() != context.sellerId)
          throw Error("Không tìm thấy nhóm");
        let match: any = parseCondition({
          type: "group",
          conditions: group.filter.conditions,
          logical: group.filter.logical,
        });
        set(args, "q.filter", match);
        set(args, "q.filter.memberId", context.sellerId);
        return customerService.fetch(args.q).then((res) => {
          if (_.isEmpty(args.q.search) == true) {
            // Cập nhật tổng người dùng cho nhóm khách hành
            if (group.summary != res.pagination.total) {
              group.summary = res.pagination.total;
              group.save();
            }
          }
          return res;
        });
      },
    },
  },
};

function parseCondition(condition: any) {
  try {
    if (condition.type == "group") {
      if (!condition.conditions || !condition.conditions.length) return null;
      const comparisons = compact(condition.conditions.map((c: any) => parseCondition(c)));
      if (!comparisons.length) return null;
      return {
        [condition.logical]: comparisons,
      };
    } else {
      switch (condition.resource) {
        case "order":
        case "completed":
        case "canceled":
        case "voucher":
        case "discount":
        case "revenue":
          return { [`context.${condition.resource}`]: { [condition.comparison]: condition.value } };
        default:
          return null;
      }
    }
  } catch (err) {
    console.log("error", err);
    return {};
  }
}
