import { TypedEmitter } from "tiny-typed-emitter";
import { Context } from "../../context";
import { ISupportTicket } from "./supportTicket.model";

export type SupportTicketEventHandler = (ticket: ISupportTicket, context: Context) => void;
interface ISupportTicketEvent {
  new: SupportTicketEventHandler;
  reopening: SupportTicketEventHandler;
  considering: SupportTicketEventHandler;
  assigning: SupportTicketEventHandler;
  request_more_info: SupportTicketEventHandler;
  info_completed: SupportTicketEventHandler;
  completed: SupportTicketEventHandler;
  canceled: SupportTicketEventHandler;
}

export class SupportTicketEvent extends TypedEmitter<ISupportTicketEvent> {}
