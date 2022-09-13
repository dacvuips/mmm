import { BaseModel, CrudRepository } from "./crud.repo";

export interface ThreadLabel extends BaseModel {
  name: string;
  memberId: string;
  color: string;
}
export class ThreadLabelRepository extends CrudRepository<ThreadLabel> {
  apiName: string = "ThreadLabel";
  displayName: string = "nhãn";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
    memberId: ID
    color: String
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    name: String
    memberId: ID
    color: String
  `);
}

export const ThreadLabelService = new ThreadLabelRepository();
