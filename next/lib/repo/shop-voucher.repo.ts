import axios from "axios";
import { GetUserToken } from "../graphql/auth.link";
import { BaseModel, CrudRepository } from "./crud.repo";
import { Product, ProductService } from "./product.repo";
import { Shop } from "./shop.repo";

export interface ShopVoucher extends BaseModel {
  memberId: string;
  code: string;
  description: string;
  isActive: boolean;
  type: ShopVoucherType;
  issueNumber: number;
  issueByDate: boolean;
  useLimit: number;
  useLimitByDate: boolean;
  discountUnit: "VND" | "PERCENT";
  discountValue: number;
  maxDiscount: number;
  offerItems: OfferItem[];
  offerItemGroups: OfferItem[][];
  discountItems: DiscountItem[];
  applyItemIds: string[];
  exceptItemIds: string[];
  minSubtotal: number;
  applyPaymentMethods: string[];
  minItemQty: number;
  startDate: string;
  endDate: string;
  isPrivate: boolean;
  image: string;
  content: string;
  samePrice: number;
  requireAllApplyItem: boolean;
  offerHighestPrice: boolean;
  offerAllItem: boolean;
  offerQty: number;
  offerItemGroups2: OfferItemGroup[];
  autoAddOfferItem: boolean;
  onlyApplyItem: boolean;
  applyISODayOfWeek: number[];
  applyTimeOfDay: string[][];
}
export type ShopVoucherType =
  | "DISCOUNT_BILL"
  | "DISCOUNT_ITEM"
  | "OFFER_ITEM"
  | "OFFER_ITEM_2"
  | "SHIP_FEE"
  | "SAME_PRICE"
  | "SAME_PRICE_2";
export interface OfferItem {
  productId: string;
  qty: number;
  note: string;
  product: Product;
}
export interface OfferItemGroup {
  items: OfferItem[];
  samePrice: number;
}
export interface DiscountItem {
  productId: string;
  discountUnit: DiscountUnit;
  discountValue: number;
  maxDiscount: number;
  product: Product;
}
export type DiscountUnit = "VND" | "PERCENT";

export interface PublicVoucher extends BaseModel {
  id: string;
  code: string;
  description: string;
  type:
  | "DISCOUNT_BILL"
  | "DISCOUNT_ITEM"
  | "OFFER_ITEM"
  | "SHIP_FEE"
  | "SAME_PRICE"
  | "SAME_PRICE_2";
  startDate: string;
  endDate: string;
  image: string;
  shop: Shop;
}
export class ShopVoucherRepository extends CrudRepository<ShopVoucher> {
  apiName: string = "ShopVoucher";
  displayName: string = "coupon";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    code: String
    description: String
    isActive: Boolean
    type: String
    image: String;
    offerAllItem: Boolean
    offerQty: Int
    offerHighestPrice: Boolean
    shareLink: String
    shopVoucherGroupId: String
    shopVoucherGroup {
      id: String
      name: String
      priority:Int
    }
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    code: String
    description: String
    isActive: Boolean
    type: String
    issueNumber: Int
    issueByDate: Boolean
    useLimit: Int
    useLimitByDate: Boolean
    discountUnit: String
    discountValue: Float
    maxDiscount: Float
    applyISODayOfWeek: number[];
    applyTimeOfDay: string[][];
    offerHighestPrice: Boolean
    offerItems {
      productId: string
      qty: string
      note: string
      product {
        ${ProductService.shortFragment}
      }: Product
    }: [OfferItem]
    offerItemGroups {
      productId: string
      qty: string
      note: string
      product {
        ${ProductService.shortFragment}
      }: Product
    }: [OfferItem]
    offerItemGroups2 {
      samePrice: Float
      items{
        productId: string
        qty: string
        note: string
        product {
          ${ProductService.shortFragment}
        }: Product
      }: [OfferItem]
    }: [OfferItemGroup]
    discountItems {
      productId: string
      discountUnit: string
      discountValue: number
      maxDiscount: number
      product {
        id: String
        code: String
        name: String
        image: String
        basePrice: String
      }: Product
    }: [DiscountItem]
    applyItemIds: [ID]
    exceptItemIds: [ID]
    minSubtotal: Float
    applyPaymentMethods: [String]
    minItemQty: Int
    startDate: DateTime
    endDate: DateTime
    isPrivate: Boolean
    image: String
    content: String
    samePrice: Float
    offerAllItem: Boolean
    requireAllApplyItem: Boolean
    offerQty: Int
    autoAddOfferItem: Boolean
    onlyApplyItem: Boolean
    shareLink: String
    shopVoucherGroupId: String
    shopVoucherGroup {
      id: String
      name: String
      priority:Int
    }
  `);
  async getShopVoucherByCode(code: string): Promise<ShopVoucher> {
    return await this.apollo
      .query({
        query: this.gql`query{
          getShopVoucherByCode(code:"${code}"){
            ${this.fullFragment}
          }
        }`,
      })
      .then((res) => res.data["getShopVoucherByCode"]);
  }
  async getAllVoucher(categoryId: string) {
    return await this.apollo
      .query({
        query: this.gql`query{
          getAllVoucher${categoryId ? `(categoryId:"${categoryId}")` : ""}{
            id
            code
            description
            type
            startDate
            endDate
            image
            shop{
              shopName
              shopLogo
              shopCover
              code
              config{
                primaryColor
              }
            }
          }
        }`,
        fetchPolicy: "no-cache",
      })
      .then((res) => res.data["getAllVoucher"]);
  }
  // update shop voucher to id and shopVoucherGroupId
  // async updateShopVoucherAdmin(
  //   id: string,
  //   shopVoucherGroupId: string
  // ): Promise<ShopVoucher> {
  //   return await this.apollo
  //     .mutate({
  //       mutation: this.gql`mutation{
  //         updateShopVoucherAdmin(id:"${id}",data:{  shopVoucherGroupId:"${shopVoucherGroupId}"}){
  //           ${this.shortFragment}
  //         }
  //       }`,
  //     })
  //     .then((res) => res.data["updateShopVoucherAdminInput"]);
  // }
  async updateShopVoucherAdmin(id: string, shopVoucherGroupId: string): Promise<ShopVoucher> {
    return await this.mutate({
      mutation: `updateShopVoucherAdmin(id: "${id}",data:{ shopVoucherGroupId:"${shopVoucherGroupId}"}) {
            ${this.shortFragment}
          }`,
    }).then((res) => {
      return res.data["g0"];
    });
  }

  async exportExcelAdmin(fromDate: string, toDate: string, memberId) {
    return axios
      .get("/api/reportAdmin/exportPromotion", {
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
}
export const ShopVoucherService = new ShopVoucherRepository();

export const SHOP_VOUCHER_TYPES: Option[] = [
  { value: "DISCOUNT_BILL", label: "Giảm giá đơn hàng", color: "danger" },
  { value: "DISCOUNT_ITEM", label: "Giảm giá sản phẩm", color: "orange" },
  { value: "OFFER_ITEM", label: "Tặng sản phẩm", color: "info" },
  { value: "OFFER_ITEM_2", label: "Tặng sản phẩm theo nhóm", color: "cyan" },
  { value: "SAME_PRICE", label: "Đồng giá", color: "purple" },
  { value: "SAME_PRICE_2", label: "Đồng giá theo nhóm", color: "pink" },
  { value: "SHIP_FEE", label: "Giảm phí giao hàng", color: "success" },
];

export const DISCOUNT_BILL_UNITS = [
  { value: "VND", label: "Giảm giá cố định" },
  { value: "PERCENT", label: "Giảm theo phần trăm đơn" },
];

export const DISCOUNT_SHIP_FEE_UNITS = [
  { value: "VND", label: "Giảm giá cố định" },
  { value: "PERCENT", label: "Giảm theo phần trăm phí ship" },
];

export const ISO_DAYS_OF_WEEK: Option<number>[] = [
  { value: 1, label: "CN" },
  { value: 2, label: "T2" },
  { value: 3, label: "T3" },
  { value: 4, label: "T4" },
  { value: 5, label: "T5" },
  { value: 6, label: "T6" },
  { value: 7, label: "T7" },
];


// export const ISO_DAYS_OF_WEEK: Option<number>[] = [
//   { value: 7, label: "CN" },
//   { value: 1, label: "T2" },
//   { value: 2, label: "T3" },
//   { value: 3, label: "T4" },
//   { value: 4, label: "T5" },
//   { value: 5, label: "T6" },
//   { value: 6, label: "T7" },
// ];

