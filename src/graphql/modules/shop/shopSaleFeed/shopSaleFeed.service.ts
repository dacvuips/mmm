import { CrudService } from "../../../../base/crudService";
import { ShopSaleFeedModel } from "./shopSaleFeed.model";
class ShopSaleFeedService extends CrudService<typeof ShopSaleFeedModel> {
  constructor() {
    super(ShopSaleFeedModel);
  }
}

const shopSaleFeedService = new ShopSaleFeedService();

export { shopSaleFeedService };
