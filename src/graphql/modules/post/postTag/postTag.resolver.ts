import KhongDau from "khong-dau";
import { random } from "lodash";

import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../context";
import { PostTagModel } from "./postTag.model";
import { postTagService } from "./postTag.service";

const Query = {
  getAllPostTag: async (root: any, args: any, context: Context) => {
    return postTagService.fetch(args.q);
  },
  getOnePostTag: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await postTagService.findOne({ _id: id });
  },
};

const Mutation = {
  createPostTag: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    if (!data.slug) {
      data.slug = KhongDau(data.name).toLowerCase().trim().replace(/\ +/g, "-");
      if ((await PostTagModel.count({ slug: data.slug })) > 0) {
        data.slug += "-" + random(1000, 9999);
      }
    }
    return await postTagService.create(data);
  },
  updatePostTag: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await postTagService.updateOne(id, data);
  },
  deleteOnePostTag: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await postTagService.deleteOne(id);
  },
};

const PostTag = {};

export default {
  Query,
  Mutation,
  PostTag,
};
