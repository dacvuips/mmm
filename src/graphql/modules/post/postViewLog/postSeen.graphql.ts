import { gql } from "apollo-server-express";
import DataLoader from "dataloader";
import { get, keyBy } from "lodash";
import { Types } from "mongoose";
import { ttlCache } from "../../../../helpers/ttlCache";
import { Context } from "../../../context";
import { IPost } from "../post.model";
import { PostViewLogModel } from "./postViewLog.model";

export default {
  schema: gql`
    extend type Post {
      seen: Boolean
    }
  `,
  resolver: {
    Post: {
      seen: async (root: IPost, args: any, context: Context) => {
        return PostSeenLoader.load([root._id, context.id].join("|"));
      },
    },
  },
};

const PostSeenLoader = new DataLoader<string, boolean>(
  (ids: string[]) => {
    const splitIds = ids.map((id) => id.split("|"));
    const postIds = splitIds.map((id) => Types.ObjectId(id[0]));
    const userIds = splitIds.map((id) => Types.ObjectId(id[1]));
    return PostViewLogModel.aggregate([
      { $match: { postId: { $in: postIds }, userId: { $in: userIds } } },
      {
        $group: {
          _id: { postId: "$postId", userId: "$userId" },
          view: { $sum: "$view" },
        },
      },
    ]).then((list) => {
      const keyByIds = keyBy(
        list.map((l) => {
          l.id = [l._id.postId, l._id.userId].join("|");
          return l;
        }),
        "id"
      );
      return ids.map((id) => !!get(keyByIds, id));
    });
  },
  { cache: true, cacheMap: ttlCache({ ttl: 30000, maxSize: 100 }) }
);
