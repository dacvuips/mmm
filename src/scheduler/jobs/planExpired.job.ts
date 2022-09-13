import { Job } from "agenda";
import moment from "moment-timezone";
import { SettingKey } from "../../configs/settingData";
import { EmailModel, EmailType } from "../../graphql/modules/email/email.model";
import { MemberModel } from "../../graphql/modules/member/member.model";
import { SettingHelper } from "../../graphql/modules/setting/setting.helper";
import { Plan } from "../../graphql/modules/subscription/subscription.model";
import { UtilsHelper } from "../../helpers";
import LocalBroker from "../../services/broker";
import { Agenda } from "../agenda";
import {
  createSubscriptionRequestProcess,
  validSubscriptionPlan,
} from "../../graphql/modules/subscription/subscriptionRequest/createSubscriptionRequest";

export class PlanExpiredJob {
  static jobName = "PlanExpired";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static async execute(job: Job) {
    console.log("Execute Job " + PlanExpiredJob.jobName, moment().format());
    await renewSubscription();
    const [template, appTitle] = await Promise.all([
      EmailModel.findOne({ type: EmailType.PLAN_EXPIRED }),
      SettingHelper.load(SettingKey.TITLE),
    ]);
    const expiredAt = moment().endOf("days").toDate();
    const cusor = await MemberModel.find({
      "subscription.expiredAt": { $lte: expiredAt },
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
      LocalBroker.emit("email.send", { from: appTitle, to: member.username, subject, html });
    });
    await cusor.close();
  }
}

export default PlanExpiredJob;

async function renewSubscription() {
  console.log("Renew Subscription Job");
  const expiredAt = moment().endOf("days").toDate();
  const cusor = await MemberModel.find({
    "subscription.expiredAt": { $lte: expiredAt },
  }).cursor();
  await cusor.eachAsync(async (member) => {
    let plan: Plan;
    try {
      validSubscriptionPlan(member.subscription.plan);
      plan = member.subscription.plan;
    } catch (err) {
      plan = Plan.FREE;
    }
    const ctx = {
      input: {
        plan: plan,
        months: 1,
        memberId: member._id,
        paymentLogMessage: "Tạo yêu cầu thanh toán gói tự động",
      },
    };

    return await createSubscriptionRequestProcess(ctx);
  });
  await cusor.close();
}
