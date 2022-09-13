import { CrudService } from "../../../base/crudService";
import onAssigningTicket from "./events/onAssigningTicket";
import onCanceledTicket from "./events/onCanceledTicket";
import onCompletedTicket from "./events/onCompletedTicket";
import onCompletedTicketInfo from "./events/onCompletedTicketInfo";
import onConsideringTicket from "./events/onConsideringTicket";
import onNewTicket from "./events/onNewTicket";
import onRequestTicketInfo from "./events/onRequestTicketInfo";
import { SupportTicketEvent } from "./supportTicket.event";
import { SupportTicketModel } from "./supportTicket.model";
class SupportTicketService extends CrudService<typeof SupportTicketModel> {
  public event = new SupportTicketEvent();
  constructor() {
    super(SupportTicketModel);
    this.event.on("new", onNewTicket);
    this.event.on("considering", onConsideringTicket);
    this.event.on("assigning", onAssigningTicket);
    this.event.on("request_more_info", onRequestTicketInfo);
    this.event.on("info_completed", onCompletedTicketInfo);
    this.event.on("completed", onCompletedTicket);
    this.event.on("canceled", onCanceledTicket);
  }
}

const supportTicketService = new SupportTicketService();

export { supportTicketService };
