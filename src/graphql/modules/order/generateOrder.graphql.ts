import { gql } from "apollo-server-express";

import { ROLES } from "../../../constants/role.const";
import { onOrderedProduct } from "../../../events/onOrderedProduct.event";
import { Context } from "../../context";
import { CollaboratorModel } from "../collaborator/collaborator.model";
import { CustomerLoader, CustomerModel, ICustomer } from "../customer/customer.model";
import { MemberLoader } from "../member/member.model";
import { OrderModel } from "./order.model";
import { OrderGenerator } from "./orderGenerator";

export default {
  schema: gql`
    extend type Mutation {
      generateOrder(data: CreateDraftOrderInput!): Order
    }
  `,
  resolver: {
    Mutation: {
      generateOrder: async (root: any, args: any, context: Context) => {
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
        await orderGenerator.generate();
        const order = await orderGenerator.toOrder();
        if (!customer.collaboratorId) {
          await customer
            .updateOne({
              $set: {
                name: order.buyerName,
                latitude: order.latitude,
                longitude: order.longitude,
                fullAddress: order.buyerFullAddress,
                addressNote: order.buyerAddressNote,
              },
            })
            .exec();
        } else {
          await customer
            .updateOne({
              $set: {
                latitude: order.latitude,
                longitude: order.longitude,
                fullAddress: order.buyerFullAddress,
                addressNote: order.buyerAddressNote,
              },
            })
            .exec();
          await CollaboratorModel.updateOne(
            { _id: customer.collaboratorId },
            { $set: { name: customer.name } }
          ).exec();
        }
        onOrderedProduct.next(OrderModel.hydrate(order.toJSON()));
        return order;
      },
    },
  },
};
