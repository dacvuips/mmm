import { CrudService } from "../../../../../base/crudService";
import { ShopTopicModel } from "./shopTopic.model";
class ShopTopicService extends CrudService<typeof ShopTopicModel> {
  constructor() {
    super(ShopTopicModel);
  }
}

const shopTopicService = new ShopTopicService();

export { shopTopicService };
