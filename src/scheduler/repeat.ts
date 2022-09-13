// Repeat Hello World
import { configs } from "../configs";
import CampaignJob from "./jobs/campaign.job";
import CancelPickupStoreOrderJob from "./jobs/cancelPickupStoreOrder.job";
import CheckCustomerBirthdayJob from "./jobs/checkCustomerBirthday/checkCustomerBirthday.job";
import CollaboratorJob from "./jobs/collaborator.job";
import CustomerCommissionJob from "./jobs/customerCommission.job";
import DailyJob from "./jobs/daily/daily.job";
import GlobalCustomerConvertJob from "./jobs/globalCustomerConvert.job";
import MemberCommissionJob from "./jobs/memberCommission.job";
import Minute10Job from "./jobs/minute10/minute10.job";
import OrderJob from "./jobs/order.job";
import PlanExpiredJob from "./jobs/planExpired.job";
import PlanRemindExpiredJob from "./jobs/planRemindExpired.job";
import PlanRemindStopJob from "./jobs/planRemindStop.job";
import PlanStopJob from "./jobs/planStoped.job";
import RefreshAhamoveTokenJob from "./jobs/refreshAhamoveToken.job";
import SyncSocialEngagementJob from "./jobs/syncSocialEngagement.job";
import UpdateCustomerContextJob from "./jobs/updateCustomerContext.job";
import UpdateMemberTotalOrderJob from "./jobs/updateMemberTotalOrder.job";

export function InitRepeatJobs() {
  console.log("Generate Repeat Jobs");
  CollaboratorJob.create({})
    .repeatEvery("5 minutes", { skipImmediate: true })
    .unique({ name: CollaboratorJob.jobName })
    .save();
  MemberCommissionJob.create({})
    .repeatEvery("2 minutes", { skipImmediate: true })
    .unique({ name: MemberCommissionJob.jobName })
    .save();
  CustomerCommissionJob.create({})
    .repeatEvery("2 minutes", { skipImmediate: true })
    .unique({ name: CustomerCommissionJob.jobName })
    .save();
  OrderJob.create({})
    .repeatEvery("24 hours", { skipImmediate: true })
    .unique({ name: OrderJob.jobName })
    .save();
  CampaignJob.create({})
    .repeatEvery("2 minutes", { skipImmediate: true })
    .unique({ name: OrderJob.jobName })
    .save();
  SyncSocialEngagementJob.create({})
    .repeatEvery("1 hours", { skipImmediate: true })
    .unique({ name: SyncSocialEngagementJob.name })
    .save();
  // .then((job) => job.run());

  RefreshAhamoveTokenJob.create({})
    .repeatEvery("1 day", { skipImmediate: true })
    .unique({ name: RefreshAhamoveTokenJob.jobName })
    .save();
  // .then((job) => job.run());

  CancelPickupStoreOrderJob.create({})
    .repeatEvery("0 0 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: CancelPickupStoreOrderJob.jobName })
    .save();
  // .then((job) => job.run());

  UpdateCustomerContextJob.create({})
    .repeatEvery("0 * * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: UpdateCustomerContextJob.jobName })
    .save();
  // .then((job) => job.run());

  PlanRemindExpiredJob.create({})
    .repeatEvery("0 7 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: PlanRemindExpiredJob.jobName })
    .save();
  PlanExpiredJob.create({})
    .repeatEvery("0 7 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: PlanExpiredJob.jobName })
    .save();
  PlanRemindStopJob.create({})
    .repeatEvery("0 7 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: PlanRemindStopJob.jobName })
    .save();
  PlanStopJob.create({})
    .repeatEvery("0 7 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: PlanStopJob.jobName })
    .save();

  UpdateMemberTotalOrderJob.create({})
    .repeatEvery("0 0 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: UpdateMemberTotalOrderJob.jobName })
    .save();

  GlobalCustomerConvertJob.create({})
    .repeatEvery("0 0 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: GlobalCustomerConvertJob.jobName })
    .save();

  DailyJob.create({})
    .repeatEvery("0 0 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: DailyJob.jobName })
    .save();

  Minute10Job.create({})
    .repeatEvery("10 minutes", { skipImmediate: true })
    .unique({ name: Minute10Job.jobName })
    .save();

  CheckCustomerBirthdayJob.create({})
    .repeatEvery("0 7 * * *", { skipImmediate: true, timezone: configs.timezone })
    .unique({ name: CheckCustomerBirthdayJob.jobName })
    .save();
}
