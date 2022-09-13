import { CrudService } from "../../../base/crudService";
import { CustomerContactModel } from "./customerContact.model";
class CustomerContactService extends CrudService<typeof CustomerContactModel> {
  constructor() {
    super(CustomerContactModel);
  }
}

const customerContactService = new CustomerContactService();

export { customerContactService };
