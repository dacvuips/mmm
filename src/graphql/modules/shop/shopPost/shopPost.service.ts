import _ from "lodash";
import { Dictionary } from "lodash";
import { CrudService } from "../../../../base/crudService";
import { ShopPostModel } from "./shopPost.model";
import { ShopTopicModel } from "./shopTopic/shopTopic.model";
class ShopPostService extends CrudService<typeof ShopPostModel> {
  private _topics: Dictionary<string> = {};
  constructor() {
    super(ShopPostModel);
  }
  async getTopicIdBySlug(slug: string) {
    if (!this._topics[slug]) {
      this._topics[slug] = await ShopTopicModel.findOne({ slug }).then((res) => _.get(res, "_id"));
    }
    return this._topics[slug];
  }
}

const shopPostService = new ShopPostService();

export { shopPostService };
