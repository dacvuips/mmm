import { CrudService } from "../../../../base/crudService";
import { GlobalCustomerModel } from "./globalCustomer.model";
class GlobalCustomerService extends CrudService<typeof GlobalCustomerModel> {
  constructor() {
    super(GlobalCustomerModel);
  }
}

const globalCustomerService = new GlobalCustomerService();

export { globalCustomerService };
