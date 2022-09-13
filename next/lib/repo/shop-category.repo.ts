import { BaseModel, CrudRepository, QueryInput } from "./crud.repo";

export interface ShopCategory extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  image: string;
  desc: string;
  priority: number;
  shopCount: number;
}
export class ShopCategoryRepository extends CrudRepository<ShopCategory> {
  apiName: string = "ShopCategory";
  displayName: string = "Danh mục cửa hàng";
  shortFragment: string = this.parseFragment(`
    id
    createdAt
    updatedAt
    name
    image
    desc
    shopCount
    priority`);
  fullFragment: string = this.parseFragment(`
      id
      createdAt
      updatedAt
      name
      image
      desc
      shopCount
      priority
  `);
}

export const ShopCategoryService = new ShopCategoryRepository();
