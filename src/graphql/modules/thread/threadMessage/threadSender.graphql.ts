import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { CustomerLoader } from "../../customer/customer.model";
import { MemberLoader } from "../../member/member.model";
import { UserLoader } from "../../user/user.model";

export type ThreadSender = {
  role?: string; // Loại người dùng
  userId?: string; // Mã quản lý
  memberId?: string; // Mã cửa hàng
  customerId?: string; // Mã khách hàng
};
export const ThreadSenderSchema = new Schema({
  role: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId },
  memberId: { type: Schema.Types.ObjectId },
  customerId: { type: Schema.Types.ObjectId },
});
export default {
  schema: gql`
    type ThreadSender {
      "Loại người dùng"
      role: String
      "Mã quản lý"
      userId: ID
      "Mã cửa hàng"
      memberId: ID
      "Mã khách hàng"
      customerId: ID

      user: User
      member: Shop
      customer: Customer
    }
  `,
  resolver: {
    ThreadSender: {
      user: GraphQLHelper.loadById(UserLoader, "userId"),
      member: GraphQLHelper.loadById(MemberLoader, "memberId"),
      customer: GraphQLHelper.loadById(CustomerLoader, "customerId"),
    },
  },
};
