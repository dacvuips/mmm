import { BaseModel, CrudRepository } from "./crud.repo";

export interface MemberGroup extends BaseModel {

  name: string;
  priority: number;
  active: boolean;

}

export class MemberGroupRepository extends CrudRepository<MemberGroup> {
  apiName: string = "MemberGroup";
  displayName: string = "nhóm cửa hàng";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
    priority:Int
    active:Boolean
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
    priority:Int
    active:Boolean
  `);

}
export const MemberGroupService = new MemberGroupRepository();