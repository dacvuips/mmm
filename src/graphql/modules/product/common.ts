import _ from "lodash";
import cache from "../../../helpers/cache";
import { MemberModel } from "../member/member.model";

export namespace ProductCommon {
  /**
   * Láy danh sách ids cửa hàng cho phép bán
   * @param categoryId Mã danh mục cửa hàng
   * @returns Danh sách id cửa hàng hợp lệ
   */
  export async function getValidShopIds(categoryId?: string) {
    const key = `valid-shop-ids:${categoryId}`;
    let result = JSON.parse(await cache.get(key));
    if (_.isEmpty(result) == false) return result;

    const match: any = {
      activated: true,
      locked: false,
    };
    if (categoryId) {
      match.categoryId = categoryId;
    }
    result = await MemberModel.find(match)
      .select("_id")
      .then((res) => res.map((r) => r._id));
    await cache.set(key, JSON.stringify(result), 60); // cache  trong 1 phut
    return result;
  }
}
