import { Job } from "agenda";
import moment from "moment-timezone";
import {
  SupportTicketStatus,
  SupportTicketSubStatus,
} from "../../graphql/modules/supportTicket/common";
import { SupportTicketModel } from "../../graphql/modules/supportTicket/supportTicket.model";
import { ErrorHelper } from "../../helpers";
import { logger } from "../../loaders/logger";
import { Agenda } from "../agenda";

export class ClosedSupportTicketJob {
  static jobName = "ClosedSupportTicket";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    const supportTicket = await SupportTicketModel.findOne({
      _id: job.attrs.data.id,
    });

    if (!supportTicket) {
      throw ErrorHelper.mgRecoredNotFound(".Không tìm thấy yêu cầu hỗ trợ");
    }

    if (
      supportTicket.status === SupportTicketStatus.opening &&
      supportTicket.subStatus === SupportTicketSubStatus.new
    ) {
      try {
        await SupportTicketModel.findOneAndUpdate(
          { _id: job.attrs.data.id },
          {
            status: SupportTicketStatus.closed,
            subStatus: SupportTicketSubStatus.canceled,
          }
        );
      } catch (err) {
        logger.error("error", err.message);
      }
    }

    job.remove();
  }
}

export default ClosedSupportTicketJob;
