import axios from "axios";
import { GetUserToken } from "../graphql/auth.link";
import { BaseModel, CrudRepository } from "./crud.repo";
import { ProductTopping } from "./product-topping.repo";

export interface ProductParam {
  value: string;
  label: string;
}

export interface Product extends BaseModel {
  id: string;
  code: string;
  name: string;
  isPrimary: boolean;
  type: string;
  basePrice: number;
  downPrice: number;
  subtitle?: string;
  image: string;
  cover: string;
  categoryId: string;
  priority: number;
  allowSale: boolean;
  rating: number;
  saleRate: number;
  soldQty: number;
  labels: ProductLabel[];
  toppings: ProductTopping[];
  upsaleProductIds: string[];
  upsaleProducts: Product[];
  commission2: number;
  limitSale: number;
  rewardPoint: number;
  deletedAt: string;
  limitSaleByDay: boolean;
  youtubeLink: string;
  images: string[];
  image_16_9: string;
  intro: string;
  branchIds: string[];
}
export interface ProductLabel extends BaseModel {
  name: string;
  color: string;
}
export class ProductRepository extends CrudRepository<Product> {
  apiName: string = "Product";
  displayName: string = "sản phẩm";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    name: String
    allowSale: Boolean
    basePrice: Float
    downPrice: Float
    saleRate: Float
    subtitle: String
    image: String
    image_16_9: String
    categoryId: ID
    rating: number
    soldQty: number
    priority: Int
    limitSale: Int
    limitSaleByDay: Boolean
    labelIds: string[]
    deletedAt: string
    rewardPoint: Int
    member {
      code:string
      province:String
      district:String
      ward:String
    }
    labels {
      id: String
      createdAt: DateTime
      updatedAt: DateTime
      memberId: ID
      name: String
      color: String
    }: [ProductLabel]
    toppings {
      id: String
      createdAt: DateTime
      updatedAt: DateTime
      memberId: ID
      name: String
      required: Boolean
      min: Int
      max: Int
      options {
        name: String
        price: Float
        isDefault: Boolean
      }: [ToppingOption]
    }: [ProductTopping]
    upsaleProductIds: string[];
    branchIds: [String]
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    name: String
    allowSale: Boolean
    basePrice: Float
    downPrice: Floa
    saleRate: Float
    subtitle: String
    image: String
    images: [String]
    image_16_9: String
    intro: String
    categoryId: ID
    rating: number
    priority: Int
    soldQty: number
    labelIds: string[]
    cover: String
    commission2: number
    limitSale: Int
    deletedAt: string
    rewardPoint: Int
    limitSaleByDay: Boolean
    member{
      code:String
      id:String
    }
    toppings {
      id: String
      createdAt: DateTime
      updatedAt: DateTime
      memberId: ID
      name: String
      required: Boolean
      min: Int
      max: Int
      
      options {
        name: String
        price: Float
        isDefault: Boolean
      }: [ToppingOption]
    }: [ProductTopping]
    labels {
      id: String
      createdAt: DateTime
      updatedAt: DateTime
      memberId: ID
      name: String
      color: String
    }: [ProductLabel]
    upsaleProductIds: string[];
    upsaleProducts {
      id: String
      code: String
      name: String
    }: Product[];
    youtubeLink: String
    branchIds: [String]
  `);

  async copyProduct(productId: string, parentCategoryId: string): Promise<Product> {
    return await this.mutate({
      mutation: `copyProduct(productId: "${productId}", parentCategoryId: "${parentCategoryId}") {
          ${this.shortFragment}
        }`,
      clearStore: true,
    }).then((res) => {
      return res.data["g0"];
    });
  }

  async exportProduct(filter: any) {
    return axios
      .get("/api/product/export", {
        params: {
          filter: btoa(JSON.stringify(filter)),
        },
        responseType: "blob",
        headers: {
          "x-token": GetUserToken(),
        },
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  }

  async importProduct(file: File) {
    let formData = new FormData();
    formData.append("data", file);

    return axios
      .post("/api/product/import", formData, {
        headers: {
          "x-token": GetUserToken(),
          "content-type": "multipart/form-data",
        },
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  }
  async getRandomProduct(limit: number, categoryId: string): Promise<Product[]> {
    return this.query({
      query: `
      getRandomProduct(limit: ${limit || 10}, categoryId: "${categoryId}" ) {
          ${this.fullFragment}
        }
      `,
    }).then((res) => res.data.g0);
  }
}

export const ProductService = new ProductRepository();
