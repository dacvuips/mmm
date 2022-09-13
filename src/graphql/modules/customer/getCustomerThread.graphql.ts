import { gql } from "apollo-server-express";
import { Context } from "../../context";
import { ThreadLoader, ThreadModel } from "../thread/thread.model";
import { ThreadChannel, ThreadStatus } from "../thread/thread.type";
import { CustomerModel } from "./customer.model";

export default {
  schema: gql`
    extend type Customer {
      "Mã trao đổi"
      threadId: ID

      thread: Thread
    }
  `,
  resolver: {
    Customer: {
      thread: async (root: any, args: any, context: Context) => {
        if (root.threadId) return await ThreadLoader.load(root.threadId);

        const thread = await ThreadModel.findOneAndUpdate(
          { channel: ThreadChannel.customer, customerId: root.id, memberId: context.sellerId },
          { $set: { status: ThreadStatus.new } },
          { new: true, upsert: true }
        );

        root.threadId = thread._id;
        await CustomerModel.updateOne({ _id: root._id }, { $set: { threadId: thread._id } });

        return thread;
      },
    },
  },
};
