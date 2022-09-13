import { CrudService } from "../../../../../base/crudService";
import { ShopSaleFeedGroupModel } from "./shopSaleFeedGroup.model";
class ShopSaleFeedGroupService extends CrudService<typeof ShopSaleFeedGroupModel> {
  constructor() {
    super(ShopSaleFeedGroupModel);
  }
}

const shopSaleFeedGroupService = new ShopSaleFeedGroupService();

export { shopSaleFeedGroupService };
