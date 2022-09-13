import { CrudService } from "../../../../../base/crudService";
import { WithdrawRequestModel } from "./withdrawRequest.model";
class WithdrawRequestService extends CrudService<typeof WithdrawRequestModel> {
  constructor() {
    super(WithdrawRequestModel);
  }
}

const withdrawRequestService = new WithdrawRequestService();

export { withdrawRequestService };
