import { CrudService } from "../../../base/crudService";
import { DisburseModel } from "./disburse.model";
class DisburseService extends CrudService<typeof DisburseModel> {
  constructor() {
    super(DisburseModel);
  }
}

const disburseService = new DisburseService();

export { disburseService };
