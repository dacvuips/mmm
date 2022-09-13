import { BaseModel, CrudRepository, QueryInput } from "./crud.repo";
import { Member } from "./member.repo";
import { Customer } from "./customer.repo";
import axios from "axios";
import { GetUserToken } from "../graphql/auth.link";
import { CommissionLog } from "./commission.repo";

export interface Collaborator extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  name: string;
  phone: string;
  memberId: string;
  customerId: string;
  shortCode: string;
  shortUrl: string;
  clickCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  engagementCount: number;
  status: string;
  member: Member;
  customer: Customer;
  commissionStats: CollaboratorCommissionStats;
  orderStats: CollaboratorOrderStats;
}
interface CollaboratorCommissionStats {
  _id: string;
  /** Còn lại */
  commission: number;
  /** Tổng cộng */
  totalCommission: number;
  /** Đã chi */
  totalDisburse: number;
}
interface CollaboratorOrderStats {
  completeOrder: number;
  uncompleteOrder: number;
  completeProductQty: number;
  uncompleteProductQty: number;
}
export interface InvitedCustomer extends BaseModel {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  ordered: boolean;
  commission: number;
}
export class CollaboratorRepository extends CrudRepository<Collaborator> {
  apiName: string = "Collaborator";
  displayName: string = "cộng tác viên";
  shortFragment: string = this.parseFragment(`
    id: string
    createdAt: string
    updatedAt: string
    code: string
    name: string
    phone: string
    memberId: string
    customerId: string
    shortCode: string
    shortUrl: string
    clickCount: number
    likeCount: number
    shareCount: number
    commentCount: number
    engagementCount: number
    status: string
    customer {
      momoWallet { status }
    }: Customer
  `); //không được thêm customer vì không đủ quyền truy câp
  fullFragment: string = this.parseFragment(`
    id: string
    createdAt: string
    updatedAt: string
    code: string
    name: string
    phone: string
    memberId: string
    customerId: string
    shortCode: string
    shortUrl: string
    clickCount: number
    likeCount: number
    shareCount: number
    commentCount: number
    engagementCount: number
    status: string
    commissionStats {
      _id: String
      commission: Float
      totalCommission: Float
      totalDisburse: Float
    }
    customer {
      momoWallet { status }
    }: Customer
  `);

  async regisCollaborator(): Promise<{}> {
    return await this.apollo
      .mutate({
        mutation: this.gql`mutation{
          regisCollaborator{
           code
          }
        }`,
      })
      .then((res) => res);
  }

  async getAllInvitedCustomers(
    customerId: string,
    query?: QueryInput
  ): Promise<{ data: InvitedCustomer[] }> {
    return await this.apollo
      .query({
        query: this.gql`query{
          getAllInvitedCustomers(customerId:"${customerId}" ${query ? `q:"${query}"` : ""}){
            data{
              id
              name
              avatar
              phone
              ordered
              commission
            }
          }
        }`,
      })
      .then((res) => res.data["getAllInvitedCustomers"]);
  }

  async exportExcelAdmin(fromDate: string, toDate: string, memberId) {
    return axios
      .get("/api/reportAdmin/exportCollaborator", {
        params: {
          fromDate,
          toDate,
          memberId,
        },
        headers: {
          "x-token": GetUserToken(),
        },
        responseType: "blob",
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  }

  async disburseCommission(data: {
    customerId: string;
    value: number;
    type: string;
    content: string;
    attachments: [String];
  }): Promise<CommissionLog> {
    return await this.mutate({
      mutation: `disburseCommission(data: $data) { id }`,
      variablesParams: `($data: CreateCommissionLogInput!)`,
      options: {
        variables: { data },
      },
    }).then((res) => {
      return res as CommissionLog;
    });
  }

  adminShortFragment = this.shortFragment.replace(
    "shortUrl",
    "member { id code shopName shopLogo }"
  );
}
export const CollaboratorService = new CollaboratorRepository();

export const COLLABORATOR_STATUS: Option[] = [
  { value: "PENDING", label: "Chờ duyệt", color: "warning" },
  { value: "ACTIVE", label: "Hoạt động", color: "success" },
  { value: "BLOCKED", label: "Bị khoá", color: "danger" },
];

export type DisburseType = "DISBURSE_COMMISSION_MOMO" | "DISBURSE_COMMISSION_MANUAL";
export const DISBURSE_TYPES: Option<DisburseType>[] = [
  { value: "DISBURSE_COMMISSION_MANUAL", label: "Chi thủ công", color: "primary" },
  { value: "DISBURSE_COMMISSION_MOMO", label: "Chi qua MoMo", color: "pink" },
];
