const { OrderItemModel } = require('../../dist/graphql/modules/orderItem/orderItem.model');
const { OrderModel } = require('../../dist/graphql/modules/order/order.model');
const _ = require('lodash');

(async function() {
  const orders = await OrderItemModel.aggregate([
      { $group: { 
        _id: "$orderId",
        items: { 
            $push: {
                _id: "$_id",
                productName: "$productName",
                toppings: "$toppings",
                qty: "$qty",
                basePrice: "$basePrice",
                amount: "$amount",
                toppingAmount: "$toppingAmount",
            }
        }
    } }
  ]);
  console.log('Điều chỉnh ', orders.length, 'Đơn hàng');
  const bulk = OrderModel.collection.initializeUnorderedBulkOp();
  for (const o of orders) {
    const itemText = processItemText(o.items);
    console.log('itemText', itemText);
    bulk.find({ _id: o._id }).update({ $set: { itemText  }});
  }
  if (bulk.length > 0) {
    console.log('Đang cập nhật');
    await bulk.execute();
  }
  console.log("DONE");
  process.exit();

})();

function processItemText(items) {
  const itemText = items
    .map((i) => {
      let line = `${i.productName}`;
      if (i.toppings?.length > 0) {
        line += ": " + i.toppings.map((t) => t.optionName).join(" - ");
      }
      line += ` (${i.basePrice + i.toppingAmount/i.qty} đ) x ${i.qty} = ${i.amount} đ`
      return line;
    })
    .join("\n");
  return itemText;
}