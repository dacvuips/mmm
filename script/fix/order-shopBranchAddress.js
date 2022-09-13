const { OrderModel } = require("../../dist/graphql/modules/order/order.model");
const _ = require("lodash");
const { ShopBranchModel } = require("../../dist/graphql/modules/shop/shopBranch/shopBranch.model");

(async function () {
  const shopBranchs = await ShopBranchModel.aggregate([
    {
      $project: {
        fullAddress: { $concat: ["$address", ", ", "$ward", ", ", "$district", ", ", "$province"] },
      },
    },
  ]);
  const shopBranchsKeyBy = await _.keyBy(shopBranchs, "_id");
  const orders = await OrderModel.find({}, "_id shopBranchId");

  console.log("Điều chỉnh ", orders.length, "Đơn hàng");
  const bulk = OrderModel.collection.initializeUnorderedBulkOp();
  for (const o of orders) {
    const fullAddress = _.get(shopBranchsKeyBy, `${o.shopBranchId}.fullAddress`, "");
    console.log("shopBranchFullAddresss", fullAddress);
    bulk.find({ _id: o._id }).update({ $set: { shopBranchAddress: fullAddress } });
  }
  if (bulk.length > 0) {
    console.log("Đang cập nhật");
    await bulk.execute();
  }
  console.log("DONE");
  process.exit();
})();
