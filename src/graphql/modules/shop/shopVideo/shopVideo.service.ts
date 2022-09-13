import { CrudService } from "../../../../base/crudService";
import { ShopVideoModel } from "./shopVideo.model";
class ShopVideoService extends CrudService<typeof ShopVideoModel> {
  constructor() {
    super(ShopVideoModel);
  }
}

const shopVideoService = new ShopVideoService();

export { shopVideoService };
