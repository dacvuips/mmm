import { CrudService } from "../../../../base/crudService";
import { Context } from "../../../context";
import { IPost } from "../post.model";
import { PostTagModel } from "../postTag/postTag.model";
import { PostViewLogModel } from "./postViewLog.model";
class PostViewLogService extends CrudService<typeof PostTagModel> {
  constructor() {
    super(PostViewLogModel);
    this.on("user_view", (post: IPost, context: Context) => {
      PostViewLogModel.updateOne(
        { postId: post._id, userId: context.id },
        { $inc: { view: 1 } },
        { upsert: true }
      ).exec();
    });
  }
}

const postViewLogService = new PostViewLogService();

export { postViewLogService };
