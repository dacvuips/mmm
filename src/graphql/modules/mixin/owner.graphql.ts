import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { UserLoader, UserRole } from "../user/user.model";

export type Owner = {
  _id?: string; // Mã người dùng
  name?: string; // Tên
  email?: string; // Email
  phone?: string; // Điện thoại
  role?: string; // Vai trò
};

export const OwnerSchema = new Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  role: { type: String },
});

export default {
  schema: gql`
    type Owner {
      "Mã người dùng"
      id: ID
      "Tên"
      name: String
      "Email"
      email: String
      "Điện thoại"
      phone: String
      "Vai trò"
      role: String
      profile: User
    }
  `,
  resolver: {
    Owner: {
      id: (root: any, args: any, context: Context) => root._id.toString(),
      profile: GraphQLHelper.loadById(UserLoader, "_id"),
    },
  },
};
