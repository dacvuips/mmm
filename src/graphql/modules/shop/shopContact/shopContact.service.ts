import { CrudService } from "../../../../base/crudService";
import { ShopContactModel } from "./shopContact.model";
class ShopContactService extends CrudService<typeof ShopContactModel> {
  constructor() {
    super(ShopContactModel);
  }
}

const shopContactService = new ShopContactService();

export { shopContactService };
