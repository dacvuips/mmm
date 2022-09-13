import { CrudService } from "../../../../base/crudService";
import { ThreadNoteModel } from "./threadNote.model";
class ThreadNoteService extends CrudService<typeof ThreadNoteModel> {
  constructor() {
    super(ThreadNoteModel);
  }
}

const threadNoteService = new ThreadNoteService();

export { threadNoteService };
