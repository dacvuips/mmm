import KhongDau from "khong-dau";
import { random } from "lodash";

import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../context";
import { TopicModel } from "./topic.model";
import { topicService } from "./topic.service";

const Query = {
  getAllTopic: async (root: any, args: any, context: Context) => {
    return topicService.fetch(args.q);
  },
  getOneTopic: async (root: any, args: any, context: Context) => {
    const { id } = args;
    return await topicService.findOne({ _id: id });
  },
};

const Mutation = {
  createTopic: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    if (!data.slug) {
      data.slug = KhongDau(data.title).toLowerCase().trim().replace(/\ +/g, "-");
    }
    if ((await TopicModel.count({ slug: data.slug })) > 0) {
      data.slug += "-" + random(1000, 9999);
    }
    return await topicService.create(data);
  },
  updateTopic: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    return await topicService.updateOne(id, data);
  },
  deleteOneTopic: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await topicService.deleteOne(id);
  },
};

const Topic = {};

export default {
  Query,
  Mutation,
  Topic,
};
