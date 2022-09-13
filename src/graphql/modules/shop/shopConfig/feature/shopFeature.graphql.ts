import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { Context } from "../../../../context";

export type ShopFeature = {
  sms?: boolean; // Tính năng sms
};

export const ShopFeatureSchema = new Schema({
  sms: { type: Boolean, default: false },
});

export default {
  schema: gql`
    type ShopFeature {
      "Tính năng SMS"
      sms: Boolean
    }
  `,
  resolver: {},
};
