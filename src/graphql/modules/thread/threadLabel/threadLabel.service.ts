import { CrudService } from "../../../../base/crudService";
import { ThreadLabelModel } from "./threadLabel.model";
class ThreadLabelService extends CrudService<typeof ThreadLabelModel> {
  constructor() {
    super(ThreadLabelModel);
  }
}

const threadLabelService = new ThreadLabelService();

export { threadLabelService };
