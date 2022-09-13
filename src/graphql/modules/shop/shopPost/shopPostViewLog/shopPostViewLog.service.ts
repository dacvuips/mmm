import { CrudService } from "../../../../../base/crudService";
import { Context } from "../../../../context";
import { IShopPost } from "../shopPost.model";
import { ShopPostViewLogModel } from "./shopPostViewLog.model";
class ShopPostViewLogService extends CrudService<typeof ShopPostViewLogModel> {
  constructor() {
    super(ShopPostViewLogModel);
    this.on("user_view", (post: IShopPost, context: Context) => {
      ShopPostViewLogModel.updateOne(
        { postId: post._id, userId: context.id },
        { $inc: { view: 1 } },
        { upsert: true }
      ).exec();
    });
  }
}

const shopPostViewLogService = new ShopPostViewLogService();

export { shopPostViewLogService };
