import { CrudService } from "../../../../base/crudService";
import { DisburseItemModel } from "./disburseItem.model";
class DisburseItemService extends CrudService<typeof DisburseItemModel> {
  constructor() {
    super(DisburseItemModel);
  }
}

const disburseItemService = new DisburseItemService();

export { disburseItemService };
