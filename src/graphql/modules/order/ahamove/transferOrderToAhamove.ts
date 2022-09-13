import _ from "lodash";
import { onConfirmedOrder } from "../../../../events/onConfirmedOrder.event";
import { Ahamove } from "../../../../helpers/ahamove/ahamove";
import { CreateOrderProps } from "../../../../helpers/ahamove/type";
import { logger } from "../../../../loaders/logger";
import LocalBroker from "../../../../services/broker";
import { IOrderItem, OrderItemModel } from "../../orderItem/orderItem.model";
import { OrderLogModel, OrderLogType } from "../../orderLog/orderLog.model";
import { IShopBranch, ShopBranchLoader } from "../../shop/shopBranch/shopBranch.model";
import { IShopConfig } from "../../shop/shopConfig/shopConfig.model";
import { IOrder, OrderStatus, PaymentMethod, ShipMethod } from "../order.model";
import { orderService } from "../order.service";

export async function transferOrderToAhamove(order: IOrder) {
  const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
    id: order.fromMemberId.toString(),
  });
  const ahamove = new Ahamove({});
  // console.log("order", order.latitude, order.longitude);
  const ahamoveServices = await ahamove
    .fetchAllServices(order.latitude, order.longitude)
    .then((res) => res.filter((r: any) => /\-(BIKE|EXPRESS)/.test(r._id)));

  if (ahamoveServices.length == 0) {
    logger.info("Không có dịch vụ nào hỗ trợ vị trí giao hàng này, bỏ qua");
    // Không có dịch vụ nào hỗ trợ vị trí giao hàng này, bỏ qua
    return;
  }

  logger.info("CONFIRM ORDER");
  await confirmOrder(order, `Tự động xác nhận đơn, giao hàng nhanh qua ahamove`);

  const [orderItems, branch] = await Promise.all([
    OrderItemModel.find({ orderId: order._id }),
    ShopBranchLoader.load(order.shopBranchId),
  ]);
  const ahamoveService = ahamoveServices[0];
  const { order: ahamoveOrder } = await createAhamoveOrder(
    branch,
    shopConfig,
    order,
    ahamoveService._id,
    orderItems
  );

  order.shipMethod = ShipMethod.AHAMOVE;
  order.deliveryInfo = { ...order.deliveryInfo };
  order.deliveryInfo.orderId = ahamoveOrder._id;
  order.deliveryInfo.serviceName = ahamoveOrder.service_id;
  order.deliveryInfo.status = ahamoveOrder.status;
  order.deliveryInfo.statusText = _.get(Ahamove.StatusText, ahamoveOrder.status);
  order.deliveryInfo.partnerFee = ahamoveOrder.total_pay;
  order.deliveryInfo.deliveryTime = `${(ahamoveOrder.duration / 60).toFixed(0)} phút`;
  order.deliveryInfo.serviceIcon = "https://i.ibb.co/FK87WyJ/icon-ahamove.png";
  order.markModified("deliveryInfo");
  console.log("TRANSFER TO AHAMOVE");
  await order.save();
}

async function confirmOrder(order: IOrder, note: string) {
  const { sellerId, buyerId, toMemberId } = order;
  order.confirmTime = new Date();
  order.confirmNote = note;
  order.status = OrderStatus.CONFIRMED;
  await order.save();

  const log = new OrderLogModel({
    orderId: order._id,
    type: OrderLogType.CONFIRMED,
    memberId: sellerId,
    customerId: buyerId,
    orderStatus: OrderStatus.CONFIRMED,
    toMemberId: toMemberId,
  });

  await log.save().then((log) => {
    orderService.updateLogToOrder({ order, log });
  });

  onConfirmedOrder.next(order);
}

async function createAhamoveOrder(
  branch: IShopBranch,
  shopConfig: IShopConfig,
  order: IOrder,
  serviceId: any,
  orderItems: IOrderItem[]
) {
  const ahamove = new Ahamove({});
  const lat: number = _.get(branch, "location.coordinates.1");
  const lng: number = _.get(branch, "location.coordinates.0");
  const address = _.compact([branch.address, branch.ward, branch.district, branch.province]).join(
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
        cod: parseInt(
          (order.paymentMethod == PaymentMethod.COD ? order.amount - order.shipfee : 0).toString()
        ),
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
  } as CreateOrderProps);
  return ahamoveOrder;
}
