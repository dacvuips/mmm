import { Job } from "agenda";
import moment from "moment-timezone";
import { SettingKey } from "../../configs/settingData";
import { EmailModel, EmailType } from "../../graphql/modules/email/email.model";
import { IMember, MemberModel } from "../../graphql/modules/member/member.model";
import { SettingHelper } from "../../graphql/modules/setting/setting.helper";
import { SubscriptionModel } from "../../graphql/modules/subscription/subscription.model";
import { UtilsHelper } from "../../helpers";
import LocalBroker from "../../services/broker";
import { Agenda } from "../agenda";

export class PlanRemindExpiredJob {
  static jobName = "PlanRemindExpired";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    console.log("Execute Job " + PlanRemindExpiredJob.jobName, moment().format());
    const [template, appTitle] = await Promise.all([
      EmailModel.findOne({ type: EmailType.PLAN_REMIND_EXPIRED }),
      SettingHelper.load(SettingKey.TITLE),
    ]);
    const expiredAt = moment().add(7, "days").toDate();
    const cusor = await MemberModel.find({
      "subscription.expiredAt": { $lte: expiredAt },
      "subscription.remindExpiredAt": { $exists: false },
    }).cursor();
    await cusor.eachAsync(async (member) => {
      const context = {
        ...member,
      };
      const { subject, html } = UtilsHelper.parseObjectWithInfo({
        object: {
          subject: template.subject,
          html: template.html,
        },
        info: context,
      });
      await member.updateOne({ $set: { "subscription.remindExpiredAt": new Date() } }).exec();
      await SubscriptionModel.updateOne(
        { _id: member.subscription._id },
        { $set: { "subscription.remindExpiredAt": new Date() } }
      ).exec();
      LocalBroker.emit("email.send", { from: appTitle, to: member.username, subject, html });
    });
    await cusor.close();
  }
}

export default PlanRemindExpiredJob;
