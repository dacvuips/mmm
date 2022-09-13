import { CrudService } from "../../../../base/crudService";
import { PostTagModel } from "./postTag.model";
class PostTagService extends CrudService<typeof PostTagModel> {
  constructor() {
    super(PostTagModel);
  }
}

const postTagService = new PostTagService();

export { postTagService };
