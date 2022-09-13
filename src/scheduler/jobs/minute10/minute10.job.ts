import { Job } from "agenda";
import moment from "moment-timezone";
import { Agenda } from "../../agenda";
import { Miniute10Context } from "./common";
import cancelPendingOrder from "./steps/cancelPendingOrder";

export class Minute10Job {
  static jobName = "Minute10";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    console.log("Execute Job " + Minute10Job.jobName, moment().format());
    const ctx: Miniute10Context = {
      input: {},
      meta: {},
    };

    await cancelPendingOrder(ctx);
  }
}

export default Minute10Job;
