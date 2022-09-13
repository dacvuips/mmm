import { ShopBranch } from "./shop-branch.repo";
import { PaymentMethod } from "./../../../src/graphql/modules/order/order.model";
import { String } from "lodash";
import { BaseModel, CrudRepository } from "./crud.repo";
import { Customer } from "./customer.repo";
import { Member } from "./member.repo";
import { Product } from "./product.repo";
import { User } from "./user.repo";
import axios from "axios";
import { GetUserToken, GetMemberToken } from "../graphql/auth.link";
import { useLayoutEffect, useRef, useState } from "react";

export interface OrderInput {
  customerVoucherId?: string;
  promotionCode?: string;
  buyerName?: string;
  buyerPhone?: string;
  pickupMethod?: "DELIVERY" | "STORE";
  shopBranchId?: string;
  pickupTime?: string;
  buyerAddress?: string;
  buyerProvinceId?: string;
  buyerDistrictId?: string;
  buyerWardId?: string;
  buyerFullAddress?: string;
  buyerAddressNote?: string;
  latitude?: number;
  useRewardPoint?: boolean;
  longitude?: number;
  paymentMethod?: string;
  note?: string;
  offerGroupIndex?: number;
  items?: OrderItemInput[];
  offerItemIds?: string[];
  tableCode?: string;
}

export interface CreateOrderInput {
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerProvinceId: string;
  buyerDistrictId: string;
  buyerWardId: string;
  shipMethod: string;
  latitude: number;
  longitude: number;
  paymentMethod: string;
  useRewardPoint: boolean;
  offerGroupIndex?: number;
  note: string;
  items: OrderItemInput[];
  tableCode: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  note?: string;
  toppings: OrderItemToppingInput[];
}
export interface OrderItemToppingInput {
  toppingId: string;
  toppingName: string;
  optionName: string;
  price: number;
}

export interface Order extends BaseModel {
  code: string;
  cancelReason: string;
  isPrimary: boolean;
  itemIds: string[];
  amount: number;
  subtotal: number;
  toppingAmount: number;
  shipMethod: string;
  shipfee: number;
  shipDistance: number;
  paymentMethod: string;
  note: string;
  itemCount: number;
  sellerId: string;
  sellerCode: string;
  sellerName: string;
  fromMemberId: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "DELIVERING"
    | "COMPLETED"
    | "FAILURE"
    | "CANCELED"
    | "RETURNED"
    | "UNCOMPLETED";
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerProvince: string;
  buyerDistrict: string;
  buyerWard: string;
  buyerProvinceId: string;
  buyerDistrictId: string;
  buyerWardId: string;
  sellerBonusPoint: number;
  buyerBonusPoint: number;
  addressStorehouseId: string;
  addressDeliveryId: string;
  paymentMethodText: string;
  shipMethodText: string;
  paymentStatus: string;
  statusText: string;
  commented: boolean;
  collaboratorId: string;
  isUrbanDelivery: boolean;
  toMemberId: string;
  toMemberNote: string;
  mustTransfer: boolean;
  latitude: number;
  longitude: number;
  items: OrderItem[];
  seller: Member;
  fromMember: Member;
  updatedByUser: User;
  buyer: Customer;
  deliveringMember: Member;
  toMember: Member;
  updatedByUserId: string;
  orderType: string;
  orderTypeText: string;
  pickupMethod: "DELIVERY" | "STORE";
  pickupTime: string;
  shopBranchId: string;
  deliveryInfo: DeliveryInfo;
  logs: OrderLog[];
  customerReceiveConfirm: boolean;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  shopBranch: ShopBranch;
  buyerFullAddress: string;
  discount: number;
  discountDetail: string;
  ahamoveTrackingLink: string;
  paymentLogs: PaymentLogs[];
  paymentFilledAmount: number;
  discountLogs: DiscountLog[];
  rewardPoint: number;
  discountPoint: number;
  useRewardPoint: boolean;
  paymentMeta: any;
  tableCode: string;
}
// discount: 30000
// itemIds: Array(2)
// 0: "615d462f76693801dc25da7a"
// 1: "615d462f76693801dc25da7c"
// length: 2
// [[Prototype]]: Array(0)
// offerQty: 1
// productId: "60d1d2b93b9b475cceaa5119"
// type: "OFFER_ITEM"
export interface DiscountLog {
  discount: number;
  itemIds: string[];
  offerQty: number;
  productId: string;
  type: string;
}
export interface PaymentLogs {
  createdAt: Date;
  message: string;
  meta: {
    amount: string;
    cusum_balance: string;
    description: string;
    guid: string;
    id: number;
    tid: string;
    when: string;
  };
}
export interface OrderItem extends BaseModel {
  orderId: string;
  sellerId: string;
  buyerId: string;
  productId: string;
  productName: string;
  basePrice: number;
  qty: number;
  amount: number;
  product: Product;
  note: string;
  toppings: OrderItemTopping[];
}
export interface OrderItemTopping extends BaseModel {
  toppingId: string;
  toppingName: string;
  optionName: string;
  price: number;
}
export interface OrderLog {
  id: string;
  createdAt: string;
  statusText: string;
  updatedAt: string;
}
interface DeliveryInfo {
  senderFullname: string;
  senderTel: string;
  senderAddress: string;
  senderWardId: string;
  senderProvinceId: string;
  senderDistrictId: string;
  receiverFullname: string;
  receiverAddress: string;
  receiverTel: string;
  receiverProvinceId: string;
  receiverDistrictId: string;
  receiverWardId: string;
  receiverAddressType: number;
  serviceName: string;
  serviceIcon: string;
  orderCode: string;
  packageContent: string;
  weightEvaluation: number;
  widthEvaluation: number;
  lengthEvaluation: number;
  heightEvaluation: number;
  codAmountEvaluation: number;
  isPackageViewable: boolean;
  pickupType: number;
  orderAmountEvaluation: number;
  isReceiverPayFreight: boolean;
  customerNote: string;
  useBaoPhat: boolean;
  useHoaDon: boolean;
  customerCode: string;
  vendorId: string;
  itemCode: string;
  orderId: string;
  createTime: string;
  lastUpdateTime: string;
  deliveryDateEvaluation: string;
  cancelTime: string;
  deliveryTime: string;
  deliveryTimes: number;
  status: string;
  statusText: string;
  partnerFee: number;
  promotionCode: string;
  partnerDiscount: number;
}
export class OrderRepository extends CrudRepository<Order> {
  apiName: string = "Order";
  displayName: string = "đơn hàng";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    itemIds: [ID]
    amount: Float
    subtotal: Float
    toppingAmount: Float
    shipMethod: String
    shipfee: Float
    shipDistance: Float
    paymentMethod: String
    note: String
    itemCount: Int
    status: String
    buyerId: ID
    buyerName: String
    buyerPhone: String
    buyerAddress: String
    buyerProvince: String
    buyerDistrict: String
    buyerWard: String
    buyerProvinceId: String
    buyerDistrictId: String
    buyerWardId: String
    paymentMethodText: String
    paymentStatus: String
    shipMethodText: String
    statusText: String
    rewardPoint: Int
    discountPoint: Int
    useRewardPoint:boolean;
    buyerFullAddress: String
    discount: Float
    discountDetail: String
    ahamoveTrackingLink: String
    commented:Boolean
    deliveryInfo {
      orderId: String
      statusText:string
      status:string
    }: DeliveryInfo
    logs {
      id:String 
      statusText: String
      createdAt: DateTime
      updatedAt:DateTime
    }
    fromMember {
      id: String
      name: String
      phone: String
      address: String
    }: Member
    updatedByUser {
      id: String
      name: String
    }: User
    buyer {
      id: String
      name: String
    }: Customer
    deliveringMember{
      id: String
      name: String
    }: Member
    shopBranchId: String
    shopBranch{
        id:String
        name:String
        code:String
        address:String
      }:ShopBranch
    seller{
      id: String
      name: String
      code: string
      address: String
      shopLogo: string
      shopName: String
    }:Member
    orderType: String
    orderTypeText: String
    pickupMethod: String
    pickupTime: DateTime
    paymentStatus
    paymentFilledAmount
    paymentMeta
    paymentLogs: [Mixed]
    tableCode: String
    customerReceiveConfirm: Boolean
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    itemIds: [ID]
    amount: Float
    subtotal: Float
    toppingAmount: Float
    shipMethod: String
    shipfee: Float
    shipDistance: Float
    paymentMethod: String
    note: String
    cancelReason: String
    itemCount: Int
    commented:Boolean
    sellerId: ID
    sellerCode: String
    sellerName: String
    status: String
    buyerId: ID
    buyerName: String
    buyerFullAddress: String
    buyerPhone: String
    buyerAddress: String
    buyerProvince: String
    buyerDistrict: String
    buyerWard: String
    buyerProvinceId: String
    buyerDistrictId: String
    buyerWardId: String
    paymentMethodText: String
    paymentStatus: String
    shipMethodText: String
    statusText: String
    isUrbanDelivery: Boolean
    latitude: Float
    longitude: Float
    discount: Float
    discountDetail: String
    rewardPoint: Int
    discountPoint: Int
    useRewardPoint:boolean;
    ahamoveTrackingLink: String
    discountLogs: [Mixed]
    logs {
      id:String 
      statusText: String
      createdAt: DateTime
      updatedAt:DateTime
    }
    items {
      id: String
      createdAt: DateTime
      updatedAt: DateTime
      orderId: ID
      sellerId: ID
      buyerId: ID
      note:String
      isPrimary: Boolean
      productId: ID
      productName: String
      basePrice: Float
      qty: Int
      amount: Float
      product {
        id: String
        image: String
      }: Product
      toppings {
        toppingId: ID
        toppingName: String
        optionName: String
        price: Float
      }: [OrderItemTopping]
    }: [OrderItem]
    seller {
      id: String
      name: String
      code: string
      address: String
      shopLogo: string
      shopName: String
    }: Member
    fromMember {
      id: String
      name: String
      phone: String
    }: Member
    updatedByUser {
      id: String
      name: String
    }: User
    buyer {
      id: String
      name: String
    }: Customer
    deliveringMember{
      id: String
      name: String
    }: Member
    toMember {
      id: String
      name: String
    }: Member
    deliveryInfo {
      senderFullname: String
      senderTel: String
      senderAddress: String
      senderWardId: String
      senderProvinceId: String
      senderDistrictId: String
      receiverFullname: String
      receiverAddress: String
      receiverTel: String
      receiverProvinceId: String
      receiverDistrictId: String
      receiverWardId: String
      receiverAddressType: Int
      serviceName: String
      serviceIcon: String
      orderCode: String
      packageContent: String
      weightEvaluation: Int
      widthEvaluation: Int
      lengthEvaluation: Int
      heightEvaluation: Int
      codAmountEvaluation: Float
      isPackageViewable: Boolean
      pickupType: Int
      orderAmountEvaluation: Float
      isReceiverPayFreight: Boolean
      customerNote: String
      useBaoPhat: Boolean
      useHoaDon: Boolean
      customerCode: String
      vendorId: String
      itemCode: String
      orderId: String
      createTime: String
      lastUpdateTime: String
      deliveryDateEvaluation: String
      cancelTime: String
      deliveryTime: String
      deliveryTimes: Int
      status: String
      statusText: String
      partnerFee: Float
      promotionCode: String
      partnerDiscount: Float
    }: DeliveryInfo
    updatedByUserId: ID
    orderType: String
    orderTypeText: String
    pickupMethod: String
    pickupTime: DateTime
    shopBranchId: String
    driverId: ID
    driverName: String
    driverPhone: String
    driverLicense: String
    shopBranchId: String
    shopBranch{
      id:String
      name:String
      code:String
      address:String
      phone:String
      province: String
      district: String
      ward: String
    }:ShopBranch
    paymentStatus
    paymentMeta
    paymentFilledAmount
    paymentLogs: [Mixed]
    tableCode: String
    customerReceiveConfirm: Boolean
  `);
  async getAllPaymentMethod(): Promise<any> {
    return await this.query({
      query: `getAllPaymentMethod`,
    }).then((res) => {
      return res.data["g0"];
    });
  }
  async generateDraftOrder(
    data: OrderInput
  ): Promise<{ order: Order; invalid: boolean; invalidReason: string }> {
    return await this.mutate({
      mutation: `generateDraftOrder(data: $data) {
          order{
            ${this.shortFragment}
          }
          invalid
          invalidReason
        }`,
      variablesParams: `($data:CreateDraftOrderInput!)`,
      options: { variables: { data } },
    }).then((res) => {
      return res.data["g0"];
    });
  }
  async generateOrder(data: OrderInput): Promise<Order> {
    return await this.mutate({
      mutation: `generateOrder(data: $data) {
        id
        code
        seller { id shopName }
        buyerName buyerPhone
        buyerAddress buyerProvince buyerDistrict buyerWard
        pickupMethod
        subtotal
        toppingAmount
        shipfee
        amount
        status
        paymentStatus
        paymentMeta
        paymentFilledAmount
        paymentLogs
      }`,
      variablesParams: `($data:CreateDraftOrderInput!)`,
      options: { variables: { data } },
    }).then((res) => {
      return res.data["g0"];
    });
  }

  async approveOrder(orderId: string, status: string, note?: string): Promise<Order> {
    return await this.mutate({
      mutation: `approveOrder(orderId: "${orderId}",status: "${status}", note: "${note}") {
        id 
      }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }
  async confirmOrder(orderId: string, note?: string): Promise<Order> {
    return await this.mutate({
      mutation: `confirmOrder(orderId: "${orderId}", note: "${note}") {
        id 
      }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }
  async deliveryOrder(orderId: string, deliveryInfo: DeliveryInfo): Promise<Order> {
    return await this.mutate({
      mutation: `deliveryOrder(orderId: "${orderId}",deliveryInfo: $deliveryInfo) {
        id 
      }`,
      variablesParams: `($deliveryInfo: DeliveryInfoInput!)`,
      options: { variables: { deliveryInfo } },
    }).then((res) => {
      return res.data["g0"];
    });
  }
  async deliveryMemberOrder(orderId: string): Promise<Order> {
    return await this.mutate({
      mutation: `deliveryMemberOrder(orderId: "${orderId}") {
        id 
      }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }
  async transferOrderToDriver(orderId: string, driverId: string, note?: string): Promise<Order> {
    return await this.mutate({
      mutation: `transferOrderToDriver(orderId: "${orderId}",driverId:"${driverId}",note:"${note}") {
        id 
      }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }
  async transferOrderToAhamove(
    orderId: string,
    serviceId: string,
    promotionCode?: string
  ): Promise<Order> {
    return await this.mutate({
      mutation: `transferOrderToAhamove(orderId: "${orderId}", serviceId:"${serviceId}"${
        promotionCode ? `, promotionCode:"${promotionCode}"` : ""
      }) {
        id 
      }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }

  async cancelOrder(id: string, note?: string): Promise<Order> {
    return await this.mutate({
      mutation: `cancelOrder(id: "${id}", note: "${note}") {
        ${this.fullFragment}
      }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }

  async customerConfirmOrder(id: string): Promise<Order> {
    return await this.mutate({
      mutation: `customerConfirmOrder(id: "${id}") {
        ${this.fullFragment}
      }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }

  async markTransferComplete(): Promise<any> {
    return await this.mutate({
      mutation: `markTransferComplete`,
    }).then((res) => {});
  }
  async exportExcel(fromDate: string, toDate: string, filter: any) {
    console.log(fromDate, toDate, filter);
    return axios
      .get("/api/report/exportOrder", {
        params: {
          fromDate,
          toDate,
          filter: Buffer.from(JSON.stringify(filter)).toString("base64"),
        },
        headers: {
          "x-token": GetMemberToken(),
        },
        responseType: "blob",
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  }

  async exportExcelAdmin(fromDate: string, toDate: string, memberId: any) {
    return axios
      .get("/api/reportAdmin/exportOrder", {
        params: {
          fromDate,
          toDate,
          memberId,
        },
        headers: {
          "x-token": GetUserToken(),
        },
        responseType: "blob",
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  }

  subscribeOrder() {
    const [value, setValue] = useState<Order>();
    const subscription = useRef(null);
    useLayoutEffect(() => {
      subscription.current = this.subscribe({
        query: `orderStream { ${this.fullFragment} }`,
      }).subscribe((res) => {
        const data = res.data.g0;
        setValue(data);
      });
      return () => {
        subscription.current.unsubscribe();
      };
    }, []);

    return value;
  }
}
export const OrderService = new OrderRepository();

export const ORDER_STATUS: Option[] = [
  { value: "PENDING", label: "Chờ duyệt", color: "warning" },
  { value: "CONFIRMED", label: "Làm món", color: "info" },
  { value: "DELIVERING", label: "Đang giao", color: "purple" },
  { value: "COMPLETED", label: "Hoàn thành", color: "success" },
  { value: "FAILURE", label: "Thất bại", color: "danger" },
  { value: "CANCELED", label: "Đã huỷ", color: "slate" },
  { value: "RETURNED", label: "Đã hoàn hàng", color: "orange" },
  { value: "UNCOMPLETED", label: "Chưa hoàn thành", color: "teal" },
];

export const FORM_RECEIPT: Option[] = [
  { value: "DELIVERY", label: "Giao hàng" },
  { value: "STORE", label: "Lấy hàng tại cửa hàng" },
];
export const PICKUP_METHODS: Option[] = [
  { value: "DELIVERY", label: "Giao hàng tận nơi thu tiền mặt" },
  { value: "STORE", label: "Lấy hàng tại cửa hàng" },
];
export const PICKUP_METHODS_SHOP_ORDER: Option[] = [
  { value: "STORE", label: "Bán hàng nhanh" },
  { value: "DELIVERY", label: "Giao hàng" },
];
export const TABLE_PICKUP_METHODS: Option[] = [
  { value: "SALE", label: "Bán hàng nhanh" },
  { value: "STORE", label: "Lấy tại cửa hàng" },
  { value: "DELIVERY", label: "Giao hàng" },
];

export const PAYMENT_METHODS: Option[] = [
  { value: "COD", label: "Nhận tiền khi giao", color: "info" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản", color: "primary" },
  { value: "MOMO", label: "Ví MoMo", color: "pink" },
  // { value: "VNPAY", label: "Cổng VNPAY" },
  // { value: "ZALO_PAY", label: "Ví ZaloPay" },
];

export const PAYMENT_STATUS: Option[] = [
  { value: "pending", label: "Chờ thanh toán", color: "warning" },
  { value: "partially_filled", label: "Thanh toán 1 phần", color: "info" },
  { value: "filled", label: "Đã thanh toán", color: "success" },
];
