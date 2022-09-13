import { CrudService } from "../../../../base/crudService";
import { SubscriptionRequestModel } from "./subscriptionRequest.model";

class SubscriptionRequestService extends CrudService<typeof SubscriptionRequestModel> {
  constructor() {
    super(SubscriptionRequestModel);
  }
}

const subscriptionRequestService = new SubscriptionRequestService();

export { subscriptionRequestService };
