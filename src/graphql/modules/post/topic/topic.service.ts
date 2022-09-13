import { CrudService } from "../../../../base/crudService";
import { PostTagModel } from "../postTag/postTag.model";
import { TopicModel } from "./topic.model";
class TopicService extends CrudService<typeof PostTagModel> {
  constructor() {
    super(TopicModel);
  }
}

const topicService = new TopicService();

export { topicService };
