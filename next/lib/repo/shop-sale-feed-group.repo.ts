import { BaseModel, CrudRepository } from './crud.repo';
export interface ShopSaleFeedGroup extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
}
export class ShopSaleFeedGroupRepository extends CrudRepository<ShopSaleFeedGroup> {
  apiName: string = "ShopSaleFeedGroup";
  displayName: string = "Nhóm bài đăng bán";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
  `);
}
export const ShopSaleFeedGroupService = new ShopSaleFeedGroupRepository();