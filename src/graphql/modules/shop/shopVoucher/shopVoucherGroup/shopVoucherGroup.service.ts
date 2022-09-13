import { CrudService } from "../../../../../base/crudService";
import { ShopVoucherGroupModel } from "./shopVoucherGroup.model";
class ShopVoucherGroupService extends CrudService<typeof ShopVoucherGroupModel> {
  constructor() {
    super(ShopVoucherGroupModel);
  }
}

const shopVoucherGroupService = new ShopVoucherGroupService();

export { shopVoucherGroupService };
