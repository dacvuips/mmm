import { BaseModel, CrudRepository } from "./crud.repo";
import { Customer, CustomerService } from "./customer.repo";
import { Member, MemberService } from "./member.repo";

export interface RewardPointLog extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  customerId: string;
  type: string;
  value: number;
  meta: any;
  member: Member;
  customer: Customer;
}
export class RewardPointLogRepository extends CrudRepository<RewardPointLog> {
  apiName: string = "RewardPointLog";
  displayName: string = "lịch sử điểm thưởng";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    customerId: ID
    type: String
    value: Int
    meta: Mixed
    member {
      code
      shopName
    }
    customer{
      id
      name
    }`);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    customerId: ID
    type: String
    value: Int
    meta: Mixed
    member{
      ${MemberService.shortFragment}
    }
    customer{
      ${CustomerService.shortFragment}
    }`);
}

export const RewardPointLogService = new RewardPointLogRepository();

export const REWARD_POINT_STATUSES: Option[] = [
  { value: "RECEIVE_FROM_ORDER", label: "Đã nhận", color: "success" },
  { value: "USE_FOR_ORDER", label: "Sử dụng", color: "accent" },
];
