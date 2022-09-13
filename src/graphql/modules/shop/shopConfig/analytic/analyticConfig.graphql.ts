import { gql } from "apollo-server-express";
import { Schema } from "mongoose";

export type AnalyticConfig = {
  googleAnalytic?: string; // Cấu hình google analytic
  facebookPixel?: string; // Cấu hình facebook Pixel
};

export const AnalyticConfigSchema = new Schema({
  googleAnalytic: { type: String },
  facebookPixel: { type: String },
});

export default {
  schema: gql`
    type AnalyticConfig {
      "Cấu hình google analytic"
      googleAnalytic: String
      "Cấu hình facebook Pixel"
      facebookPixel: String
    }
    input AnalyticConfigInput {
      "Cấu hình google analytic"
      googleAnalytic: String
      "Cấu hình facebook Pixel"
      facebookPixel: String
    }
    extend type ShopConfig {
      analyticConfig: AnalyticConfig
    }
    extend input UpdateShopConfigInput {
      analyticConfig: AnalyticConfigInput
    }
  `,
  resolver: {},
};
