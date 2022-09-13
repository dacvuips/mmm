import { BaseModel, CrudRepository } from "./crud.repo";
import { Customer, CustomerService } from "./customer.repo";
import { Member, MemberService } from "./member.repo";

export interface DisburseItem extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  disburseId: string;
  memberId: string;
  customerId: string;
  customerCode: String;
  customerPhone: String;
  customerName: String;
  value: number;
  status: string;
  meta: any;
  payoutId: string;
  member: Member;
  customer: Customer;
}
export class DisburseItemRepository extends CrudRepository<DisburseItem> {
  apiName: string = "DisburseItem";
  displayName: string = "người nhận";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  disburseId: ID
  memberId: ID
  customerId: ID
  customerCode: String
  customerPhone: String
  customerName: String
  value: Float
  status: String
  meta: Mixed
  payoutId: ID
  member{
    ${MemberService.shortFragment}
  }: Member
  customer{
    ${CustomerService.shortFragment}
  }: Customer
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  disburseId: ID
  memberId: ID
  customerId: ID
  customerCode: String
  customerPhone: String
  customerName: String
  value: Float
  status: String
  meta: Mixed
  payoutId: ID
  member{
    ${MemberService.shortFragment}
  }: Member
  customer{
    ${CustomerService.shortFragment}
  }: Customer
  `);
}

export const DisburseItemService = new DisburseItemRepository();

export const DISBURSE_ITEM_STATUS: Option[] = [
  { value: "pending", label: "Đang chờ", color: "warning" },
  { value: "completed", label: "Thành công", color: "success" },
  { value: "failed", label: "Thất bại", color: "danger" },
];
