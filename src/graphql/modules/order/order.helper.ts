import { chain, set } from "lodash";
import { Types } from "mongoose";

import { SettingKey } from "../../../configs/settingData";
import { ErrorHelper, VietnamPostHelper } from "../../../helpers";
import {
  ICalculateAllShipFeeRequest,
  ICalculateAllShipFeeResponse,
  PickupType,
} from "../../../helpers/vietnamPost/resources/type";
import LocalBroker from "../../../services/broker";
import { AddressModel } from "../address/address.model";
import { AddressDeliveryModel } from "../addressDelivery/addressDelivery.model";
import { AddressStorehouseModel } from "../addressStorehouse/addressStorehouse.model";
import { CampaignModel } from "../campaign/campaign.model";
import {
  CampaignSocialResultModel,
  ICampaignSocialResult,
} from "../campaignSocialResult/campaignSocialResult.model";
import { CollaboratorModel } from "../collaborator/collaborator.model";
import { counterService } from "../counter/counter.service";
import { CrossSaleModel } from "../crossSale/crossSale.model";
import { CustomerModel } from "../customer/customer.model";
import { MemberModel } from "../member/member.model";
import { IOrderItem, OrderItemModel } from "../orderItem/orderItem.model";
import { IProduct, ProductModel, ProductType } from "../product/product.model";
import { SettingHelper } from "../setting/setting.helper";
import { IOrder, OrderModel, PaymentMethod, ShipMethod } from "./order.model";

export class OrderHelper {
  constructor(public order: IOrder) {}
  value() {
    return this.order;
  }
  static async generateCode() {
    return counterService.trigger("order", 210000).then((res) => "DH" + res);
  }

  static validatePhone(phone: string) {
    if (!/^\d{9,10}$/g.test(phone)) {
      throw ErrorHelper.requestDataInvalid("Sai định dạng số điện thoại");
    }
    return this;
  }

  async setProvinceName() {
    if (!this.order.buyerProvinceId) return this;
    const address = await AddressModel.findOne({
      provinceId: this.order.buyerProvinceId,
    });
    if (!address) throw ErrorHelper.mgRecoredNotFound("Tỉnh / thành");
    this.order.buyerProvince = address.province;
    return this;
  }
  async setDistrictName() {
    if (!this.order.buyerDistrictId) return this;
    const address = await AddressModel.findOne({
      districtId: this.order.buyerDistrictId,
    });
    if (!address) throw ErrorHelper.mgRecoredNotFound("Quận / Huyện");
    this.order.buyerDistrict = address.district;
    return this;
  }
  async setWardName() {
    if (!this.order.buyerWardId) return this;
    const address = await AddressModel.findOne({
      wardId: this.order.buyerWardId,
    });
    if (!address) throw ErrorHelper.mgRecoredNotFound("Phường / Xã");
    this.order.buyerWard = address.ward;
    return this;
  }

  calculateAmount() {
    this.order.amount = this.order.subtotal + this.order.shipfee;
    // return this;
  }

  static modifyOrders = async (data: any) => {
    const { items, sellerId } = data;

    // kiểm tra danh sách
    const itemsLength = Object.keys(items).length;
    if (itemsLength === 0)
      throw ErrorHelper.requestDataInvalid(". Không có sản phẩm trong đơn hàng");

    const productIds = items.map((i: any) => i.productId).map(Types.ObjectId);

    const orders: any = [];

    const addQuantitytoProduct = (product: IProduct, items: any) => {
      product.qty = items.find((item: any) => item.productId === product._id.toString()).quantity;
      return product;
    };

    const getPostProducts = (products: IProduct[]) => {
      orders.push({
        ...data,
        isPrimary: true,
        products: products.filter((p) => p.isPrimary),
        fromMemberId: sellerId,
      });
    };

    const getShopProducts = (products: IProduct[]) => {
      orders.push({
        ...data,
        isPrimary: false,
        products: products.filter((p) => p.isPrimary === false && p.isCrossSale === false),
        fromMemberId: sellerId,
      });
    };

    const getCrossSaleProducts = (products: IProduct[]) => {
      products = products.filter((p) => p.isPrimary === false && p.isCrossSale === true);
      chain(products)
        .groupBy("memberId")
        .map((products, i) => {
          orders.push({
            ...data,
            products,
            sellerId: i,
            fromMemberId: sellerId,
          });
        });
    };

    const products = await ProductModel.find({
      _id: { $in: productIds },
      allowSale: true,
    }).then((products) => products.map((product) => addQuantitytoProduct(product, items)));
    // console.log("products",products.map(p=>p.qty));

    const productsLength = Object.keys(products).length;
    if (itemsLength !== productsLength)
      throw ErrorHelper.requestDataInvalid(". Sản phẩm trong đơn hàng không tồn tại");

    // console.log("products", products);
    getPostProducts(products);
    getShopProducts(products);
    getCrossSaleProducts(products);

    // console.log("orders", orders);
    return orders;
  };

  // modify Products
  static orderProducts = async (data: any) => {
    const { items, sellerId } = data;

    // console.log('data',data);
    // kiểm tra danh sách
    const itemsLength = Object.keys(items).length;
    if (itemsLength === 0)
      throw ErrorHelper.requestDataInvalid("Danh sách sản phẩm trong đơn hàng");

    const itemIDs = items.map((i: any) => i.productId);

    const allProducts = await ProductModel.find({
      _id: { $in: itemIDs },
      type: ProductType.RETAIL,
      allowSale: true,
    });

    const productsLength = Object.keys(allProducts).length;
    if (productsLength !== itemsLength) throw ErrorHelper.mgQueryFailed("Danh sách sản phẩm");

    const addQuantitytoProduct = (product: any) => {
      product.qty = items.find((p: any) => p.productId === product.id).quantity;
      return product;
    };

    // console.log("allProducts", allProducts);
    // console.log('sellerId',sellerId);

    const validDirectShop = (p: IProduct) => {
      // console.log('p.memberId',p.memberId);
      // console.log('sellerId',sellerId);
      const shopConditions = p.memberId == sellerId && p.isCrossSale === false;
      return shopConditions || p.isPrimary;
    };
    // lấy ra danh sách sản phẩm của shop đó bán + sản phẩm chính (hảng bưu điện chuyển về cho cửa hàng quản trị)
    const directShoppingProducts: any = allProducts
      .filter((p) => validDirectShop(p))
      .map(addQuantitytoProduct);

    // console.log('directShoppingProducts',directShoppingProducts);

    // lấy ra danh sách sản phẩm của shop bán chéo
    const crossSaleProducts = allProducts
      .filter((p) => p.isCrossSale === true)
      .map(addQuantitytoProduct);

    // shop bán chéo thì phải check số lượng hàng tồn
    const outOfStockProducts: string[] = [];

    const isOutOfStock = ({
      id,
      name,
      crossSaleInventory: dbInventory,
      crossSaleOrdered: dbOrdered,
    }: any) => {
      const orderItem = items.find((i: any) => i.productId === id);
      const condition = dbInventory < dbOrdered + orderItem.quantity;
      condition && outOfStockProducts.push(name);
      return condition;
    };

    // console.log('crossSaleProducts.some(isOutOfStock)', crossSaleProducts.some(isOutOfStock));
    if (crossSaleProducts.some(isOutOfStock)) {
      throw ErrorHelper.requestDataInvalid(
        `. Sản phẩm [${outOfStockProducts.join(",")}] hết hàng.`
      );
    }

    const orders = [];

    if (directShoppingProducts.length > 0) {
      orders.push({
        ...data,
        // isPrimary:true, // tat ca don hang deu thuoc buu cuc
        products: directShoppingProducts,
        fromMemberId: sellerId,
      });
    }

    if (crossSaleProducts.length > 0) {
      const ids = crossSaleProducts.map((p: any) => p._id);
      // console.log("ids", ids);

      // // lay cac mat hang crossale ra
      const crossSales = await CrossSaleModel.find({
        productId: { $in: ids },
        sellerId,
      });

      // console.log("crossSales", crossSales);
      // kiem tra mat hang nay co trong dang ky crossale ko ?
      if (crossSales.length !== crossSaleProducts.length)
        throw ErrorHelper.mgQueryFailed("Danh sách sản phẩm bán chéo");

      // tach cac san pham nay ra theo tung chu shop
      chain(crossSaleProducts)
        .groupBy("memberId")
        .map((products, i) => {
          orders.push({
            ...data,
            products,
            sellerId: i,
            fromMemberId: sellerId,
          });
        });

      // them danh sach order - cong tac vien mua don hang ban cheo
    }

    return orders;
  };

  static async fromRaw(data: any) {
    const order = new OrderModel(data);
    const customer = await CustomerModel.findById(order.buyerId);
    const member = await MemberModel.findById(data.sellerId);

    let { collaboratorId } = data;
    let collaborator = null;
    if (collaboratorId) {
      collaborator = await CollaboratorModel.findById(collaboratorId);
    } else {
      collaborator = await CollaboratorModel.findOne({
        phone: customer.phone,
        memberId: data.sellerId,
      });
    }

    order.collaboratorId = collaborator ? collaborator.id : null;
    order.sellerCode = member.code;
    order.sellerName = member.shopName ? member.shopName : member.name;

    const helper = new OrderHelper(order);
    switch (order.shipMethod) {
      case ShipMethod.NONE:
        await Promise.all([
          helper.setProvinceName(),
          helper.setDistrictName(),
          helper.setWardName(),
        ]);
        break;

      case ShipMethod.POST:
        break;

      case ShipMethod.VNPOST:
        await Promise.all([
          helper.setProvinceName(),
          helper.setDistrictName(),
          helper.setWardName(),
        ]);
        break;
    }
    return helper;
  }

  async generateItemsFromRaw(products: any) {
    const UNIT_PRICE = await SettingHelper.load(SettingKey.UNIT_PRICE);
    const member = await MemberModel.findById(this.order.sellerId);

    this.order.subtotal = 0;
    this.order.itemCount = 0;
    this.order.itemIds = [];
    this.order.items = [];
    this.order.itemWeight = 0;

    for (let i of products) {
      const {
        _id,
        qty,
        name,
        basePrice,
        weight,
        length,
        width,
        height,
        isPrimary,
        isCrossSale,
        commission0,
        commission1,
        commission2,
        commission3,
        enabledMemberBonus,
        enabledCustomerBonus,
        memberBonusFactor,
        customerBonusFactor,
      }: IProduct = i;

      const orderItem: any = {
        orderId: this.order._id,
        productId: _id,
        productName: name,
        isPrimary,
        isCrossSale,
        basePrice: basePrice,
        qty: qty,
        amount: basePrice * qty,
        productWeight: weight,
        productHeight: height,
        productLength: length,
        productWidth: width,
        commission0: 0,
        commission1: 0,
        commission2: 0,
        commission3: 0,
      };

      // kiem tra san pham - hoa hong vnpost > 0
      // kiem tra don hang - primary ko
      if (commission0 > 0) {
        if (this.order.isPrimary) {
          orderItem.commission0 = commission0;
        }
      }

      // kiem tra san pham - hoa hong chu shop > 0
      // kiem tra don hang - co chu shop ko ?
      if (commission1 > 0) {
        if (this.order.fromMemberId) {
          orderItem.commission1 = commission1;
        }
      }

      // kiem tra san pham - hoa hong nguoi gioi thieu > 0
      // kiem tra don hang - kiem tra cong tac vien
      if (commission2 > 0) {
        if (this.order.collaboratorId) {
          orderItem.commission2 = commission2;
        } else {
          // hoa hong chu shop gioi thieu chu shop
          if (member) {
            orderItem.commission2 = commission2;
          }
        }
      }

      // kiem tra san pham - hh kho > 0
      // kiem tra don hang - co kho chuyen ko ?

      if (commission3 > 0) {
        orderItem.commission3 = commission3;
      }

      const getPointFromPrice = (factor: any, price: any) =>
        Math.round(((price / UNIT_PRICE) * 100) / 100) * factor;
      // Điểm thưởng khách hàng
      if (enabledCustomerBonus)
        orderItem.buyerBonusPoint = getPointFromPrice(customerBonusFactor, basePrice);
      // Điểm thưởng chủ shop
      if (enabledMemberBonus)
        orderItem.sellerBonusPoint = getPointFromPrice(memberBonusFactor, basePrice);

      const item = new OrderItemModel(orderItem);
      this.order.items.push(item);

      this.order.subtotal += item.amount;
      this.order.itemCount += item.qty;
      this.order.itemWeight += item.productWeight * item.qty;
      this.order.commission0 += item.commission0 * item.qty;
      this.order.commission1 += item.commission1 * item.qty;
      this.order.commission2 += item.commission2 * item.qty;
      this.order.commission3 += item.commission3 * item.qty;

      this.order.sellerBonusPoint += item.sellerBonusPoint;
      this.order.buyerBonusPoint += item.buyerBonusPoint;

      this.order.itemIds.push(item._id);
    }

    // lay kich thuoc lon nhat

    this.order.itemHeight = Math.max.apply(
      null,
      products.map(({ height }: any) => height)
    );
    this.order.itemLength = Math.max.apply(
      null,
      products.map(({ length }: any) => length)
    );
    this.order.itemWidth = Math.max.apply(
      null,
      products.map(({ width }: any) => width)
    );

    return this.order.items;
  }

  async calculateShipfee() {
    // console.log('calculateShipfee----calculateShipfee')
    this.order.shipfee = 0;

    const member = await MemberModel.findById(this.order.sellerId);
    const { addressStorehouseIds, mainAddressStorehouseId } = member;
    const storehouses = await AddressStorehouseModel.find({
      _id: { $in: addressStorehouseIds },
      activated: true,
    });

    switch (this.order.shipMethod) {
      case ShipMethod.NONE:
        this.order.shipfee = await SettingHelper.load(SettingKey.DELIVERY_ORDER_SHIP_FEE);
        break;

      case ShipMethod.POST:
        if (storehouses.length === 0)
          throw ErrorHelper.somethingWentWrong("Chưa cấu hình chi nhánh kho");

        if (
          member.addressDeliveryIds.findIndex(
            (id) => id.toString() == this.order.addressDeliveryId.toString()
          ) === -1
        ) {
          throw ErrorHelper.somethingWentWrong("Mã địa điểm nhận không đúng");
        }

        const addressDelivery = await AddressDeliveryModel.findOne({
          _id: this.order.addressDeliveryId,
          activated: true,
        });

        if (!addressDelivery) {
          throw ErrorHelper.mgRecoredNotFound("Địa điểm nhận hàng");
        }
        // console.log("-------------------------->storehouses", storehouses);

        this.order.shipfee = await SettingHelper.load(SettingKey.DELIVERY_POST_FEE);

        break;

      case ShipMethod.VNPOST:
        const defaultServiceCode = await SettingHelper.load(
          SettingKey.VNPOST_DEFAULT_SHIP_SERVICE_METHOD_CODE
        );

        const urbanStores = storehouses.filter(
          (store) => store.provinceId === this.order.buyerProvinceId
        );

        this.order.isUrbanDelivery = urbanStores.length > 0;

        const longitude = this.order.longitude ? this.order.longitude : 0;
        const latitude = this.order.latitude ? this.order.latitude : 0;

        const addressStorehouse = await AddressStorehouseModel.findOne({
          allowPickup: true,
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            },
          },
        });

        const addressStorehouseId = addressStorehouse
          ? addressStorehouse.id
          : member.mainAddressStorehouseId;

        const cheapestService = await calculateServiceByMainStorehouse(addressStorehouseId, this);

        const cheapestShipFee = cheapestService.TongCuocBaoGomDVCT;

        this.order.shipfee = cheapestShipFee;

        this.order.addressStorehouseId = cheapestService.storehouse._id;

        const deliveryInfo: any = {
          serviceName: defaultServiceCode,
          codAmountEvaluation: cheapestService.codAmountEvaluation,
          deliveryDateEvaluation: cheapestService.ThoiGianPhatDuKien,
          heightEvaluation: cheapestService.productHeight,
          isReceiverPayFreight: false,
          lengthEvaluation: cheapestService.productLength,
          weightEvaluation: cheapestService.productWeight,
          widthEvaluation: cheapestService.productWidth,
          packageContent: this.order.items.map((i) => `[${i.productName} - SL:${i.qty}]`).join(" "),
          isPackageViewable: false,
          pickupType: PickupType.DROP_OFF,

          senderFullname: member.shopName ? member.shopName : member.name, // tên người gửi *
          senderTel: cheapestService.storehouse.phone, // Số điện thoại người gửi * (maxlength: 50)
          senderAddress: cheapestService.storehouse.address, // địa chỉ gửi *
          senderWardId: cheapestService.storehouse.wardId, // mã phường người gửi *
          senderProvinceId: cheapestService.storehouse.provinceId, // mã tỉnh người gửi *
          senderDistrictId: cheapestService.storehouse.districtId, // mã quận người gửi *

          receiverFullname: this.order.buyerName, // tên người nhận *
          receiverAddress: this.order.buyerAddress, // địa chỉ nhận *
          receiverTel: this.order.buyerPhone, // phone người nhận *
          receiverProvinceId: this.order.buyerProvinceId, // mã tỉnh người nhận *
          receiverDistrictId: this.order.buyerDistrictId, // mã quận người nhận *
          receiverWardId: this.order.buyerWardId, // mã phường người nhận *
          partnerFee: cheapestShipFee,
        };

        this.order.deliveryInfo = deliveryInfo;
        break;

      default:
        throw ErrorHelper.requestDataInvalid("Phương thức vận chuyển chưa được hỗ trợ.");
    }
    return this;
  }

  async addCampaign(campaignCode: string) {
    const campaign = await CampaignModel.findOne({
      code: campaignCode,
    });

    // console.log("campaign", campaign);
    if (campaign) {
      const campaignSocialResults = await CampaignSocialResultModel.find({
        memberId: this.order.sellerId,
        campaignId: campaign.id,
      });
      // console.log("campaignSocialResults", campaignSocialResults);

      const items = this.order.items.map((item: IOrderItem) => {
        const campaignResultByProductId = campaignSocialResults.find(
          (c: ICampaignSocialResult) => c.productId.toString() == item.productId.toString()
        );
        // console.log('campaignResultByProductId', campaignResultByProductId);
        if (campaignResultByProductId) {
          item.campaignId = campaign._id;
          item.campaignSocialResultId = campaignResultByProductId._id;
        }
        return item;
      });

      // console.log("items", items);

      set(this.order, "items", items);
      // console.log("items", this.order.items);
    }
  }

  async updateOrderedQtyBulk() {
    // console.log("updateOrderedQtyBulk");
    const productBulk = ProductModel.collection.initializeUnorderedBulkOp();
    this.order.items.map((item: IOrderItem) => {
      const { productId } = item;
      productBulk.find({ productId }).updateOne({
        $inc: { crossSaleOrdered: item.qty },
      });
      if (item.isCrossSale) {
      }
    });
    return productBulk;
  }
}

const calculateServiceByMainStorehouse = async (
  mainStorehouseId: string,
  orderHelper: OrderHelper
) => {
  const defaultServiceCode = await SettingHelper.load(
    SettingKey.VNPOST_DEFAULT_SHIP_SERVICE_METHOD_CODE
  );

  const storehouse = await AddressStorehouseModel.findById(mainStorehouseId);

  // console.log("-------------> ", orderHelper.order);

  let MaTinhGui = storehouse.provinceId,
    MaQuanGui = storehouse.districtId,
    MaTinhNhan = orderHelper.order.buyerProvinceId,
    MaQuanNhan = orderHelper.order.buyerDistrictId;

  const codAmountEvaluation =
    orderHelper.order.paymentMethod == PaymentMethod.COD ? orderHelper.order.subtotal : 0;

  const productWeight = orderHelper.order.itemWeight;
  const productLength = orderHelper.order.itemLength;
  const productWidth = orderHelper.order.itemWidth;
  const productHeight = orderHelper.order.itemHeight;

  const LstDichVuCongThem = [];

  orderHelper.order.paymentMethod == PaymentMethod.COD &&
    LstDichVuCongThem.push({
      DichVuCongThemId: 3,
      TrongLuongQuyDoi: 0,
      SoTienTinhCuoc: orderHelper.order.subtotal.toString(),
    });
  const data: ICalculateAllShipFeeRequest = {
    MaDichVu: defaultServiceCode,
    MaTinhGui,
    MaQuanGui,
    MaTinhNhan,
    MaQuanNhan,
    Dai: productLength,
    Rong: productWidth,
    Cao: productHeight,
    KhoiLuong: productWeight,
    ThuCuocNguoiNhan: orderHelper.order.paymentMethod == PaymentMethod.COD,
    LstDichVuCongThem,
  };

  // console.log("data", data);
  // noi thanh

  const service: ICalculateAllShipFeeResponse = await VietnamPostHelper.calculateAllShipFee(data);

  return {
    ...service,
    storehouse,
    codAmountEvaluation,
    productWeight,
    productLength,
    productWidth,
    productHeight,
  };
};
