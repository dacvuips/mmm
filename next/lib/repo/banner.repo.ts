import { BaseModel, CrudRepository } from "./crud.repo";
import { Shop } from "./shop.repo";
import { Product } from "./product.repo";
import { ShopVoucher } from "./shop-voucher.repo";

export interface Banner extends BaseModel {
  image: string;
  title: string;
  subtitle: string;
  actionType: BannerActionType;
  link: string;
  productId: string;
  voucherId: string;
  isPublic: boolean;
  priority: number;
  memberId: string;
  shop: Shop;
  product: Product;
  voucher: ShopVoucher;
  position: string;
}
export class BannerRepository extends CrudRepository<Banner> {
  apiName: string = "Banner";
  displayName: string = "banner";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    image: String
    title: String
    subtitle: String
    actionType: String
    link: String
    productId: ID
    voucherId: ID
    isPublic: Boolean
    priority: Int
    memberId: ID
    shop {
      id name code
    }: Shop
    product{
      code
    }:Product
    voucher{
      code
    }
    position:String
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    image: String
    title: String
    subtitle: String
    actionType: String
    link: String
    productId: ID
    voucherId: ID
    isPublic: Boolean
    priority: Int
    memberId: ID
    shop {
      id name code
    }: Shop
    product{
      code
    }:Product
    voucher{
      code
    }
    position:String
  `);
}

export const BannerService = new BannerRepository();

export type BannerActionType = "WEBSITE" | "PRODUCT" | "VOUCHER" | "SHOP";
export const BANNER_ACTIONS: Option<BannerActionType>[] = [
  { value: "SHOP", label: "Cửa hàng", color: "info" },
  { value: "PRODUCT", label: "Món", color: "success" },
  { value: "VOUCHER", label: "Voucher", color: "orange" },
  { value: "WEBSITE", label: "Trang web", color: "danger" },
];
