import { BaseModel, CrudRepository } from "../crud.repo";

export interface ShopTable extends BaseModel {
  name?: string;
  code?: string;
  memberId?: string;
  branchId?: string;
  pickupUrl?: string;
}
export class ShopTableRepository extends CrudRepository<ShopTable> {
  apiName: string = "ShopTable";
  displayName: string = "Bàn";
  shortFragment: string = this.parseFragment(`
    id createdAt updatedAt
    name
    code
    pickupUrl
  `);
  fullFragment: string = this.parseFragment(`
    id createdAt updatedAt
    name
    code
    memberId
    branchId
  `);

  async getOneByCode(code: string) {
    return await this.query({
      query: `getOneShopTableByCode(code: "${code}") { ${this.fullFragment} }`,
    }).then((res) => res.data.g0);
  }
}

export const ShopTableService = new ShopTableRepository();
