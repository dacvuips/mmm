import { CrudService } from "../../../../base/crudService";
import { ThreadMessageModel } from "./threadMessage.model";
class ThreadMessageService extends CrudService<typeof ThreadMessageModel> {
  constructor() {
    super(ThreadMessageModel);
  }
}

const threadMessageService = new ThreadMessageService();

export { threadMessageService };
