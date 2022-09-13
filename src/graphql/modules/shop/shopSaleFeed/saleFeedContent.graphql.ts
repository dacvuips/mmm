import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { Context } from "../../../context";

export type SaleFeedContent = {
  content?: string; // Nội dung
  images?: string[]; // Hình ảnh
};

export const SaleFeedContentSchema = new Schema({
  content: { type: String },
  images: { type: [String], default: [] },
});

export default {
  schema: gql`
    type SaleFeedContent {
      "Nội dung"
      content: String
      "Hình ảnh"
      images: [String]
    }
    input SaleFeedContentInput {
      "Nội dung"
      content: String
      "Hình ảnh"
      images: [String]
    }
  `,
  resolver: {},
};
