import { CrudService } from "../../../../../base/crudService";
import { ShopPostTagModel } from "./shopPostTag.model";
class ShopPostTagService extends CrudService<typeof ShopPostTagModel> {
  constructor() {
    super(ShopPostTagModel);
  }
}

const shopPostTagService = new ShopPostTagService();

export { shopPostTagService };
