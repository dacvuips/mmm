import { BaseModel, CrudRepository } from "./crud.repo";
import { Member } from "./member.repo";
import { User } from "./user.repo";

export interface WithdrawRequest extends BaseModel {
  memberId: string;
  status: string;
  value: number;
  approvedAt: string;
  rejectedAt: string;
  rejectedReason: string;
  userId: string;
  member: Member;
  user: User;
}

export class WithdrawRequestRepository extends CrudRepository<WithdrawRequest> {
  apiName: string = "WithdrawRequest";
  displayName: string = "yêu cầu rút tiền";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: String
    status: String
    value: Float
    approvedAt: DateTime
    rejectedAt: DateTime
    rejectedReason: String
    userId: String
    member { id name code shopName shopLogo }: Member
    user { id name }: User
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: String
    status: String
    value: Float
    approvedAt: DateTime
    rejectedAt: DateTime
    rejectedReason: String
    userId: String
    member { id name code shopName shopLogo }: Member
    user { id name }: User
  `);
}
export const WithdrawRequestService = new WithdrawRequestRepository();

export type WithdrawRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export const WITHDRAW_REQUEST_STATUS: Option<WithdrawRequestStatus>[] = [
  { value: "PENDING", label: "Chờ duyệt", color: "warning" },
  { value: "APPROVED", label: "Đã duyệt", color: "success" },
  { value: "REJECTED", label: "Đã huỷ", color: "danger" },
];
