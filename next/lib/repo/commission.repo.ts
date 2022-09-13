import { BaseModel, CrudRepository } from "./crud.repo";
import { Member } from "./member.repo";
import { Customer } from "./customer.repo";
import { Order } from "./order.repo";

export interface CommissionLog extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  value: number;
  type: CommissionType;
  orderId: string;
  regisSMSId: string;
  regisServiceId: string;
  note: string;
  order: Order;
  // regisSMS: RegisSMS;
  // regisService: RegisService;
  content: string;
  member: Member;
}
export class CommissionLogRepository extends CrudRepository<CommissionLog> {
  apiName: string = "CommissionLog";
  displayName: string = "lịch sử hoa hồng";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    value: Float
    type: String
    orderId: ID
    note: String
    content: string
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    value: Float
    type: String
    orderId: ID
    regisSMSId: ID
    regisServiceId: ID
    note: String
    content: string
    member{phone name}
  }`);
}
export const CommissionLogService = new CommissionLogRepository();

export type CommissionType =
  | "RECEIVE_COMMISSION_1_FROM_ORDER"
  | "RECEIVE_COMMISSION_2_FROM_ORDER_FOR_PRESENTER"
  | "RECEIVE_COMMISSION_2_FROM_ORDER_FOR_COLLABORATOR"
  | "RECEIVE_COMMISSION_2_FROM_ORDER"
  | "RECEIVE_COMMISSION_3_FROM_ORDER"
  | "DISBURSE_COMMISSION_MANUAL"
  | "DISBURSE_COMMISSION_MOMO";
export const COMMISSION_TYPES: Option<CommissionType>[] = [
  {
    value: "RECEIVE_COMMISSION_1_FROM_ORDER",
    label: "Hoa hồng nhận từ ĐH dành cho Chủ shop",
  },
  {
    value: "RECEIVE_COMMISSION_2_FROM_ORDER_FOR_PRESENTER",
    label: "Hoa hồng nhận từ ĐH dành cho người giới thiệu shop",
  },
  {
    value: "RECEIVE_COMMISSION_2_FROM_ORDER_FOR_COLLABORATOR",
    label: "Hoa hồng CTV nhận từ đơn hàng cho chủ shop",
  },
  {
    value: "RECEIVE_COMMISSION_2_FROM_ORDER",
    label: "Hoa hồng giới thiệu nhận từ đơn hàng cho CTV",
  },
  {
    value: "RECEIVE_COMMISSION_3_FROM_ORDER",
    label: "Hoa hồng kho nhận từ đơn hàng cho chủ shop",
  },
  {
    value: "DISBURSE_COMMISSION_MANUAL",
    label: "Hoa hồng đã chi thủ công từ chủ shop",
  },
  {
    value: "DISBURSE_COMMISSION_MOMO",
    label: "Hoa hồng đã chi qua momo từ chủ shop",
  },
];
