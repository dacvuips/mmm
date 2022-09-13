import { CrudService } from "../../../../base/crudService";
import { SupportTicketCommentModel } from "./supportTicketComment.model";
class SupportTicketCommentService extends CrudService<typeof SupportTicketCommentModel> {
  constructor() {
    super(SupportTicketCommentModel);
  }
}

const supportTicketCommentService = new SupportTicketCommentService();

export { supportTicketCommentService };
