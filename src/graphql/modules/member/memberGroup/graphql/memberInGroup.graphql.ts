import { gql } from "apollo-server-express";

import { GraphQLHelper } from "../../../../../helpers/graphql.helper";
import { MemberGroupLoader } from "../memberGroup.model";

export default {
  schema: gql`
    extend type Member {
      "Mã nhóm member"
      memberGroupId: String
      "Nhóm member"
      memberGroup: MemberGroup
    }

    extend input CreateMemberInput {
      "Mã nhóm member"
      memberGroupId: String
    }

    extend input UpdateMemberInput {
      "Mã nhóm member"
      memberGroupId: String
    }
  `,
  resolver: {
    Member: {
      memberGroup: GraphQLHelper.loadById(MemberGroupLoader, "memberGroupId"),
    },
  },
};
