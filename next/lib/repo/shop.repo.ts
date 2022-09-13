import { ShopConfig, ShopConfigService } from "./shop-config.repo";
import { BaseModel, CrudRepository } from "./crud.repo";
import { SetAnonymousToken } from "../graphql/auth.link";

export interface Shop extends BaseModel {
  code: string;
  id: string;
  username: string;
  uid: string;
  name: string;
  avatar: string;
  shopCover: string;
  phone: string;
  fanpageId: string;
  fanpageName: string;
  fanpageImage: string;
  shopName: string;
  shopLogo: string;
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  province: string;
  district: string;
  ward: string;
  allowSale: boolean;
  deliveryDistricts: string[];
  activated: boolean;
  config: ShopConfig;
}
export interface PublicShop extends BaseModel {
  id: string;
  coverImage: string;
  name: string;
  fullAddress: string;
  distance: number;
  rating: number;
  ratingQty: number;
  shopCode: string;
  branchs: {
    name: string;
  }[];
}
export class ShopRepository extends CrudRepository<Shop> {
  apiName: string = "Shop";
  displayName: string = "shop";
  shortFragment: string = this.parseFragment(`
  code: String
  id: String
  username: String
  uid: String
  name: String
  avatar: String
  phone: String
  fanpageId: String
  fanpageName: String
  fanpageImage: String
  shopName: String
  shopLogo: String
  address: String
  provinceId: String
  districtId: String
  wardId: String
  province: String
  district: String
  ward: String
  allowSale: Boolean
  config{
    banks{
      bankName: String
      ownerName: String
      bankNumber: String
      branch: String
      note: String
      active: Boolean
    }
  }
  `);
  fullFragment: string = this.parseFragment(`
  code: String
  id: String
  username: String
  uid: String
  name: String
  avatar: String
  phone: String
  fanpageId: String
  fanpageName: String
  fanpageImage: String
  shopCover: String
  shopName: String
  shopLogo: String
  address: String
  provinceId: String
  districtId: String
  wardId: String
  province: String
  district: String
  ward: String
  allowSale: Boolean
  activated: Boolean
  deliveryDistricts: [String]
  config{${ShopConfigService.fullFragment}}:[ShopConfig]
  `);

  async getShopData() {
    return await this.query({
      query: `getShopData { ${this.fullFragment} }`,
      options: {
        fetchPolicy: "no-cache",
      },
    }).then((res) => res.data["g0"] as Shop);
  }
  async loginAnonymous(shopCode: string) {
    return await this.apollo
      .mutate({
        mutation: this.gql`mutation{
          loginAnonymous(shopCode:"${shopCode}")
        }`,
      })
      .then((res) => res.data["loginAnonymous"] as string)
      .then((token) => {
        SetAnonymousToken(token, shopCode);
        return token;
      });
  }
  async getAllShop(
    lat: number,
    lng: number,
    catID?: string,
    districtId?: string,
    orderNew?: boolean,
    search?: string,
    limit?: number,
    page?: number,
    sortByTotalOrder?: boolean
  ) {
    return await this.apollo
      .query({
        query: this.gql`query {  getAllShop(lat: ${lat} lng: ${lng} ${
          catID ? `categoryId: "${catID}"` : ""
        }${districtId ? `districtId: "${districtId}"` : ""} ${
          orderNew ? `orderNew: ${orderNew}` : ""
        }
            ${search ? `search: "${search}"` : ""} 
           ${limit ? `limit: ${limit}` : `limit:${15}`} ${page ? `page: ${page}` : `page:${1}`} ${
          sortByTotalOrder ? `sortByTotalOrder: ${sortByTotalOrder}` : ""
        }) {
          id
          coverImage
          name
          fullAddress
          distance
          rating
          ratingQty
          shopCode
          branchs{
            name
          }
         }
        }`,
        fetchPolicy: "no-cache",
      })
      .then((res) => res.data["getAllShop"] as PublicShop[]);
  }
}
export const ShopService = new ShopRepository();
