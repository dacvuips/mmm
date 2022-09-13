import { gql } from "apollo-server-express";
import { configs } from "../../../configs";
import { SettingKey } from "../../../configs/settingData";
import { Context } from "../../context";
import { MemberLoader } from "../member/member.model";
import { SettingHelper } from "../setting/setting.helper";
import { ICollaborator } from "./collaborator.model";

export default {
  schema: gql`
    extend type Collaborator {
      "Đường dẫn giới thiệu"
      shortUrl: String
    }
  `,
  resolver: {
    Collaborator: {
      shortUrl: async (root: ICollaborator, args: any, context: Context) => {
        const [member] = await Promise.all([MemberLoader.load(context.sellerId)]);
        return `${configs.domain}/${member.code}?colCode=${root.shortCode}`;
      },
    },
  },
};
