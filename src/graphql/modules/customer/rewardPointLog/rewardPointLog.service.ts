import { CrudService } from "../../../../base/crudService";
import { RewardPointLogModel } from "./rewardPointLog.model";
class RewardPointLogService extends CrudService<typeof RewardPointLogModel> {
  constructor() {
    super(RewardPointLogModel);
  }
}

const rewardPointLogService = new RewardPointLogService();

export { rewardPointLogService };
