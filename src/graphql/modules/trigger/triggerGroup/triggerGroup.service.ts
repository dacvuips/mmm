import { CrudService } from "../../../../base/crudService";
import { TriggerGroupModel } from "./triggerGroup.model";
class TriggerGroupService extends CrudService<typeof TriggerGroupModel> {
  constructor() {
    super(TriggerGroupModel);
  }
}

const triggerGroupService = new TriggerGroupService();

export { triggerGroupService };
