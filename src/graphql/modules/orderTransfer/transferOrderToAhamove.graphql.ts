import { gql } from "apollo-server-express";
import { compact, get } from "lodash";

import { ROLES } from "../../../constants/role.const";
import { ErrorHelper } from "../../../helpers";
import { Ahamove } from "../../../helpers/ahamove/ahamove";
import { CreateOrderProps } from "../../../helpers/ahamove/type";
import cache from "../../../helpers/cache";
import redis from "../../../helpers/redis";
import { Context } from "../../context";
import { IOrder, OrderModel, OrderStatus, PaymentMethod, ShipMethod } from "../order/order.model";
import { IOrderItem, OrderItemModel } from "../orderItem/orderItem.model";
import { IShopBranch, ShopBranchModel } from "../shop/shopBranch/shopBranch.model";
import { IShopConfig, ShopConfigModel } from "../shop/shopConfig/shopConfig.model";

export default {
  schema: gql`
    extend type Mutation {
      transferOrderToAhamove(orderId: ID!, serviceId: String!, promotionCode: String): Order
    }
  `,
  resolver: {
    Mutation: {
      transferOrderToAhamove: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.MEMBER_STAFF);
        const { orderId, serviceId, promotionCode } = args;
        const order = await OrderModel.findById(orderId);
        if (!order) throw Error("Không tìm thấy đơn hàng");
        if (order.status != OrderStatus.CONFIRMED || order.shipMethod)
          throw Error("Đơn hàng không hợp lệ");
        if (order.shipMethod == ShipMethod.AHAMOVE) return order;
        if (order.sellerId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
        if (order.deliveryInfo?.orderId) {
          return order;
        }

        const ahamoveOrderTimes = await cache.incr(`order:ahamove:${orderId}`);
        if (ahamoveOrderTimes > 1) return OrderModel.findById(orderId);
        redis.expire(`order:ahamove:${orderId}`, 10); // tính trong vòng 10s

        const [orderItems, shopConfig, branch] = await Promise.all([
          OrderItemModel.find({ orderId: order._id }),
          ShopConfigModel.findOne({ memberId: context.sellerId }),
          ShopBranchModel.findById(order.shopBranchId),
        ]);

        const { order: ahamoveOrder } = await createAhamoveOrder(
          branch,
          shopConfig,
          order,
          serviceId,
          orderItems,
          promotionCode
        );

        order.shipMethod = ShipMethod.AHAMOVE;
        order.deliveryInfo = { ...order.deliveryInfo };
        order.deliveryInfo.orderId = ahamoveOrder._id;
        order.deliveryInfo.serviceName = ahamoveOrder.service_id;
        order.deliveryInfo.status = ahamoveOrder.status;
        order.deliveryInfo.statusText = get(Ahamove.StatusText, ahamoveOrder.status);
        order.deliveryInfo.partnerFee = ahamoveOrder.total_pay;
        order.deliveryInfo.promotionCode = ahamoveOrder.promo_code;
        order.deliveryInfo.partnerDiscount = ahamoveOrder.discount;
        order.deliveryInfo.deliveryTime = `${(ahamoveOrder.duration / 60).toFixed(0)} phút`;
        order.deliveryInfo.serviceIcon = "https://i.ibb.co/FK87WyJ/icon-ahamove.png";
        order.markModified("deliveryInfo");
        await order.save();
        return order;
      },
    },
  },
};
async function createAhamoveOrder(
  branch: IShopBranch,
  shopConfig: IShopConfig,
  order: IOrder,
  serviceId: any,
  orderItems: IOrderItem[],
  promotionCode?: string
) {
  const ahamove = new Ahamove({});
  const lat: number = get(branch, "location.coordinates.1");
  const lng: number = get(branch, "location.coordinates.0");
  const address = compact([branch.address, branch.ward, branch.district, branch.province]).join(
    ", "
  );
  const buyerAddress = order.buyerFullAddress;
  const ahamoveOrder = await ahamove.createOrder({
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
        cod: parseInt((order.paymentMethod == PaymentMethod.COD ? order.amount - order.shipfee : 0).toString()),
        mobile: order.buyerPhone,
      },
    ],
    payment_method: "CASH_BY_RECIPIENT",
    remarks: order.note,
    service_id: serviceId,
    items: orderItems.map((i) => ({
      _id: i._id,
      name: i.productName,
      num: i.qty,
      price: i.amount,
    })),
    promo_code: promotionCode,
  } as CreateOrderProps);
  return ahamoveOrder;
}
