import { CrudService } from "../../../base/crudService";
import { ThreadModel } from "./thread.model";
class ThreadService extends CrudService<typeof ThreadModel> {
  constructor() {
    super(ThreadModel);
  }
}

const threadService = new ThreadService();

export { threadService };
