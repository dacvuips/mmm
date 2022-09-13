import { CrudService } from "../../../../base/crudService";
import { MemberGroupModel } from "./memberGroup.model";
class MemberGroupService extends CrudService<typeof MemberGroupModel> {
  constructor() {
    super(MemberGroupModel);
  }
}

const memberGroupService = new MemberGroupService();

export { memberGroupService };
