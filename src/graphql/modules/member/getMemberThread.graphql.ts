import { gql } from "apollo-server-express";
import { threadId } from "worker_threads";
import { Context } from "../../context";
import { ThreadLoader, ThreadModel } from "../thread/thread.model";
import { ThreadChannel, ThreadStatus } from "../thread/thread.type";
import { MemberModel } from "./member.model";

export default {
  schema: gql`
    extend type Member {
      "Mã trao đổi"
      threadId: ID

      thread: Thread
    }
  `,
  resolver: {
    Member: {
      thread: async (root: any, args: any, context: Context) => {
        if (root.threadId) return await ThreadLoader.load(root.threadId);

        const thread = await ThreadModel.findOneAndUpdate(
          { channel: ThreadChannel.member, memberId: root.id },
          { $set: { status: ThreadStatus.new } },
          { new: true, upsert: true }
        );

        root.threadId = thread._id;
        await MemberModel.updateOne({ _id: root._id }, { $set: { threadId: thread._id } });

        return thread;
      },
    },
  },
};
