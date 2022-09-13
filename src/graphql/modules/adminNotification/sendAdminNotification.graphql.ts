import { gql } from "apollo-server-express";

import { ROLES } from "../../../constants/role.const";
import { Context } from "../../context";
import { MemberModel } from "../member/member.model";
import { memberService } from "../member/member.service";
import { ActionType } from "../mixin/action.graphql";
import { InsertNotification, NotificationTarget } from "../notification/notification.model";
import { NotificationBuilder } from "../notification/notificationBuilder";
import { IUser } from "../user/user.model";
import { IAdminNotification } from "./adminNotification.model";
import { adminNotificationService } from "./adminNotification.service";

export default {
  schema: gql`
    extend type Mutation {
      sendAdminNotification(id: ID!, target: String!): String
    }
  `,
  resolver: {
    Mutation: {
      sendAdminNotification: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);
        const { id, target } = args;
        // Get admin notification infomation by ID
        const info: IAdminNotification = await adminNotificationService.findOne({ _id: id });

        switch (target) {
          case NotificationTarget.MEMBER: {
            // Get all members
            const members = await MemberModel.find({}).select("_id").exec();
            // System will filter the action type and then it will send notification to all members
            const notifies = members.map((member) => {
              return new NotificationBuilder(info.title, info.body)
                .action(info.action)
                .sendTo(NotificationTarget.MEMBER, member._id)
                .build();
            });
            await InsertNotification(notifies);
            break;
          }
          default: {
            throw new Error("Notification target is not supported");
          }
        }
        return "OK";
      },
    },
  },
};
