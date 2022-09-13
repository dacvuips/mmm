import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { PostLoader } from "../post/post.model";

export enum ActionType {
  NONE = "NONE", // Không hành động
  WEBSITE = "WEBSITE", // Mở website
  ORDER = "ORDER", // Mở bài order
  PRODUCT = "PRODUCT", // Mở bài sản phẩm

  SUPPORT_TICKET = "SUPPORT_TICKET", // Mở ticket
}

export type Action = {
  type?: ActionType; // Loại hành động
  link?: string; // Đường dẫn website
  orderId?: string; // Mã Order
  productId?: string; // Mã sản phẩm
  ticketId?: string; // Mã ticket
};

export const ActionSchema = new Schema({
  type: { type: String, enum: Object.values(ActionType) },
  link: { type: String },
  postId: { type: Schema.Types.ObjectId },
  orderId: { type: Schema.Types.ObjectId },
  productId: { type: Schema.Types.ObjectId },
  ticketId: { type: Schema.Types.ObjectId },
});

export default {
  schema: gql`
    type Action {
      "Loại hành động ${Object.values(ActionType)}"
      type: String
      "Đường dẫn website"
      link: String
      "Mã Order"
      orderId: ID
      "Mã sản phẩm"
      productId:ID
      "Mã ticket"
      ticketId: ID
    }
    input ActionInput {
      "Loại hành động ${Object.values(ActionType)}"
      type: String!
      "Đường dẫn website"
      link: String
      "Mã Order"
      orderId: ID
      "Mã sản phẩm"
      productId:ID
      "Mã ticket"
      ticketId: ID
    }
  `,
  resolver: {},
};
