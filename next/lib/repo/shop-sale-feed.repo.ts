import { BaseModel, CrudRepository } from "./crud.repo";
import { Product } from "./product.repo";

export interface ShopSaleFeed extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  name: string;
  snippet: string;
  tips: string;
  contents: SaleFeedContent[];
  productId: string;
  active: boolean;
  priority: number;
  product: Product;
  images: string[];
  shareLink: string;
  showOnMarketPlace: boolean;
  approvalStatus: string;
  shopSaleFeedGroupId: string;

}
export interface SaleFeedContent {
  content: string;
  images: string[];
}
export class ShopSaleFeedRepository extends CrudRepository<ShopSaleFeed> {
  apiName: string = "ShopSaleFeed";
  displayName: string = "bài đăng bán";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  name: String
  snippet: String
  tips: String
  contents{
    content: String
    images: [String]
  }: [SaleFeedContent]
  productId: ID
  active: Boolean
  priority: Int
  product{
    id code image name
  }: Product
  images: [String]
  shareLink: String
  showOnMarketPlace: Boolean
  approvalStatus:String
  shopSaleFeedGroupId:String
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  name: String
  snippet: String
  tips: String
  contents{
    content: String
    images: [String]
  }: [SaleFeedContent]
  productId: ID
  active: Boolean
  priority: Int
  product{
    id code
  }: Product
  images: [String]
  shareLink: String
  showOnMarketPlace: Boolean
  approvalStatus:String
  shopSaleFeedGroupId:String

  `);
  async approvalShopSaleFeed(id: string, approvalStatus: string): Promise<ShopSaleFeed> {
    return await this.mutate({
      mutation: `approvalShopSaleFeed(id: "${id}",data:{ approvalStatus: "${approvalStatus}"}){
        ${this.shortFragment}
      }`,
    }).then((res) => {
      return res.data
    });

  }
  async updateShopSaleFeedAdmin(id: string, shopSaleFeedGroupId: string): Promise<ShopSaleFeed> {
    return await this.mutate({
      mutation: `updateShopSaleFeedAdmin(id: "${id}",data:{ shopSaleFeedGroupId: "${shopSaleFeedGroupId}"}){
        ${this.shortFragment}
      }`,
    }).then((res) => {
      return res.data
    });

  }

}


export const ShopSaleFeedService = new ShopSaleFeedRepository();

export const POST_STATUSES: Option[] = [
  { value: "DRAFT", label: "Bản nháp", color: "accent" },
  { value: "PUBLIC", label: "Công khai", color: "success" },
];

export const APPROVAL_STATUSES: Option[] = [
  { value: "PENDING", label: "Chờ phê duyệt", color: "warning" },
  { value: "APPROVED", label: "Phê duyệt", color: "success" },
  { value: "REJECTED", label: "Từ chối", color: "danger" },
];

export const MARKET_PLACE_STATUSES: Option[] = [
  { value: true, label: "Hiển thị trên market place", color: "success" },
  { value: false, label: "không hiển thị market place", color: "accent" },
];

