import { BaseModel, CrudRepository } from "./crud.repo";
import { Member, MemberService } from "./member.repo";
import { User, UserService } from "./user.repo";

export interface Disburse extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  note: string;
  ownerId: string;
  closeById: string;
  closeAt: string;
  owner: User;
  closeBy: User;
  member: Member;
}
export class DisburseRepository extends CrudRepository<Disburse> {
  apiName: string = "Disburse";
  displayName: string = "giải ngân";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  name: String
  startDate: DateTime
  endDate: DateTime
  status: String
  note: String
  ownerId: ID
  closeById: ID
  closeAt: DateTime
  owner{
    ${UserService.shortFragment}
  }: User
  closeBy{
    ${UserService.shortFragment}
  }: User
  member{
    ${MemberService.shortFragment}
  }: Member
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  name: String
  startDate: DateTime
  endDate: DateTime
  status: String
  note: String
  ownerId: ID
  closeById: ID
  closeAt: DateTime
  owner{
    ${UserService.shortFragment}
  }: User
  closeBy{
    ${UserService.shortFragment}
  }: Disburse
  member{
    ${MemberService.shortFragment}
  }: Member
  `);
}

export const DisburseService = new DisburseRepository();
export const DISBURSE_STATUS: Option[] = [
  { value: "opening", label: "Đang mở", color: "success" },
  { value: "closed", label: "Đã đóng", color: "slate" },
];
