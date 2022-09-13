import { BaseModel, CrudRepository } from "./crud.repo";

export interface ShopTopic extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  image: string;
  group: string;
  summary?: number;
}
export class ShopTopicRepository extends CrudRepository<ShopTopic> {
  apiName: string = "ShopTopic";
  displayName: string = "Chủ đề";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
    slug: String
    image: String
    group: String
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
    slug: String
    image: String
    group: String
  `);
}
export const ShopTopicService = new ShopTopicRepository();
