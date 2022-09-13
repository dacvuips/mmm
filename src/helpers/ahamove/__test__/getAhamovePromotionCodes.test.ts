import _ from "lodash";
import { MemberModel } from "../../../graphql/modules/member/member.model";
import { ShopBranchModel } from "../../../graphql/modules/shop/shopBranch/shopBranch.model";
import { ShopConfigModel } from "../../../graphql/modules/shop/shopConfig/shopConfig.model";
import { Ahamove } from "../ahamove";

export default test("Get Ahamove Promotion Codes", async () => {
  const ahamove = new Ahamove({});
  const shop = await MemberModel.findOne({ code: "3MSHOP" });
  const branch = await ShopBranchModel.findOne({ memberId: shop._id });
  const shopConfig = await ShopConfigModel.findOne({ memberId: shop._id });
  const lat: number = _.get(branch, "location.coordinates.1");
  const lng: number = _.get(branch, "location.coordinates.0");

  const data = await ahamove.getPromotionCodes({
    token: shopConfig.shipAhamoveToken,
    lat,
    lng,
    // payment_method: "CASH_BY_RECIPIENT",
    // service_id: "SGN-EXPRESS",
  });

  console.log("promotion", data);
});
