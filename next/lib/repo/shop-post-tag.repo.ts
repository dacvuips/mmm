import { BaseModel, CrudRepository } from "./crud.repo";

export interface ShopPostTag extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  name: string;
  slug: string;
  description: string;
  accentColor: string;
  featureImage: string;
}
export class ShopPostTagRepository extends CrudRepository<ShopPostTag> {
  apiName: string = "ShopPostTag";
  displayName: string = "tag bài viết";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  name: String
  slug: String
  description: String
  accentColor: String
  featureImage: String`);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  name: String
  slug: String
  description: String
  accentColor: String
  featureImage: String`);
}

export const ShopPostTagService = new ShopPostTagRepository();
