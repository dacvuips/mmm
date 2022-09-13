import { gql } from "apollo-server-express";
import { get, set } from "lodash";

import { ROLES } from "../../../constants/role.const";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { CustomerLoader, CustomerModel, ICustomer } from "../customer/customer.model";
import { MemberLoader } from "../member/member.model";
import { OrderItemLoader } from "../orderItem/orderItem.model";
import { IOrder, PickupMethod } from "./order.model";
import { OrderGenerator } from "./orderGenerator";

export default {
  schema: gql`
    extend type Mutation {
      generateDraftOrder(data: CreateDraftOrderInput!): DraftOrderData
    }
    type DraftOrderData {
      order: Order
      invalid: Boolean
      invalidReason: String
    }
    input CreateDraftOrderInput {
      "Sản phẩm"
      items: [OrderItemInput]!
      "Sản phẩm ưu đãi"
      offerItemIds: [String]
      "Tên người đặt"
      buyerName: String!
      "Điện thoại người đặt"
      buyerPhone: String!
      "Phương thức nhận hàng ${Object.values(PickupMethod)}"
      pickupMethod: String!
      "Chi nhánh"
      shopBranchId: ID!
      "Thời gian nhận hàng"
      pickupTime: DateTime
      "Địa chỉ nhận"
      buyerAddress: String
      "Tỉnh / thành nhận"
      buyerProvinceId: String
      "Quận / huyện nhận"
      buyerDistrictId: String
      "Phường / xã nhận"
      buyerWardId: String
      "Địa chỉ giao đầy đủ"
      buyerFullAddress: String!
      "Ghi chú địa chỉ"
      buyerAddressNote: String
      "Toạ độ"
      latitude: Float!
      longitude: Float!
      "Phương thức thanh toán"
      paymentMethod: String!
      "Ghi chú"
      note: String
      "Mã giảm giá"
      promotionCode: String
      "Mã voucher cá nhân"
      customerVoucherId: ID
      "Sử dụng điểm thưởng"
      useRewardPoint: Boolean
      "Thứ tự nhóm quà tặng"
      offerGroupIndex: Int
      "Mã bàn"
      tableCode: String
    }
    input OrderItemInput {
      productId: ID!
      quantity: Int!
      note: String
      toppings: [OrderItemToppingInput]
    }
  `,
  resolver: {
    Mutation: {
      generateDraftOrder: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER, ROLES.MEMBER, ROLES.STAFF]);
        const orderInput = args.data;
        const sellerId = context.sellerId;
        const seller = await MemberLoader.load(sellerId);
        let customer: ICustomer;
        if (context.isMember() || context.isStaff()) {
          // get customer by buyerPhone
          const buyerPhone = orderInput.buyerPhone;
          const buyerName = orderInput.buyerName;
          customer = await CustomerModel.findOneAndUpdate(
            { phone: buyerPhone, memberId: sellerId },
            { $setOnInsert: { name: buyerName || "" } },
            { upsert: true, new: true }
          );
        } else {
          const buyerId = context.id;
          customer = await CustomerLoader.load(buyerId);
        }
        const { campaignCode } = context;
        const orderGenerator = new OrderGenerator(orderInput, seller, customer, campaignCode);
        try {
          await orderGenerator.generate();

          set(context, "isDraft", true);
          const draft = orderGenerator.toDraft();
          return {
            order: draft,
            invalid: false,
            invalidReason: null,
          } as any;
        } catch (err) {
          console.log("error", err);
          return {
            order: orderGenerator.toDraft(),
            invalid: true,
            invalidReason: err.message,
          } as any;
        }
      },
    },
    Order: {
      items: async (root: IOrder, args: any, context: Context) => {
        if (get(context, "isDraft")) {
          return root.items;
        } else {
          return GraphQLHelper.loadManyById(OrderItemLoader, "itemIds")(root, args, context);
        }
      },
    },
  },
};
