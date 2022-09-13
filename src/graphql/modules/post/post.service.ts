import { Dictionary, get } from "lodash";
import { CrudService } from "../../../base/crudService";
import { TopicModel } from "./topic/topic.model";
import { PostModel } from "./post.model";
class PostService extends CrudService<typeof PostModel> {
  private _topics: Dictionary<string> = {};
  constructor() {
    super(PostModel);
    TopicModel.find().then((topics) => topics.forEach((t) => (this._topics[t.slug] = t._id)));
  }

  async getTopicIdBySlug(slug: string) {
    if (!this._topics[slug]) {
      this._topics[slug] = await TopicModel.findOne({ slug }).then((res) => get(res, "_id"));
    }
    return this._topics[slug];
  }
}

const postService = new PostService();

export { postService };
