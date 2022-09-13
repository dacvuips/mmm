import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { BaseDocument } from "../../../base/baseModel";
import { Owner, OwnerSchema } from "../mixin/owner.graphql";
import { UserRole } from "../user/user.model";

export type NotifySendLog = BaseDocument & {
  owner?: Owner;
  match?: number; // Số lượng khớp
  sended?: number; // Đã gửi
  seen?: number; // Đã xem
  targets?: UserRole[]; // Đối tượng gửi
};

export const NotifySendLogSchema = new Schema(
  {
    owner: { type: OwnerSchema, required: true },
    match: { type: Number, default: 0, min: 0 },
    sended: { type: Number, default: 0, min: 0 },
    seen: { type: Number, default: 0, min: 0 },
    targets: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default {
  schema: gql`
    type NotifySendLog {
      id: ID
      createdAt: DateTime
      updatedAt: DateTime
      owner: Owner
      "Số lượng khớp"
      match: Int
      "Đã gửi"
      sended: Int
      "Đã xem"
      seen: Int
      "Đối tượng gửi ${Object.values(UserRole)}"
      targets: [String]
    }
  `,
  resolver: {},
};