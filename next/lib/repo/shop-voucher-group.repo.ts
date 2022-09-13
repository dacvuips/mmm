import { BaseModel, CrudRepository } from "./crud.repo";

export interface ShopVoucherGroup extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  priority: string;
  active: boolean;
}

export class ShopVoucherGroupRepository extends CrudRepository<ShopVoucherGroup>{
  apiName: string = "ShopVoucherGroup";
  displayName: string = "Nhóm khuyến mãi";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
    priority: String
    active: Boolean
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
    priority: String
    active: Boolean
  `);
}
export const ShopVoucherGroupService = new ShopVoucherGroupRepository();
