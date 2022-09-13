import { CrudService } from "../../../../base/crudService";
import { ShopCategoryModel } from "./shopCategory.model";
class ShopCategoryService extends CrudService<typeof ShopCategoryModel> {
  constructor() {
    super(ShopCategoryModel);
  }
}

const shopCategoryService = new ShopCategoryService();

export { shopCategoryService };
