import { set } from "lodash";
import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { SubscriptionRequestLoader } from "./subscriptionRequest/subscriptionRequest.model";
import { subscriptionService } from "./subscription.service";

const Query = {
  getAllShopSubscription: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    return subscriptionService.fetch(args.q);
  },
};

const ShopSubscription = {
  request: GraphQLHelper.loadById(SubscriptionRequestLoader, "requestId"),
};
export default {
  Query,
  ShopSubscription,
};
