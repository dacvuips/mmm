import { get, set } from "lodash";
import slugfiy from "slugify";
import { ROLES } from "../../../constants/role.const";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
// import { AttachmentLoader } from "../attachment/attachment.model";
import { PostModel, PostStatus } from "./post.model";
import { postService } from "./post.service";
import { PostTagLoader } from "./postTag/postTag.model";
import { postViewLogService } from "./postViewLog/postViewLog.service";
import { TopicLoader } from "./topic/topic.model";

const Query = {
  getAllPost: async (root: any, args: any, context: Context) => {
    if (!context.isAdmin || !context.isEditor) {
      set(args, " q.filter.status", PostStatus.PUBLIC);
    }
    if (get(args, "q.filter.topicSlugs")) {
      const slugs: string[] = get(args, "q.filter.topicSlugs");
      const topicIds = await Promise.all(slugs.map((l) => postService.getTopicIdBySlug(l)));
      delete args.q.filter.topicSlugs;
      set(args, "q.filter.topicIds", { $in: topicIds });
    }
    return postService.fetch(args.q);
  },
  getOnePost: async (root: any, args: any, context: Context) => {
    const { id } = args;
    const post = await PostModel.findOneAndUpdate(
      { _id: id },
      { $inc: { view: 1 } },
      { new: true }
    );
    postViewLogService.emit("user_view", post, context);
    return post;
  },
};

const Mutation = {
  createPost: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { data } = args;
    if (!data.slug) {
      data.slug = slugfiy(data.title, {
        lower: true,
        strict: true,
      });
      if ((await PostModel.count({ slug: data.slug })) > 0) {
        data.slug += "-" + new Date().getMilliseconds();
      }
    }
    if (!data.priority) {
      data.priority = await PostModel.find()
        .sort({ priority: -1 })
        .limit(1)
        .exec()
        .then((res) => {
          if (res.length == 0) return 0;
          return res[0].priority + 1;
        });
    }
    const post = await postService.create(data);
    // await context.log(`Tạo bài đăng: ${post.title}`);
    return post;
  },
  updatePost: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;
    const post = await postService.updateOne(id, data);
    if (data.status == PostStatus.PUBLIC) {
      // await context.log(`Công khai bài đăng: ${post.title}`);
    }
    return post;
  },
  deleteOnePost: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    const post = await postService.deleteOne(id);
    // await context.log(`Xoá bài đăng ${post.title}`);
    return post;
  },
};

const Post = {
  tags: GraphQLHelper.loadManyById(PostTagLoader, "tagIds"),
  topics: GraphQLHelper.loadManyById(TopicLoader, "topicIds"),
  // attachments: GraphQLHelper.loadManyById(AttachmentLoader, "attachmentIds"),
};

export default {
  Query,
  Mutation,
  Post,
};
