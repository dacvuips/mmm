import jwt from "jsonwebtoken";
import _, { Dictionary, get, groupBy, keyBy, maxBy, remove, sumBy } from "lodash";
import moment from "moment-timezone";
import { Types } from "mongoose";

import { BaseError } from "../../../base/error";
import { configs } from "../../../configs";
import { SettingKey } from "../../../configs/settingData";
import { UtilsHelper, VietnamPostHelper } from "../../../helpers";
import { Ahamove } from "../../../helpers/ahamove/ahamove";
import { CreateOrderProps } from "../../../helpers/ahamove/type";
import cache from "../../../helpers/cache";
import { hashCode } from "../../../helpers/functions/hashCode";
import googleMap from "../../../helpers/map/googleMap";
import momo from "../../../helpers/momo";
import {
  ICalculateAllShipFeeRequest,
  PickupType,
} from "../../../helpers/vietnamPost/resources/type";
import { MainConnection } from "../../../loaders/database";
import { logger } from "../../../loaders/logger";
import LocalBroker from "../../../services/broker";
import { addressService } from "../address/address.service";
import {
  AddressStorehouseModel,
  IAddressStorehouse,
} from "../addressStorehouse/addressStorehouse.model";
import { CampaignModel } from "../campaign/campaign.model";
import { CampaignSocialResultModel } from "../campaignSocialResult/campaignSocialResult.model";
import { CollaboratorLoader, CollaboratorModel } from "../collaborator/collaborator.model";
import { CustomerModel, ICustomer } from "../customer/customer.model";
import { RewardPointLogStats } from "../customer/rewardPointLog/loaders/rewardPointLogStats";
import { IRewardPointLog } from "../customer/rewardPointLog/rewardPointLog.model";
import { RewardPointLogBuilder } from "../customer/rewardPointLog/rewardPointLogBuilder";
import {
  CustomerVoucherModel,
  CustomerVoucherStatus,
  ICustomerVoucher,
} from "../customerVoucher/customerVoucher.model";
import { IMember } from "../member/member.model";
import { PaymentStatus } from "../mixin/payment.graphql";
import { IOrderItem, OrderItemModel } from "../orderItem/orderItem.model";
import { OrderItemTopping } from "../orderItem/types/orderItemTopping.schema";
import { IProduct, ProductModel } from "../product/product.model";
import { SettingHelper } from "../setting/setting.helper";
import { OperatingTimeStatus } from "../shop/shopBranch/operatingTime.graphql";
import {
  IShopBranch,
  ShopBranchLoader,
  ShopBranchModel,
} from "../shop/shopBranch/shopBranch.model";
import { RewardBy, RewardUnit } from "../shop/shopConfig/rewardPointConfig.graphql";
import { IShopConfig, ShopConfigModel } from "../shop/shopConfig/shopConfig.model";
import { shopConfigService } from "../shop/shopConfig/shopConfig.service";
import {
  IShopVoucher,
  ShopVoucherModel,
  ShopVoucherType,
} from "../shop/shopVoucher/shopVoucher.model";
import { DiscountUnit } from "../shop/shopVoucher/types/discountItem.schema";
import { OrderHelper } from "./order.helper";
import {
  IOrder,
  OrderModel,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PickupMethod,
} from "./order.model";

type OrderItemInput = {
  productId: string;
  quantity: number;
  note: string;
  toppings: OrderItemTopping[];
};

class VoucherError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export type CreateOrderInput = {
  isPrimary?: boolean;
  items?: OrderItemInput[];
  offerItemIds?: [string];
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerProvinceId?: string;
  buyerDistrictId?: string;
  buyerWardId?: string;
  buyerFullAddress?: string;
  buyerAddressNote?: string;
  shipMethod?: string;
  paymentMethod?: string;
  addressDeliveryId?: string;
  note?: string;
  latitude?: number;
  longitude?: number;
  pickupMethod?: PickupMethod;
  shopBranchId?: string;
  pickupTime?: Date;
  promotionCode?: string;
  customerVoucherId?: string;
  useRewardPoint?: boolean;
  offerGroupIndex?: number;
  tableCode?: string;
};
export class OrderGenerator {
  order: IOrder;
  orderItems: IOrderItem[] = [];
  products: Dictionary<IProduct>;
  unitPrice: number;
  voucher: IShopVoucher;
  customerVoucher: ICustomerVoucher;
  shopConfig: IShopConfig;
  rewardPointLog: IRewardPointLog;
  shopBranch: IShopBranch;

  constructor(
    public orderInput: CreateOrderInput,
    public seller: IMember,
    public buyer: ICustomer,
    public campaignCode?: string
  ) {
    this.order = new OrderModel({
      code: "",
      isPrimary: false,
      isCrossSale: false,
      itemIds: [],
      amount: 0,
      subtotal: 0,
      toppingAmount: 0,
      itemCount: 0,
      status: OrderStatus.PENDING,
      commission1: 0,
      commission2: 0,
      commission3: 0,
      buyerId: buyer._id,
      buyerName: orderInput.buyerName,
      buyerPhone: orderInput.buyerPhone,
      buyerAddress: orderInput.buyerAddress,
      buyerProvince: orderInput.buyerProvinceId,
      buyerDistrict: orderInput.buyerDistrictId,
      buyerWard: orderInput.buyerWardId,
      buyerProvinceId: orderInput.buyerProvinceId,
      buyerDistrictId: orderInput.buyerDistrictId,
      buyerWardId: orderInput.buyerWardId,
      buyerFullAddress: orderInput.buyerFullAddress,
      buyerAddressNote: orderInput.buyerAddressNote,
      sellerBonusPoint: 0,
      buyerBonusPoint: 0,
      // delivery
      itemWeight: 0,
      itemWidth: 0, // chi???u r???ng
      itemLength: 0, // chi???u d??i
      itemHeight: 0, // chi???u cao
      shipfee: 0,
      // deliveryInfo: {},
      shipMethod: orderInput.shipMethod,
      paymentMethod: orderInput.paymentMethod,
      productIds: [],
      // addressDeliveryId: orderInput.addressDeliveryId,
      note: orderInput.note,
      longitude: orderInput.longitude,
      latitude: orderInput.latitude,
      orderLogIds: [],
      orderType: OrderType.SHOP,
      shopBranchId: orderInput.shopBranchId,
      pickupMethod: orderInput.pickupMethod,
      pickupTime: orderInput.pickupTime,

      discountLogs: [],

      rewardPoint: 0,
      useRewardPoint: orderInput.useRewardPoint,
      discountPoint: 0,

      tableCode: orderInput.tableCode,
    });
  }
  async generate() {
    await this.getUnitPrice();
    await Promise.all([this.setOrderItems()]);
    this.calculateAmount(); // T??nh ti???n tr?????c ph?? ship
    await this.setOrderSeller();
    await this.getShopConfig();
    await this.ensureOrderLimit();
    await this.ensureItemLimit();
    await this.ensureProductLimit();
    await this.setCollaborator();
    await Promise.all([this.setCampaign(), this.calculateShipfee()]);
    this.calculateAmount(); // T??nh ti???n sau ph?? ship
    await Promise.all([this.applyVoucher()]);
    this.calculateAmount(); // T??nh ti???n sau ph?? ship
    await this.applyRewardPoint();
    this.calculateAmount(); // T??nh ti???n sau ??i???m th?????ng
    await this.processItemText(); // X??? l??
  }

  /** ??p d???ng ??i???m th?????ng */
  private async applyRewardPoint() {
    const {
      rewardPointConfig: { active },
    } = this.shopConfig;

    if (active == false) return;

    if (this.orderInput.useRewardPoint == true) {
      // S??? d???ng ??i???m th?????ng lu???
      // Kh??ng t??nh ??i???m th?????ng cho ????n h??ng s??? d???ng ??i???m t??ch lu???
      const { total } = await RewardPointLogStats.loader.load(this.buyer._id.toString());
      if (total <= 0) {
        throw Error("Kh??ng c?? ??i???m th?????ng ????? s??? d???ng");
      }
      const { amount } = this.order;
      const discountPoint = amount > total ? total : amount;
      const rewardPointLog = RewardPointLogBuilder.useForOrder(this.order, discountPoint);
      this.order.discountLogs.push({
        type: "USE_REWARD_POINT",
        discount: discountPoint,
        rewardPointLogId: rewardPointLog._id,
      });
      this.order.discount += discountPoint;
      this.order.discountPoint = discountPoint;
      this.order.remainRewardPoint = total - discountPoint;
      this.rewardPointLog = rewardPointLog;
      this.order.rewardPoint = 0;
    } else {
      // Kh??ng s??? d???ng ??i???m th?????ng, t??nh ??i???m theo c???u h??nh
      const {
        rewardPointConfig: { rewardBy, rewardUnit, value },
      } = this.shopConfig;
      const { amount } = this.order;

      if (rewardBy == RewardBy.order) {
        let rewardPoint = 0;
        // T??nh theo ????n h??ng
        if (rewardUnit == RewardUnit.cast) {
          // T??nh tr??n gi?? tr??? ????n h??ng
          rewardPoint = Math.floor(amount / 1000) * value;
        } else {
          // T??nh ??i???m tr???c ti???p cho 1 ????n h??ng
          rewardPoint = value;
        }
        this.order.rewardPoint = rewardPoint;
      } else {
        this.order.rewardPoint = sumBy(this.orderItems, (i) => i.rewardPoint * i.qty);
      }
    }
  }

  /** Ki???m tra gi???i h???n s??? l?????ng tr??n t???ng s???n ph???m */
  private async ensureProductLimit() {
    for (const item of this.orderItems) {
      const product = this.products[item.productId];
      if (product.limitSale > 0) {
        // S???n ph???m c?? gi???i h???n s??? l?????ng mua
        if (product.limitSaleByDay) {
          // Gi???i h???n s??? l?????ng mua trong ng??y
          const saledCount = await this.getSaledProductCountByDay(product._id);
          if (saledCount + item.qty >= product.limitSale) {
            // S??? l?????ng ???? b??n nhi???u h??n s??? l?????ng gi???i h???n
            throw new BaseError(500, "order-error", `S???n ph???m ${product.name} ???? b??n h???t.`);
          }
        }
      }
    }
  }

  /**
   * L??y s??? l?????ng s???n ph???m ???? b??n trong ng??y
   * @param productId M?? s???n ph???m
   */
  private async getSaledProductCountByDay(productId: string) {
    const key = `order-saled-product:${productId}:${moment().format("YYYY-MM-DD")}`;
    const res = JSON.parse(await cache.get(key));
    if (_.isEmpty(res) == false) return res.count;
    logger.info(`?????m s??? l?????ng ???? b??n trong ng??y t??? database`);
    const count = await OrderItemModel.aggregate([
      {
        $match: {
          productId: Types.ObjectId(productId),
          // Kh??ng t??nh ????n ???? hu???
          status: { $nin: [OrderStatus.CANCELED, OrderStatus.FAILURE] },
          // ????n trong ng??y
          createdAt: { $gte: moment().startOf("day").toDate() },
        },
      },
      { $group: { _id: "productId", count: { $sum: "$qty" } } },
    ]).then((res) => _.get(res, "0.count", 0));
    await cache.set(key, JSON.stringify({ count }), 60 * 1); // Cache Trong v??ng 1 ph??t

    return count;
  }

  /** L??y c???u h??nh ch??? shop */
  private async getShopConfig() {
    this.shopConfig = await LocalBroker.call("shopConfig.get", {
      id: this.seller._id.toString(),
    });
  }

  /** Ki???m tra gi???i h???n s??? ????n ???????c ?????t trong ng??y */
  private async ensureOrderLimit() {
    if (this.shopConfig.limitOpenOrder > 0) {
      // C?? gi???i h???n s??? l?????ng
      const pendingOrderCount = await this.getPendingOrderCount();
      if (pendingOrderCount >= this.shopConfig.limitOpenOrder) {
        // S??? l?????ng ????n h??ng ??ang ch??? x??? l?? nhi???u h??n s??? ????n gi???i h???n trong ng??y
        throw new BaseError(
          403,
          "order-error",
          `Ch??? ???????c ?????t t???i ??a ${this.shopConfig.limitOpenOrder} ????n c??ng m???t l??c.`
        );
      }
    }
  }

  /** L??y s??? l?????ng ????n h??ng ??ang x??? l?? trong ng??y c???a ng?????i mua */
  private async getPendingOrderCount() {
    const key = `pending-order:${this.buyer._id}:${moment().format("YYYY-MM-DD")}`;
    const res = JSON.parse(await cache.get(key));
    if (_.isEmpty(res) == false) return res.count;
    logger.info(`L??y s??? ????n h??ng ??ang x??? l?? t??? database`);
    const count = await OrderModel.count({
      buyerId: this.buyer._id,
      // ????n ???????c t???o trong ng??y
      createdAt: { $gte: moment().startOf("day").toDate() },
      // ????n ch??a ???????c ho??n th??nh ho???c hu???
      status: { $nin: [OrderStatus.COMPLETED, OrderStatus.CANCELED, OrderStatus.FAILURE] },
    });
    await cache.set(key, JSON.stringify({ count }), 60 * 1); // Cache trong v??ng 1 ph??t
    return count;
  }

  /** Ki???m tra s??? l?????ng s???n ph???m gi???i h???n trong m???t ????n h??ng */
  private async ensureItemLimit() {
    if (this.shopConfig.limitItem > 0) {
      // C???u h??nh c?? gi???i h???n s??? l?????ng s???n ph???m
      if (this.order.itemCount > this.shopConfig.limitItem) {
        // S??? l?????ng s???n ph???m nhi???u h??n s??? l?????ng gi???i h???n
        throw new BaseError(
          403,
          "order-error",
          `S??? l?????ng s???n ph???m t???i ??a c?? th??? ?????t l?? ${this.shopConfig.limitItem}.`
        );
      }
    }
  }
  private async applyVoucher() {
    if (!this.orderInput.promotionCode) return;
    try {
      await this.validateVoucher();
      switch (this.voucher.type) {
        case ShopVoucherType.DISCOUNT_BILL: {
          if (this.voucher.discountUnit == DiscountUnit.VND) {
            this.order.discount =
              this.voucher.discountValue > this.order.subtotal
                ? this.order.subtotal
                : this.voucher.discountValue;
          } else {
            const discountValue = (this.order.subtotal * this.voucher.discountValue) / 100;
            this.order.discount =
              this.voucher.maxDiscount > discountValue ? discountValue : this.voucher.maxDiscount;
          }
          this.order.discountDetail = this.voucher.description;
          this.order.discountLogs.push({
            type: ShopVoucherType.DISCOUNT_BILL,
            discount: this.order.discount,
          });
          break;
        }
        case ShopVoucherType.DISCOUNT_ITEM: {
          let hasItem = false;
          let discount = 0;
          let discountItems = keyBy(this.voucher.discountItems, "productId");
          let orderItems = groupBy(this.orderItems, "productId");
          for (const items of Object.values(orderItems)) {
            const productId = items[0].productId.toString();
            if (discountItems[productId]) {
              hasItem = true;
              const discountItem = discountItems[productId];
              const totalAmount = sumBy(items, "amount");
              if (discountItem.discountUnit == DiscountUnit.VND) {
                const value =
                  discountItem.discountValue > totalAmount
                    ? totalAmount
                    : discountItem.discountValue;
                this.order.discountLogs.push({
                  type: ShopVoucherType.DISCOUNT_ITEM,
                  discount: value,
                  productId: productId,
                  itemIds: items.map((i) => i._id),
                });
                discount += value;
              } else {
                const discountValue = (totalAmount * discountItem.discountValue) / 100;
                const value =
                  discountItem.maxDiscount > discountValue
                    ? discountValue
                    : discountItem.maxDiscount;
                this.order.discountLogs.push({
                  type: ShopVoucherType.DISCOUNT_ITEM,
                  discount: value,
                  productId: productId,
                  itemIds: items.map((i) => i._id),
                });
                discount += value;
              }
            }
          }
          if (!hasItem) throw new VoucherError(`Ch??a c?? s???n ph???m ??u ????i trong ????n h??ng`);
          this.order.discount = discount;
          break;
        }
        case ShopVoucherType.OFFER_ITEM: {
          let hasItem = false;
          let discount = 0;
          let offerItems = keyBy(this.voucher.offerItems, "productId");
          let orderItems = groupBy(this.orderItems, "productId");
          const orderSide = this.voucher.offerHighestPrice ? "desc" : "asc";
          const orderedItems = _.orderBy(
            Object.values(orderItems),
            (i) => i[0].basePrice,
            orderSide
          );

          let totalOfferQty = 0;

          for (const items of orderedItems) {
            const productId = items[0].productId.toString();
            if (offerItems[productId]) {
              hasItem = true;
              const offerItem = offerItems[productId];
              const totalQty = sumBy(items, "qty");
              const offerQty = totalQty > offerItem.qty ? offerItem.qty : totalQty;
              const value = offerQty * items[0].basePrice;
              this.order.discountLogs.push({
                type: ShopVoucherType.OFFER_ITEM,
                discount: value,
                productId: productId,
                itemIds: items.map((i) => i._id),
                offerQty: offerQty,
              });
              discount += value;
              totalOfferQty += offerQty;
            }
          }
          if (!hasItem) throw new VoucherError(`Ch??a c?? s???n ph???m ??u ????i trong ????n h??ng`);

          // Tr?????ng h???p t???ng qu?? c???n ki???m tra l???i ??i???u ki???n ????n h??ng t???i thi???u v?? s???n ph???m t???i thi???u
          const { minSubtotal, minItemQty } = this.voucher;
          if (minSubtotal > 0 && this.order.subtotal - discount < minSubtotal)
            throw new VoucherError(
              `????n h??ng y??u c???u t???i thi???u ${UtilsHelper.toMoney(minSubtotal)}??`
            );
          if (minItemQty > 0 && this.order.itemCount - totalOfferQty < minItemQty)
            throw new VoucherError(`S??? l?????ng m??n t???i thi???u ${minItemQty} m??n`);

          this.order.discount = discount;
          break;
        }
        case ShopVoucherType.OFFER_ITEM_2: {
          let hasDiscount = false;
          let orderItems = groupBy(this.orderItems, "productId");
          const orderSide = this.voucher.offerHighestPrice ? "desc" : "asc";
          const orderedItems = _.orderBy(
            Object.values(orderItems),
            (i) => i[0].basePrice,
            orderSide
          );

          for (let i = 0; i < this.voucher.offerItemGroups.length; i++) {
            if (this.orderInput.offerGroupIndex != null && i != this.orderInput.offerGroupIndex)
              continue;
            const group = this.voucher.offerItemGroups[i];
            let hasItem = false;
            let discount = 0;
            let offerItems = keyBy(group, "productId");
            for (const items of orderedItems) {
              const productId = items[0].productId.toString();

              if (this.orderInput.offerItemIds?.length > 0) {
                let orderOfferItems = keyBy(this.orderInput.offerItemIds);
                if (!orderOfferItems[productId]) continue;
              }
              if (offerItems[productId]) {
                hasItem = true;
                const offerItem = offerItems[productId];
                const totalQty = sumBy(items, "qty");
                const offerQty = totalQty > offerItem.qty ? offerItem.qty : totalQty;
                const value = offerQty * items[0].basePrice;
                discount += value;
                this.order.discountLogs.push({
                  type: ShopVoucherType.OFFER_ITEM_2,
                  discount: value,
                  productId: productId,
                  itemIds: items.map((i) => i._id),
                  offerQty: offerQty,
                });
              }
            }
            if (!hasItem) continue;
            this.order.discount = discount;
            hasDiscount = true;
            break;
          }
          if (!hasDiscount) throw new VoucherError(`Ch??a c?? s???n ph???m ??u ????i trong ????n h??ng`);
          break;
        }
        case ShopVoucherType.SHIP_FEE: {
          if (this.order.shipfee == 0) throw new VoucherError("????n h??ng kh??ng t??nh ph?? ship");
          if (this.voucher.discountUnit == DiscountUnit.VND) {
            const value =
              this.voucher.discountValue > this.order.shipfee
                ? this.order.shipfee
                : this.voucher.discountValue;
            this.order.discount = value;
            this.order.discountLogs.push({ type: ShopVoucherType.SHIP_FEE, discount: value });
          } else {
            const discountValue = (this.order.shipfee * this.voucher.discountValue) / 100;
            const value =
              this.voucher.maxDiscount > discountValue ? discountValue : this.voucher.maxDiscount;
            this.order.discount = value;
            this.order.discountLogs.push({ type: ShopVoucherType.SHIP_FEE, discount: value });
          }
          this.order.discountDetail = this.voucher.description;
          break;
        }
        case ShopVoucherType.SAME_PRICE: {
          let hasItem = false;
          let discount = 0;
          let orderItems = groupBy(this.orderItems, "productId");
          const orderSide = this.voucher.offerHighestPrice ? "desc" : "asc";
          const orderedItems = _.orderBy(
            Object.values(orderItems),
            (i) => i[0].basePrice,
            orderSide
          );
          if (this.voucher.offerAllItem) {
            // ??p d???ng cho t??t c??? s???n ph???m
            let offeredQty = 0;
            const discountLogs: any = {};
            const orderedItems = _.orderBy(this.orderItems, (i) => i.basePrice, orderSide);
            for (const item of orderedItems) {
              if (item.basePrice <= this.voucher.samePrice) {
                // S???n ph???m c?? gi?? nh??? h??n gi?? tr??? ?????ng gi??, th?? ko t??nh.
                continue;
              }
              hasItem = true;
              const totalQty = item.qty;
              let offerQty = 0;
              if (this.voucher.offerQty == 0) {
                // Kh??ng gi???i h???n s??? l?????ng ?????ng gi??
                offerQty = totalQty;
              } else {
                offerQty =
                  totalQty + offeredQty > this.voucher.offerQty
                    ? this.voucher.offerQty - offeredQty
                    : totalQty;
              }
              const discountPrice = item.basePrice - this.voucher.samePrice;
              const value = offerQty * discountPrice;
              discount += value;

              if (!discountLogs[item.productId]) {
                discountLogs[item.productId] = {
                  type: ShopVoucherType.SAME_PRICE,
                  discount: 0,
                  productId: item.productId,
                  itemIds: [],
                  offerQty: 0,
                };
              }
              discountLogs[item.productId].itemIds.push(item._id);
              discountLogs[item.productId].discount += value;
              discountLogs[item.productId].offerQty += offerQty;

              offeredQty += offerQty;
              if (this.voucher.offerQty > 0 && offeredQty >= this.voucher.offerQty) {
                // H???t s??? l?????ng ??u ????a
                break;
              }
            }
            if (!hasItem) throw new VoucherError(`Ch??a c?? s???n ph???m ??u ????i trong ????n h??ng`);
            this.order.discount = discount;
            this.order.discountLogs = [...this.order.discountLogs, ...Object.values(discountLogs)];
            break;
          } else {
            let offerItems = keyBy(this.voucher.offerItems, "productId");

            for (const items of orderedItems) {
              const productId = items[0].productId.toString();
              if (offerItems[productId]) {
                hasItem = true;
                const offerItem = offerItems[productId];
                const totalQty = sumBy(items, "qty");
                const offerQty = totalQty > offerItem.qty ? offerItem.qty : totalQty;
                const samePrice =
                  items[0].basePrice > this.voucher.samePrice
                    ? this.voucher.samePrice
                    : items[0].basePrice;
                const discountPrice = items[0].basePrice - samePrice;
                const value = offerQty * discountPrice;
                discount += value;
                this.order.discountLogs.push({
                  type: ShopVoucherType.SAME_PRICE,
                  discount: value,
                  productId: productId,
                  itemIds: items.map((i) => i._id),
                  offerQty: offerQty,
                });
              }
            }
            if (!hasItem) throw new VoucherError(`Ch??a c?? s???n ph???m ??u ????i trong ????n h??ng`);
            this.order.discount = discount;
            break;
          }
        }
        case ShopVoucherType.SAME_PRICE_2: {
          let hasDiscount = false;
          let orderItems = groupBy(this.orderItems, "productId");
          const orderSide = this.voucher.offerHighestPrice ? "desc" : "asc";
          const orderedItems = _.orderBy(
            Object.values(orderItems),
            (i) => i[0].basePrice,
            orderSide
          );
          for (let i = 0; i < this.voucher.offerItemGroups2.length; i++) {
            if (this.orderInput.offerGroupIndex != null && i != this.orderInput.offerGroupIndex)
              continue;
            const group = this.voucher.offerItemGroups2[i];
            let hasItem = false;
            let discount = 0;
            let offerItems = keyBy(group.items, "productId");
            const vocuherSamePrice = group.samePrice || this.voucher.samePrice;
            for (const items of orderedItems) {
              const productId = items[0].productId.toString();
              if (offerItems[productId]) {
                hasItem = true;
                const offerItem = offerItems[productId];
                const totalQty = sumBy(items, "qty");
                const offerQty = totalQty > offerItem.qty ? offerItem.qty : totalQty;
                const samePrice =
                  items[0].basePrice > vocuherSamePrice ? vocuherSamePrice : items[0].basePrice;
                const discountPrice = items[0].basePrice - samePrice;
                const value = offerQty * discountPrice;
                discount += value;
                this.order.discountLogs.push({
                  type: ShopVoucherType.SAME_PRICE_2,
                  discount: value,
                  productId: productId,
                  itemIds: items.map((i) => i._id),
                  offerQty: offerQty,
                });
              }
            }
            if (!hasItem) continue;
            this.order.discount = discount;
            hasDiscount = true;
            break;
          }
          if (!hasDiscount) throw new VoucherError(`Ch??a c?? s???n ph???m ??u ????i trong ????n h??ng`);
          break;
        }
        default:
          throw new VoucherError("??u ????i kh??ng h???p l???");
      }
      this.order.discountDetail = this.voucher.description;
      this.order.promotionCode = this.orderInput.promotionCode;
      this.order.voucherId = this.voucher._id;
      if (this.customerVoucher) {
        this.order.customerVoucherId = this.customerVoucher._id;
      }
    } catch (err) {
      if (err instanceof VoucherError) {
        throw err;
      } else {
        logger.error(err);
        throw Error("??u ????i kh??ng h???p l???.");
      }
    }
  }
  private async validateCustomerVoucher() {
    this.customerVoucher = await CustomerVoucherModel.findById(this.orderInput.customerVoucherId);
    if (!this.customerVoucher) throw Error("??u ????i kh??ng t??n t???i ");
    if (this.customerVoucher.voucherId.toString() != this.voucher._id.toString()) throw Error();
    if (this.customerVoucher.status != CustomerVoucherStatus.STILL_ALIVE)
      throw Error("??u ????i h???t h???n");
    if (this.customerVoucher.issueNumber <= this.customerVoucher.used) {
      this.customerVoucher.status = CustomerVoucherStatus.EXPIRED;
      await this.customerVoucher.save();
      throw Error("???? h???t s??? l?????ng ??u ????i");
    }
    if (this.customerVoucher.expiredDate && moment().isAfter(this.customerVoucher.expiredDate)) {
      this.customerVoucher.status = CustomerVoucherStatus.EXPIRED;
      await this.customerVoucher.save();
      throw Error("??u ????i h???t h???n");
    }
  }
  private async validateVoucher() {
    this.voucher = await ShopVoucherModel.findOne({
      code: this.orderInput.promotionCode,
      memberId: this.seller._id,
    });
    if (!this.voucher) throw new VoucherError("??u ????i kh??ng t???n t???i");
    if (!this.voucher.isActive) throw new VoucherError("??u ????i ???? h???t hi???u l???c");
    if (this.voucher.startDate && moment(this.voucher.startDate).isAfter(new Date()))
      throw new VoucherError("??u ????i ch??a ???????c k??ch ho???t");
    if (this.voucher.endDate && moment(this.voucher.endDate).isBefore(new Date()))
      throw new VoucherError("??u ????i ???? k???t th??c");

    if (this.voucher.applyISODayOfWeek?.length > 0) {
      if (!this.voucher.applyISODayOfWeek.includes((moment().isoWeekday() % 7) + 1))
        throw new VoucherError("??u ????i kh??ng ??p d???ng trong ng??y h??m nay, vui l??ng th??? l???i sau"); // Kh??ng trong ng??y trong tu???n ??p d???ng
    }

    if (this.voucher.applyTimeOfDay?.length > 0) {
      let inApplyTime: boolean = false;
      this.voucher.applyTimeOfDay.forEach((timeRange) => {
        var compareTime = moment(); //get time
        var startTime = moment(timeRange[0], "HH:mm");
        var endTime = moment(timeRange[1], "HH:mm");

        if (compareTime.isBetween(startTime, endTime)) {
          inApplyTime = true;
        }
      });
      if (!inApplyTime) throw new VoucherError("Ngo??i khung gi??? ??u ????i, vui l??ng th??? l???i sau"); // Kh??ng trong khung gi??? ??p d???ng
    }
    if (this.voucher.minSubtotal > 0 && this.order.subtotal < this.voucher.minSubtotal)
      throw new VoucherError(
        `????n h??ng y??u c???u t???i thi???u ${UtilsHelper.toMoney(this.voucher.minSubtotal)}??`
      );
    if (this.voucher.minItemQty > 0 && this.order.itemCount < this.voucher.minItemQty)
      throw new VoucherError(`S??? l?????ng m??n t???i thi???u ${this.voucher.minItemQty} m??n`);
    if (
      this.voucher.applyPaymentMethods.length > 0 &&
      !this.voucher.applyPaymentMethods.includes(this.order.paymentMethod)
    )
      throw new VoucherError(`Ph????ng th???c thanh to??n kh??ng ???????c ??p d???ng ??u ????i.`);
    if (this.voucher.applyItemIds.length > 0) {
      const applyItemIds = this.voucher.applyItemIds.map((id) => id.toString());
      const allItemIds = [...applyItemIds];
      let hasApplyItem = false; // C?? s???n ph???m n???m trong danh s??ch ??p d???ng
      let hasOutsideItem = false; // C?? s???n ph???m n???m ngo??i danh s??ch ??p d???ng
      let outsideItem: IOrderItem;
      for (const item of this.orderItems) {
        if (applyItemIds.includes(item.productId.toString())) {
          remove(allItemIds, (id) => id == item.productId.toString());
          hasApplyItem = true;
          continue;
        } else {
          hasOutsideItem = true;
          outsideItem = item;
        }
      }
      if (!hasApplyItem) throw new VoucherError("??u ????i ch??? ??p d???ng cho m???t s??? s???n ph???m.");
      if (this.voucher.requireAllApplyItem && allItemIds.length > 0) {
        throw new VoucherError("Kh??ng ????? ??i???u ki???n ??p d???ng ??u ????i");
      }
      if (this.voucher.onlyApplyItem && hasOutsideItem) {
        throw new VoucherError(`??u ????i kh??ng ??p d???ng cho "${outsideItem.productName}"`);
      }
    }
    if (this.voucher.exceptItemIds.length > 0) {
      const exceptItemIds = this.voucher.exceptItemIds.map((id) => id.toString());
      for (const item of this.orderItems) {
        if (exceptItemIds.includes(item.productId.toString())) {
          throw new VoucherError("??u ????i ch??? ??p d???ng cho m???t s??? s???n ph???m.");
        }
      }
    }
    if (this.voucher.issueNumber > 0) {
      let issueNumber = 0;
      if (!this.voucher.issueByDate) {
        issueNumber = await OrderModel.aggregate([
          { $match: { sellerId: this.seller._id, voucherId: this.voucher._id } },
          { $group: { _id: null, total: { $sum: 1 } } },
        ]).then((res) => get(res, "0.total", 0) as number);
      } else {
        const startDate = moment().startOf("day").toDate();
        issueNumber = await OrderModel.aggregate([
          {
            $match: {
              sellerId: this.seller._id,
              voucherId: this.voucher._id,
              createdAt: { $gte: startDate },
            },
          },
          { $group: { _id: null, total: { $sum: 1 } } },
        ]).then((res) => get(res, "0.total", 0) as number);
      }
      if (this.voucher.issueNumber <= issueNumber) throw new VoucherError("??u ????i ???? h???t");
    }
    if (this.voucher.useLimit > 0) {
      let used = 0;
      if (!this.voucher.useLimitByDate) {
        used = await OrderModel.aggregate([
          {
            $match: {
              sellerId: this.seller._id,
              voucherId: this.voucher._id,
              buyerId: this.buyer._id,
            },
          },
          { $group: { _id: null, total: { $sum: 1 } } },
        ]).then((res) => get(res, "0.total", 0) as number);
      } else {
        const startDate = moment().startOf("day").toDate();
        used = await OrderModel.aggregate([
          {
            $match: {
              sellerId: this.seller._id,
              voucherId: this.voucher._id,
              createdAt: { $gte: startDate },
              buyerId: this.buyer._id,
            },
          },
          { $group: { _id: null, total: { $sum: 1 } } },
        ]).then((res) => get(res, "0.total", 0) as number);
      }
      if (this.voucher.useLimit <= used) throw new VoucherError("??u ????i ???? h???t");
    }
    if (this.voucher.isPersonal) {
      await this.validateCustomerVoucher();
    }
  }
  private async setOrderSeller() {
    this.order.fromMemberId = this.seller._id;
    // if (!this.orderInput.isPrimary) {
    //   const sellerIds = Object.keys(groupBy(Object.values(this.products), "memberId"));
    //   if (sellerIds.length > 1) throw Error("S???n ph???m kh??ng c??ng 1 c???a h??ng");
    //   this.seller = await MemberModel.findById(sellerIds[0]);
    // }
    this.order.sellerId = this.seller._id;
    this.order.sellerCode = this.seller.code;
    this.order.sellerName = this.seller.shopName || this.seller.name;
  }

  /** Xu???t d??? li???u ????n h??ng nh??p */
  toDraft() {
    const order = this.order;
    order.items = this.orderItems;
    return order;
  }

  /** Kh???i t???o ????n h??ng th???t */
  async toOrder() {
    const session = await MainConnection.startSession();
    try {
      await session.withTransaction(async (session) => {
        this.order.code = await OrderHelper.generateCode();
        await this.preparePaymentInfo();
        if (this.customerVoucher) {
          const payload = {
            $inc: { used: 1 },
            $push: {
              logs: {
                _id: Types.ObjectId(),
                createdAt: new Date(),
                orderId: this.order._id,
                discount: this.order.discount,
              },
            },
          };
          await this.customerVoucher.updateOne(payload, { session }).exec();
        }
        if (this.order.useRewardPoint && this.order.discountPoint > 0 && this.rewardPointLog) {
          // S??? d???ng ??i???m th?????ng
          // T??nh to??n ??i???m th?????ng l???i 1 l???n kh??ng Cache
          RewardPointLogStats.loader.clear(this.buyer._id.toString());
          const { total } = await RewardPointLogStats.loader.load(this.buyer._id.toString());
          if (total < this.order.discountPoint) {
            throw Error("Kh??ng ????? ??i???m th?????ng ????? ??p d???ng");
          }
          await this.rewardPointLog.save({ session });
          RewardPointLogStats.loader.clear(this.buyer._id.toString());
        }
        await this.order.save({ session });
        await OrderItemModel.insertMany(this.orderItems, { session });
        await CustomerModel.updateOne(
          { _id: this.order.buyerId },
          {
            $set: {
              addressNote: this.order.buyerAddressNote,
              "context.orderNote": this.order.note,
            },
          },
          { session }
        ).exec();
      });

      return this.order;
    } catch (err) {
      logger.error(`L???i ?????t h??ng`, err);
      throw new BaseError(500, `order-error`, `?????t h??ng kh??ng th??nh c??ng. Vui l??ng th??? l???i`);
    } finally {
      session.endSession();
    }
  }

  /** Khai b??o th??ng tin thanh to??n */
  private async preparePaymentInfo() {
    const { paymentMethod, amount, _id, shopBranchId, code, fromMemberId } = this.order;
    const { code: shopCode } = this.seller;
    switch (paymentMethod) {
      case PaymentMethod.MOMO: {
        logger.info(`T???o m?? thanh to??n b???ng QRCode`);
        const [domain] = await Promise.all([SettingHelper.load(SettingKey.APP_DOMAIN)]);
        // Thanh to??n b???ng momo
        const {
          momo: { partnerCode, secretKey, accessKey, iosSchemeId, mode },
        } = configs;
        const { code: shopCode } = this.seller;
        const extraData = "shop:" + fromMemberId;
        const orderInfo = `Thanh to??n ????n h??ng ${code}`;
        const momoTransaction = await momo.payQrcode({
          partnerCode,
          partnerName: this.seller.shopName,
          amount: amount,
          requestId: _id,
          storeId: shopBranchId,
          lang: "vi",
          orderId: code,
          orderInfo: orderInfo,
          redirectUrl: `${domain}/${shopCode}/order/${code}`,
          // ipnUrl: `https://webhook.site/f3449f45-efe6-4487-9d89-f73629ad4959`,
          ipnUrl: `${domain}/api/paymentTracking/momo`,
          extraData: extraData,
          secretKey,
          accessKey,
        });

        this.order.paymentMeta = {
          ...momoTransaction,
          extra: extraData,
          appScheme: iosSchemeId,
          orderLabel: `Thanh to??n ????n h??ng ${this.order.code}`,
          partnerName: this.seller.shopName,
          fee: 0,
          description: `Thanh to??n ????n h??ng ${this.order.code}`,
          username: this.order.buyerName,
          partner: "merchant",
          isTestMode: mode != "live",
        };
        this.order.paymentLogs = [{ message: `T???o M?? Code thanh to??n`, createdAt: new Date() }];
        this.order.paymentStatus = PaymentStatus.pending;
        break;
      }
      default: {
      }
    }
  }

  private async setCampaign() {
    if (!this.campaignCode) return;
    const campaign = await CampaignModel.findOne({ code: this.campaignCode });
    if (!campaign) return;
    const campaignSocialResults = await CampaignSocialResultModel.find({
      memberId: this.order.fromMemberId,
      campaignId: campaign.id,
    }).then((res) => keyBy(res, "productId"));
    this.orderItems = this.orderItems.map((item: IOrderItem) => {
      const campaignRes = campaignSocialResults[item.productId];
      if (campaignRes) {
        item.campaignId = campaign._id;
        item.campaignSocialResultId = campaignRes._id;
      }
      return item;
    });
  }
  private async calculateAmount() {
    this.order.amount = this.order.subtotal + this.order.shipfee - this.order.discount;
  }
  private async calculateShipfee() {
    switch (this.order.pickupMethod) {
      case PickupMethod.STORE:
        this.order.shipfee = 0;
        return;
      case PickupMethod.DELIVERY: {
        await this.checkShopBranchOperationTime();
        return await this.calculatePickupDeliveryFee();
      }

      default:
        throw new Error("Ph????ng th???c nh???n h??ng ch??a ???????c h??? tr???.");
    }
  }

  private async checkShopBranchOperationTime() {
    const [shopBranch] = await Promise.all([ShopBranchLoader.load(this.order.shopBranchId)]);
    let day = moment().day();
    if (day == 0) day = 7;
    const operatingTime = shopBranch.operatingTimes.find((o) => o.day == day);
    if (!shopBranch.isOpen || !operatingTime || operatingTime.status == OperatingTimeStatus.CLOSED)
      throw Error("C???a h??ng ch??a m??? c???a.");
    if (operatingTime.status == OperatingTimeStatus.TIME_FRAME) {
      var isOpen = false;
      var toDate = moment();
      for (const time of operatingTime.timeFrames) {
        if (moment(time[0], "HH:mm").isBefore(toDate) && moment(time[1], "HH:mm").isAfter(toDate)) {
          isOpen = true;
          break;
        }
      }
      if (!isOpen) throw Error("C???a h??ng kh??ng m??? c???a.");
    }
    this.shopBranch = shopBranch;
    this.order.shopBranchAddress =
      shopBranch.address +
      ", " +
      shopBranch.ward +
      ", " +
      shopBranch.district +
      ", " +
      shopBranch.province;
  }
  private async calculatePickupDeliveryFee() {
    const {
      orderConfig: { ahamoveShipFee },
    } = this.shopConfig;

    if (ahamoveShipFee) {
      const ahamoveOrder = await this.estimateAhamoveService();
      const { distance, total_fee } = ahamoveOrder;
      this.order.shipfee = total_fee;
      this.order.shipDistance = distance;
    } else {
      const distance = await this.calculateShopBranchDistance(
        this.order.shopBranchId,
        parseFloat(this.order.longitude),
        parseFloat(this.order.latitude)
      );
      const {
        shipUseOneKmFee,
        shipOneKmFee,
        shipDefaultDistance,
        shipNextFee,
        shipDefaultFee,
      } = this.shopBranch;
      if (distance <= 1 && shipUseOneKmFee) {
        this.order.shipfee = shipOneKmFee;
      } else {
        const nextDistance = distance > shipDefaultDistance ? distance - shipDefaultDistance : 0;
        this.order.shipfee = shipDefaultFee + shipNextFee * nextDistance;
      }
      this.order.shipDistance = distance;
    }
  }
  private async estimateAhamoveService() {
    const {
      address: branchAddress,
      ward,
      district,
      province,
      name: branchName,
      phone: branchPhone,
    } = this.shopBranch;
    const {
      note: orderNote,
      latitude,
      longitude,
      buyerFullAddress,
      buyerDistrict,
      buyerName,
      buyerPhone,
      paymentMethod,
      amount: orderAmount,
    } = this.order;

    if (_.isEmpty(this.shopConfig.shipAhamoveToken)) {
      await this.resetAhamoveToken();
    }
    // decode shipAhamoveToken and check if expired then reset token
    const decoded = jwt.decode(this.shopConfig.shipAhamoveToken) as any;
    if (decoded.exp < Date.now() / 1000) {
      await this.resetAhamoveToken();
    }
    const { shipAhamoveToken } = this.shopConfig;
    const ahamoveServices = await this.getAhamoveServices().catch(async (err) => {
      if (err.message == "Token does not exist in system") {
        await this.resetAhamoveToken();
        return await this.getAhamoveServices();
      }
    });
    if (ahamoveServices.length == 0) {
      throw Error(`V??? tr?? giao h??ng kh??ng ???????c h??? tr???.`);
    }
    const ahamove = new Ahamove({});
    const lat: number = get(this.shopBranch, "location.coordinates.1");
    const lng: number = get(this.shopBranch, "location.coordinates.0");
    const address = _.compact([branchAddress, ward, district, province]).join(", ");

    const orderData = {
      token: shipAhamoveToken,
      order_time: parseInt((Date.now() / 1000).toFixed(0)),
      path: [
        {
          lat: lat,
          lng: lng,
          address: address,
          short_address: district,
          name: branchName,
          remarks: orderNote,
          mobile: branchPhone,
        },
        {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
          address: buyerFullAddress,
          short_address: buyerDistrict,
          name: buyerName,
          cod: parseInt((paymentMethod == PaymentMethod.COD ? orderAmount : 0).toString()),
          mobile: buyerPhone,
        },
      ],
      payment_method: "CASH_BY_RECIPIENT",
      remarks: orderNote,
      service_id: ahamoveServices[0],
      items: this.orderItems.map((i) => ({
        _id: i._id,
        name: i.productName,
        num: i.qty,
        price: i.amount,
      })),
    } as CreateOrderProps;
    const key = `ahamoveShipFee:${hashCode(JSON.stringify(orderData.path))}`;
    const result = JSON.parse(await cache.get(key));
    if (_.isEmpty(result) == false) return result;
    const ahamoveOrder = await ahamove.estimatedFee(orderData).catch(async (err) => {
      if (err.message == "Token does not exist in system") {
        return await this.resetAhamoveToken().then(
          async () => await ahamove.estimatedFee(orderData)
        );
      } else {
        throw new Error(err.message);
      }
    });
    await cache.set(key, JSON.stringify(result), 60); // cache trong 1 ph??t
    return ahamoveOrder;
  }
  private async resetAhamoveToken() {
    await shopConfigService.setAhamoveToken(this.seller);
    this.shopConfig = await ShopConfigModel.findById(this.shopConfig._id);
    logger.info(`refresh ahamove token`);
  }
  private async getAhamoveServices() {
    const { latitude, longitude } = this.order;
    const key = `ahamoveServices:${latitude}-${longitude}`;
    const result = JSON.parse(await cache.get(key));
    if (_.isEmpty(result) == false) return result as string[];

    const ahamove = new Ahamove({});
    const ahamoveServices = (await ahamove
      .fetchAllServices(latitude, longitude)
      .then((res) => res.filter((r: any) => /\-(BIKE|EXPRESS)/.test(r._id)))
      .then((res) => res.map((r: any) => r._id))) as string[];

    await cache.set(key, JSON.stringify(ahamoveServices), 60); // cache trong 1 ph??t
    return ahamoveServices;
  }
  private async calculateVNPostShipFee() {
    const [storehouses, addressStorehouse] = await Promise.all([
      AddressStorehouseModel.find({
        _id: { $in: this.seller.addressStorehouseIds },
        activated: true,
      }),
      this.getNearestStore(),
    ]);
    const mainAddressStorehouse = this.seller.mainAddressStorehouseId
      ? storehouses.find((s) => s._id.toString() == this.seller.mainAddressStorehouseId.toString())
      : null;
    const urbanStores = storehouses.filter(
      (store) => store.provinceId === this.order.buyerProvinceId
    );
    this.order.isUrbanDelivery = urbanStores.length > 0;
    const deliveryStorehouse = addressStorehouse || mainAddressStorehouse;

    const vnpostShipFee = await this.getAllVNPostShipFee(deliveryStorehouse);

    this.order.shipfee = vnpostShipFee.TongCuocBaoGomDVCT;
    this.order.addressStorehouseId = deliveryStorehouse._id;
    const codAmountEvaluation =
      this.order.paymentMethod == PaymentMethod.COD ? this.order.subtotal : 0;

    const deliveryInfo: any = {
      serviceName: vnpostShipFee.MaDichVu,
      codAmountEvaluation: codAmountEvaluation,
      deliveryDateEvaluation: vnpostShipFee.ThoiGianPhatDuKien,
      heightEvaluation: this.order.itemHeight,
      isReceiverPayFreight: false,
      lengthEvaluation: this.order.itemLength,
      weightEvaluation: this.order.itemWeight,
      widthEvaluation: this.order.itemWidth,
      packageContent: this.orderItems.map((i) => `[${i.productName} - SL:${i.qty}]`).join(" "),
      isPackageViewable: false,
      pickupType: PickupType.DROP_OFF,
      senderFullname: this.order.sellerName, // t??n ng?????i g???i *
      senderTel: deliveryStorehouse.phone, // S??? ??i???n tho???i ng?????i g???i * (maxlength: 50)
      senderAddress: deliveryStorehouse.address, // ?????a ch??? g???i *
      senderWardId: deliveryStorehouse.wardId, // m?? ph?????ng ng?????i g???i *
      senderProvinceId: deliveryStorehouse.provinceId, // m?? t???nh ng?????i g???i *
      senderDistrictId: deliveryStorehouse.districtId, // m?? qu???n ng?????i g???i *

      receiverFullname: this.order.buyerName, // t??n ng?????i nh???n *
      receiverAddress: this.order.buyerAddress, // ?????a ch??? nh???n *
      receiverTel: this.order.buyerPhone, // phone ng?????i nh???n *
      receiverProvinceId: this.order.buyerProvinceId, // m?? t???nh ng?????i nh???n *
      receiverDistrictId: this.order.buyerDistrictId, // m?? qu???n ng?????i nh???n *
      receiverWardId: this.order.buyerWardId, // m?? ph?????ng ng?????i nh???n *
      partnerFee: this.order.shipfee,
    };
    this.order.deliveryInfo = deliveryInfo;
  }

  private async getAllVNPostShipFee(storehouse: IAddressStorehouse) {
    const defaultServiceCode = await SettingHelper.load(
      SettingKey.VNPOST_DEFAULT_SHIP_SERVICE_METHOD_CODE
    );

    const data: ICalculateAllShipFeeRequest = {
      MaDichVu: defaultServiceCode,
      MaTinhGui: storehouse.provinceId,
      MaQuanGui: storehouse.districtId,
      MaTinhNhan: this.order.buyerProvinceId,
      MaQuanNhan: this.order.buyerDistrictId,
      Dai: this.order.itemLength,
      Rong: this.order.itemWidth,
      Cao: this.order.itemHeight,
      KhoiLuong: this.order.itemWeight,
      ThuCuocNguoiNhan: this.order.paymentMethod == PaymentMethod.COD,
      LstDichVuCongThem:
        this.order.paymentMethod == PaymentMethod.COD
          ? [
              {
                DichVuCongThemId: 3,
                TrongLuongQuyDoi: 0,
                SoTienTinhCuoc: this.order.subtotal.toString(),
              },
            ]
          : [],
    };
    const shopConfig = await ShopConfigModel.findOne({ memberId: this.seller._id });
    return await VietnamPostHelper.calculateAllShipFee(data, get(shopConfig, "vnpostToken"));
  }
  private async getNearestStore() {
    const longitude = this.order.longitude || 0;
    const latitude = this.order.latitude || 0;
    let query: any = {
      allowPickup: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      },
    };
    if (longitude == 0 || latitude == 0) {
      query = {
        allowPickup: true,
        wardId: this.order.buyerWardId,
        districtId: this.order.buyerDistrictId,
        provinceId: this.order.buyerProvinceId,
      };
    }
    return await AddressStorehouseModel.findOne(query).then((res) => {
      if (!res || res.districtId != this.order.buyerDistrictId) {
        return AddressStorehouseModel.findOne({
          _id: { $in: this.seller.addressStorehouseIds },
          allowPickup: true,
          districtId: this.order.buyerDistrictId,
        });
      }
      return res;
    });
  }
  private async getNearestShopBranch() {
    const longitude = this.order.longitude;
    const latitude = this.order.latitude;
    return await ShopBranchModel.aggregate([
      { $match: { memberId: this.seller._id, isOpen: true } },
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          spherical: true,
          distanceField: "distance",
        },
      },
      { $sort: { distance: 1 } },
    ]);
  }
  private async calculateShopBranchDistance(shopBranchId: string, lng: number, lat: number) {
    const [googjsApiKey, shopBranch] = await Promise.all([
      SettingHelper.load(SettingKey.DELIVERY_GOONGJS_API_KEY),
      // SettingHelper.load(SettingKey.DELIVERY_ESTIMATE_DISTANCE_BY_GOONGJS),
      ShopBranchLoader.load(shopBranchId.toString()),
    ]);
    const { estimateDistanceBy } = configs.delivery;
    switch (estimateDistanceBy) {
      case "google": {
        const origins = [{ lat, lng }];
        const destinations = [
          { lat: shopBranch.location.coordinates[1], lng: shopBranch.location.coordinates[0] },
        ];
        const key = `goggle-map:${origins}${destinations}`;
        const result = JSON.parse(await cache.get(key));
        if (_.isEmpty(result) == false) return Number(result);
        const estimateData = await googleMap.getDistance(origins, destinations);
        const distanceValue = _.get(estimateData.data, "rows[0].elements[0].distance.value", 0);
        const distance = parseFloat((distanceValue / 1000).toFixed(1));
        await cache.set(key, JSON.stringify(distance), 60 * 5); // cache trong 5 ph??t
        return distance;
      }
      case "goongjs": {
        const origins = `${lat},${lng}`;
        const destinations = `${shopBranch.location.coordinates[1]},${shopBranch.location.coordinates[0]}`;
        const key = `googjs:${origins}${destinations}`;
        const result = JSON.parse(await cache.get(key));
        if (_.isEmpty(result) == false) return Number(result);
        const vehicle = "bike";
        const estimateData = await LocalBroker.call("goongjs.estimateDistance", {
          origins,
          destinations,
          vehicle,
          apiKey: googjsApiKey,
        });
        const distanceValue = get(estimateData, "rows.0.elements.0.distance.value", 0);
        const distance = parseFloat((distanceValue / 1000).toFixed(1));

        await cache.set(key, JSON.stringify(distance), 60 * 5); // cache trong 5 ph??t
        return distance;
      }
      default:
        return await ShopBranchModel.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [lng, lat] },
              spherical: true,
              distanceField: "distance",
            },
          },
          { $match: { _id: shopBranchId } },
        ]).then((res) => parseFloat(((get(res, "0.distance", 0) as number) / 1000).toFixed(1)));
    }
  }
  private async setBuyerAddress() {
    return await Promise.all([
      addressService.setProvinceName(this.order, "buyerProvinceId", "buyerProvince"),
      addressService.setDistrictName(this.order, "buyerDistrictId", "buyerDistrict"),
      addressService.setWardName(this.order, "buyerWardId", "buyerWard"),
    ]);
  }
  private async setCollaborator() {
    if (this.buyer.collaboratorId) {
      const collaborator = await CollaboratorLoader.load(this.buyer.collaboratorId);
      if (collaborator) this.order.collaboratorId = collaborator._id;
    } else if (this.buyer.presenterId) {
      const collaborator = await CollaboratorModel.findOne({
        customerId: this.buyer.presenterId,
        memberId: this.seller._id,
      });
      if (collaborator) this.order.collaboratorId = collaborator._id;
    }
  }
  private async getUnitPrice() {
    this.unitPrice = this.unitPrice || (await SettingHelper.load(SettingKey.UNIT_PRICE));
    return this.unitPrice;
  }
  private async setOrderItems() {
    this.products = await this.getProductFromOrderInput(this.orderInput);
    this.orderItems = this.orderInput.items.map((i) => this.parseOrderItem(i));
    this.order.subtotal = sumBy(this.orderItems, "amount");
    this.order.itemCount = sumBy(this.orderItems, "qty");
    this.order.itemIds = this.orderItems.map((i) => i._id);
    this.order.commission0 = sumBy(this.orderItems, (i) => i.commission0 * i.qty);
    this.order.commission1 = sumBy(this.orderItems, (i) => i.commission1 * i.qty);
    this.order.commission2 = sumBy(this.orderItems, (i) => i.commission2 * i.qty);
    this.order.commission3 = sumBy(this.orderItems, (i) => i.commission3 * i.qty);
    this.order.sellerBonusPoint = sumBy(this.orderItems, "sellerBonusPoint");
    this.order.buyerBonusPoint = sumBy(this.orderItems, "buyerBonusPoint");
    this.order.itemHeight = get(maxBy(this.orderItems, "productHeight"), "productHeight", 0);
    this.order.itemLength = get(maxBy(this.orderItems, "productLength"), "productLength", 0);
    this.order.itemWidth = get(maxBy(this.orderItems, "productWidth"), "productWidth", 0);
    this.order.itemWeight = sumBy(this.orderItems, (i) => i.productWeight * i.qty);
    this.order.toppingAmount = sumBy(this.orderItems, "toppingAmount");
  }

  private async processItemText() {
    this.order.itemText = this.orderItems
      .map((item) => {
        let line = `${item.productName} `;
        if (item.toppings?.length > 0) {
          line += ": " + item.toppings.map((topping) => topping.optionName).join(" - ");
        }
        line += ` (${item.basePrice + item.toppingAmount / item.qty} ??) x ${item.qty} = ${
          item.amount
        } ??`;
        return line;
      })
      .join("\n");
    const a = 1;
  }
  private async getProductFromOrderInput(orderInput: CreateOrderInput) {
    const productIds = orderInput.items.map((i) => i.productId).map(Types.ObjectId);
    const products = await ProductModel.find({ _id: { $in: productIds }, allowSale: true })
      // .then((res) => res.filter((p) => (orderInput.isPrimary ? p.isPrimary : p.isCrossSale)))
      .then((res) => keyBy(res, "_id"));
    for (const i of orderInput.items) {
      if (!products[i.productId]) throw Error("Kh??ng th??? ?????t h??ng, s???n ph???m kh??ng h???p l???.");
    }
    return products;
  }

  private parseOrderItem(input: OrderItemInput) {
    const product = this.products[input.productId];
    const toppingAmount = sumBy(input.toppings, "price");
    const orderItem = new OrderItemModel({
      orderId: this.order._id,
      sellerId: this.seller._id,
      buyerId: this.buyer._id,
      productId: product.id,
      productName: product.name,
      isPrimary: product.isPrimary,
      isCrossSale: product.isCrossSale,
      basePrice: product.basePrice,
      qty: input.quantity,
      amount: (product.basePrice + toppingAmount) * input.quantity,
      productWeight: product.weight,
      productHeight: product.height,
      productLength: product.length,
      productWidth: product.width,
      commission0: 0,
      commission1: product.commission1,
      commission2: product.commission2,
      commission3: product.commission3,
      orderType: this.order.orderType,
      toppings: input.toppings,
      toppingAmount: toppingAmount * input.quantity,
      note: input.note,
      rewardPoint: product.rewardPoint,
    });
    // ??i???m th?????ng kh??ch h??ng
    if (product.enabledCustomerBonus)
      orderItem.buyerBonusPoint = getPointFromPrice(
        product.basePrice,
        this.unitPrice,
        product.customerBonusFactor
      );
    // ??i???m th?????ng ch??? shop
    if (product.enabledMemberBonus)
      orderItem.sellerBonusPoint = getPointFromPrice(
        product.basePrice,
        this.unitPrice,
        product.memberBonusFactor
      );
    return orderItem;
  }
}

function getPointFromPrice(price: number, unitPrice: number, factor: number) {
  return Math.round((price / unitPrice) * factor);
}
