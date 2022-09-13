import _ from "lodash";
import { PayoutStatus } from "momo-salary";
import { CrudService } from "../../../../base/crudService";
import { momoSalary1 } from "../../../../helpers/momo/momoSalary";
import { DisbursePayoutModel, DisbursePayoutStatus, IDisbursePayout } from "./disbursePayout.model";
class DisbursePayoutService extends CrudService<typeof DisbursePayoutModel> {
  constructor() {
    super(DisbursePayoutModel);
  }

  async updatePayoutDetail(payout: IDisbursePayout) {
    const payoutDetail = await momoSalary1.getPayoutFileDetail(payout.meta.payoutFileId);
    if (!payoutDetail) return payout;
    const setData: any = { "meta.detail": payoutDetail };
    _.set(setData, "processingMsg", payoutDetail.statusName);
    switch (payoutDetail.status) {
      case PayoutStatus.canceled:
        _.set(setData, "status", DisbursePayoutStatus.canceled);
        break;
      case PayoutStatus.denied:
        _.set(setData, "status", DisbursePayoutStatus.denied);
        break;
      case PayoutStatus.disbursed:
        _.set(setData, "status", DisbursePayoutStatus.approved);
        break;
      case PayoutStatus.expired:
        _.set(setData, "status", DisbursePayoutStatus.error);
        break;
      case PayoutStatus.new:
        _.set(setData, "status", DisbursePayoutStatus.processing);
        break;
    }
    return await DisbursePayoutModel.findOneAndUpdate(
      { _id: payout._id },
      { $set: setData },
      { new: true }
    );
  }
}

const disbursePayoutService = new DisbursePayoutService();

export { disbursePayoutService };
