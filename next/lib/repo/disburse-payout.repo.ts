import { BaseModel, CrudRepository } from "./crud.repo";

export interface DisbursePayout extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  disburseId: string;
  ownerId: string;
  approverId: string;
  approveAt: string;
  name: string;
  amount: number;
  transactionCount: number;
  successCount: number;
  successAmount: number;
  failedCount: number;
  status: "processing" | "pending" | "approved" | "denied" | "canceled" | "error";
  processingMsg: string;
  meta: any;
}
export class DisbursePayoutRepository extends CrudRepository<DisbursePayout> {
  apiName: string = "DisbursePayout";
  displayName: string = "đợt chi";
  shortFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  disburseId: ID
  ownerId: ID
  approverId: ID
  approveAt: DateTime
  name: String
  amount: Float
  transactionCount: Int
  successCount: Int
  successAmount: Float
  failedCount: Int
  status: String
  processingMsg: String
  meta: Mixed
  `);
  fullFragment: string = this.parseFragment(`
  id: String
  createdAt: DateTime
  updatedAt: DateTime
  memberId: ID
  disburseId: ID
  ownerId: ID
  approverId: ID
  approveAt: DateTime
  name: String
  amount: Float
  transactionCount: Int
  successCount: Int
  successAmount: Float
  failedCount: Int
  status: String
  processingMsg: String
  meta: Mixed
  `);
  async approveDisbursePayout(id: string) {
    return await this.apollo
      .mutate({
        mutation: this.gql`mutation{
          approveDisbursePayout(payoutId:"${id}"){
            ${this.fullFragment}
          }
        }`,
      })
      .then((res) => res.data["approveDisbursePayout"] as string);
  }
  async recheckPayout(id: string) {
    return await this.apollo
      .mutate({
        mutation: this.gql`mutation{
          recheckPayout(payoutId:"${id}"){
            ${this.fullFragment}
          }
        }`,
      })
      .then((res) => res.data["recheckPayout"] as string);
  }
}

export const DisbursePayoutService = new DisbursePayoutRepository();
// processing,pending,approved,denied,canceled,error

export const DISBURSE_PAYOUT_STATUS: Option[] = [
  { value: "processing", label: "Đang xử lý", color: "info" },
  { value: "pending", label: "Đang chờ", color: "warning" },
  { value: "approved", label: "Chấp thuận", color: "success" },
  { value: "denied", label: "Từ chối", color: "slate" },
  { value: "canceled", label: "Đã hủy", color: "cyan" },
  { value: "error", label: "Bị lỗi", color: "danger" },
];
