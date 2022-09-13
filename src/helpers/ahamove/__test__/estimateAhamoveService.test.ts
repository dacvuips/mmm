import _ from "lodash";
import { MemberModel } from "../../../graphql/modules/member/member.model";
import { OrderModel, OrderStatus, PaymentMethod } from "../../../graphql/modules/order/order.model";
import { OrderItemModel } from "../../../graphql/modules/orderItem/orderItem.model";
import { ShopBranchModel } from "../../../graphql/modules/shop/shopBranch/shopBranch.model";
import { ShopConfigModel } from "../../../graphql/modules/shop/shopConfig/shopConfig.model";
import { Ahamove } from "../ahamove";
import { CreateOrderProps } from "../type";

export default test("Estimate Ahamove Service", async () => {
  const ahamove = new Ahamove({});
  const shop = await MemberModel.findOne({ code: "3MSHOP" });
  const order = await OrderModel.findOne({ fromMemberId: shop._id, status: OrderStatus.COMPLETED });
  const orderItems = await OrderItemModel.find({ orderId: order._id });
  const branch = await ShopBranchModel.findOne({ _id: order.shopBranchId });
  const shopConfig = await ShopConfigModel.findOne({ memberId: shop._id });
  const lat: number = _.get(branch, "location.coordinates.1");
  const lng: number = _.get(branch, "location.coordinates.0");

  const ahamoveServices = await ahamove
    .fetchAllServices(order.latitude, order.longitude)
    .then((res) => res.filter((r: any) => /\-(BIKE|EXPRESS)/.test(r._id)));

  console.log("ahamove service", ahamoveServices);
  console.log("orderId", order._id);
  const address = _.compact([branch.address, branch.ward, branch.district, branch.province]).join(
    ", "
  );
  const buyerAddress = order.buyerFullAddress;
  const data = await ahamove.estimatedFee({
    token: shopConfig.shipAhamoveToken,
    order_time: parseInt((Date.now() / 1000).toFixed(0)),
    path: [
      {
        lat: lat,
        lng: lng,
        address: address,
        short_address: branch.district,
        name: branch.name,
        remarks: order.note,
        mobile: branch.phone,
      },
      {
        lat: parseFloat(order.latitude),
        lng: parseFloat(order.longitude),
        address: buyerAddress,
        short_address: order.buyerDistrict,
        name: order.buyerName,
        cod: parseInt((order.paymentMethod == PaymentMethod.COD ? order.amount : 0).toString()),
        mobile: order.buyerPhone,
      },
    ],
    payment_method: "CASH_BY_RECIPIENT",
    remarks: order.note,
    service_id: "SGN-BIKE",
    items: orderItems.map((i) => ({
      _id: i._id,
      name: i.productName,
      num: i.qty,
      price: i.amount,
    })),
    promo_code: "TEST3M",
  } as CreateOrderProps);

  console.log("data", data);
});
