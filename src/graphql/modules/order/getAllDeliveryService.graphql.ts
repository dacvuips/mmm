import { gql } from "apollo-server-express";
import _ from "lodash";
import { compact, get } from "lodash";
import { ROLES } from "../../../constants/role.const";
import { Ahamove } from "../../../helpers/ahamove/ahamove";
import { CreateOrderProps } from "../../../helpers/ahamove/type";
import { logger } from "../../../loaders/logger";
import { Context } from "../../context";
import { MemberLoader } from "../member/member.model";
import { IShopBranch, ShopBranchModel } from "../shop/shopBranch/shopBranch.model";
import { IShopConfig, ShopConfigModel } from "../shop/shopConfig/shopConfig.model";
import { shopConfigService } from "../shop/shopConfig/shopConfig.service";
import { IOrder, OrderModel, ShipMethod } from "./order.model";

export type DeliveryService = {
  shipMethod: ShipMethod;
  serviceId: string;
  serviceName: string;
  iconUrl: string;
  duration: string;
  shipFee: number;
  discount?: number;
};

export default {
  schema: gql`
    extend type Query {
      getAllDeliveryService(orderId: ID!, ahamovePromotionCode: String): [DeliveryService]
    }
    type DeliveryService {
      "Phương thức vận chuyển ${Object.values(ShipMethod)}"
      shipMethod: String
      "Mã dịch vụ"
      serviceId: String
      "Tên dịch vụ"
      serviceName: String
      "Hình icon"
      iconUrl: String
      "Thời gian ước tính"
      duration: String
      "Phí ship"
      shipFee: Float
      "Giảm giá"
      discount: Float
    }
  `,
  resolver: {
    Query: {
      getAllDeliveryService: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
        const { orderId, ahamovePromotionCode } = args;
        const [shopConfig, order] = await Promise.all([
          ShopConfigModel.findOne({ memberId: context.sellerId }),
          OrderModel.findById(orderId),
        ]);
        if (!order) throw Error("Không tìm thấy đơn hàng");
        const branch = await ShopBranchModel.findById(order.shopBranchId);
        const services: DeliveryService[] = [];
        const {
          orderConfig: { ahamoveEnabled = true },
        } = shopConfig;
        if (ahamoveEnabled) {
          await setAhamoveServices(order, shopConfig, services, branch, ahamovePromotionCode);
        }
        services.push({
          shipMethod: ShipMethod.DRIVER,
          serviceId: ShipMethod.DRIVER,
          serviceName: "Tài xế nội bộ",
          duration: branch.shipPreparationTime,
          iconUrl: "https://i.ibb.co/pJzfmFg/delivery-man.png",
          shipFee: order.shipfee,
        });
        return services;
      },
    },
  },
};
async function setAhamoveServices(
  order: IOrder,
  shopConfig: IShopConfig,
  services: DeliveryService[],
  branch: IShopBranch,
  promotionCode?: string
) {
  const ahamove = new Ahamove({});
  // console.log("order", order.latitude, order.longitude);
  const ahamoveServices = await ahamove
    .fetchAllServices(order.latitude, order.longitude)
    .then((res) => res.filter((r: any) => /\-(BIKE|EXPRESS)/.test(r._id)));

  const lat: number = get(branch, "location.coordinates.1");
  const lng: number = get(branch, "location.coordinates.0");
  const address = compact([branch.address, branch.ward, branch.district, branch.province]).join(
    ", "
  );
  // console.log("address", address);
  if (_.isEmpty(shopConfig.shipAhamoveToken)) {
    await resetAhamoveToken();
  }
  const estimatedFees = await ahamove.estimatedFeeMutilService(
    {
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
        },
        {
          lat: parseFloat(order.latitude),
          lng: parseFloat(order.longitude),
          address: address,
          short_address: branch.district,
          name: branch.name,
          remarks: order.note,
        },
      ],
      payment_method: "CASH_BY_RECIPIENT",
      remarks: order.note,
      promo_code: promotionCode,
    } as CreateOrderProps,
    ahamoveServices.map((s: any) => ({ _id: s._id }))
  );
  // logger.info("estimatedFees", { estimatedFees });
  estimatedFees.forEach((fee: any) => {
    if (fee.http_code) {
      if (fee.http_code == "404 TOKEN_NOT_FOUND") {
        resetAhamoveToken();
      }
      return;
    }
    const service = ahamoveServices.find((s: any) => s._id == fee._id);
    services.push({
      shipMethod: ShipMethod.AHAMOVE,
      serviceId: fee._id,
      serviceName: service.name,
      iconUrl: service.icon_url,
      duration: (fee.duration / 60).toFixed(0),
      shipFee: fee.total_pay,
      discount: fee.discount,
    });
  });

  async function resetAhamoveToken() {
    const member = await MemberLoader.load(shopConfig.memberId);
    await shopConfigService.setAhamoveToken(member);
    shopConfig = await ShopConfigModel.findById(shopConfig._id);
    logger.info(`refresh ahamove token`);
  }
}
