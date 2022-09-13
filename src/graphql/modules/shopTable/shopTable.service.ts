import { CrudService } from "../../../base/crudService";
import { ShopTableModel } from "./shopTable.model";
class ShopTableService extends CrudService<typeof ShopTableModel> {
  constructor() {
    super(ShopTableModel);
  }
}

const shopTableService = new ShopTableService();

export { shopTableService };
