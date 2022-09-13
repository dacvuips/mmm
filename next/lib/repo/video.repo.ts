import { BaseModel, CrudRepository } from "./crud.repo";

export interface ShopVideo extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  name: string;
  link: string;
  description: string;
  active: boolean;
  priority: number;
}
export class ShopVideoRepository extends CrudRepository<ShopVideo> {
  apiName: string = "ShopVideo";
  displayName: string = "video";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  name: String
  link: String
  description: String
  active: Boolean
  priority: Int
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  name: String
  link: String
  description: String
  active: Boolean
  priority: Int
  `);
}

export const ShopVideoService = new ShopVideoRepository();
