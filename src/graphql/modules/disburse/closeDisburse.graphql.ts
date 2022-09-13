import { gql } from "apollo-server-express";
import { ROLES } from "../../../constants/role.const";
import { Context } from "../../context";
import { DisburseModel, DisburseStatus } from "./disburse.model";

export default {
  schema: gql`
    extend type Mutation {
      closeDisburse(disburseId: ID!): Disburse
    }
  `,
  resolver: {
    Mutation: {
      closeDisburse: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);

        const { disburseId } = args;
        const disburse = await DisburseModel.findById(disburseId);
        if (!disburse) throw Error(`Không tìm thấy dữ liệu`);

        if (disburse.status == DisburseStatus.closed) return disburse;

        disburse.status = DisburseStatus.closed;
        disburse.closeAt = new Date();
        disburse.closeById = context.id;
        return await disburse.save();
      },
    },
  },
};
