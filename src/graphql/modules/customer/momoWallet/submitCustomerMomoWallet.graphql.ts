import { gql } from "apollo-server-express";
import moment from "moment-timezone";
import { ROLES } from "../../../../constants/role.const";
import { firebaseHelper } from "../../../../helpers";
import { convertPhone } from "../../../../helpers/functions/string";
import { Context } from "../../../context";
import { CustomerModel } from "../customer.model";
import { MomoWalletStatus } from "./customerMomoWallet.graphql";
import { trackingMomoWalletStatusQueue } from "./trackingCustomerMomoWalletStatus.queue";

export default {
  schema: gql`
    extend type Mutation {
      submitCustomerMomoWallet(name: String!, idCard: String!): String
    }
  `,
  resolver: {
    Mutation: {
      submitCustomerMomoWallet: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.CUSTOMER]);
        const { name, idCard } = args;
        const { id: customerId } = context;
        const customer = await CustomerModel.findById(customerId);

        const phone = customer.phone;

        customer.momoWallet = {
          status: MomoWalletStatus.processing,
          phone,
          idCard,
          name,
          submitAt: new Date(),
          updateAt: new Date(),
        };

        await customer.save();

        // tracking momo wallet status after 5 minute
        await trackingMomoWalletStatusQueue
          .queue()
          .createJob({})
          .delayUntil(moment().add(5, "minute").toDate())
          .setId("0")
          .save();
        return "OK";
      },
    },
  },
};
