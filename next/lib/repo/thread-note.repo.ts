import { BaseModel, CrudRepository } from "./crud.repo";

export interface ThreadNote extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  threadId: string;
  text: string;
  attachment: string;
}
export class ThreadNoteRepository extends CrudRepository<ThreadNote> {
  apiName: string = "ThreadNote";
  displayName: string = "ghi chú";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    threadId: ID
    text: String
    attachment: String
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    threadId: ID
    text: String
    attachment: String
  `);
}

export const ThreadNoteService = new ThreadNoteRepository();
