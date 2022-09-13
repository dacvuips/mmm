import axios from "axios";
import { GetUserToken, GetMemberToken } from "../graphql/auth.link";
import { Collaborator } from "./collaborator.repo";
import { BaseModel, CrudRepository } from "./crud.repo";
import { Member } from "./member.repo";
import { Thread } from "./thread.repo";

export interface Customer extends BaseModel {
  memberId: string;
  member: Member;
  code: string;
  name: string;
  facebookName: string;
  fullAddress: string;
  uid: string;
  phone: string;
  avatar: string;
  gender: string;
  birthday: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  cumulativePoint: number;
  commission: number;
  pageAccounts: [CustomerPageAccount];
  latitude: number;
  longitude: number;
  addressNote: string;
  isCollaborator: boolean;
  collaborator: Collaborator;
  followerId: string;
  rewardPointStats: {
    total: number;
  };
  orderStats: {
    revenue: number;
    voucher: number;
    discount: number;
    total: number;
    completed: number;
    canceled: number;
  };
  commissionSummary: {
    commission: number;
    order: number;
  };
  momoWallet: CustomerMomoWallet;
  threadId: string;
  thread: Thread;
}
interface CustomerMomoWallet {
  status: CustomerMomoWalletStatus;
  statusMsg: string;
  phone: string;
  idCard: string;
  name: string;
  submitAt: string;
  updateAt: string;
}
interface CustomerPageAccount {
  psid: string;
  pageId: string;
  memberId: string;
  member: Member;
}
export interface CustomeUpdateMeInput {
  name: string;
  address?: string;
  phone: string;
  provinceId?: string;
  districtId?: string;
  birthday: string;
  wardId?: string;
  avatar?: string;
  gender?: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
  addressNote: string;
}
export class CustomerRepository extends CrudRepository<Customer> {
  apiName: string = "Customer";
  displayName: string = "khách hàng";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    code: String
    name: String
    facebookName: String
    uid: String
    phone: String
    avatar: String
    gender: String
    birthday: DateTime
    address: String
    province: String
    district: String
    ward: String
    fullAddress: String
    latitude: Float
    followerId: String
    longitude: Float
    rewardPointStats{
      total: Int
    }
    isCollaborator: Boolean
      addressNote: String;
      orderStats {
        revenue: Float
        voucher: Int
        discount: Float
        total: Int
        completed: Int
        canceled: Int
      }: CustomerOrderStats
      threadId: ID
      thread {
        id
      }
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    code: String
    name: String
    facebookName: String
    uid: String
    phone: String
    avatar: String
    gender: String
    birthday: DateTime
    address: String
    province: String
    district: String
    ward: String
    provinceId: String
    districtId: String
    wardId: String
    cumulativePoint: Float
    commission: Float
    fullAddress: String
    followerId: String
    addressNote: String;
    rewardPointStats{
      total: Int
    }
    isCollaborator: Boolean
    collaborator{
      shortCode: String
      shortUrl: String
      status: Boolean
    }
    pageAccounts {
      psid: fullAddress: String
      pageId: fullAddress: String
      memberId: fullAddress: String
      member {
        id: String
        name: String
      }: Member;
    }: [CustomerPageAccount]
    latitude: Float
    longitude: Float
    orderStats {
      revenue: Float
      voucher: Int
      discount: Float
      total: Int
      completed: Int
      canceled: Int
    }: CustomerOrderStats
    commissionSummary{
      commission: Float
      order: Int
    }:CustomerCommissionSummary
    momoWallet {
      status: String
      statusMsg: String
      phone: String
      idCard: String
      name: String
      submitAt: DateTime
      updateAt: DateTime
    }: CustomerMomoWallet
    threadId: ID
    thread {
      id
    }
  `);
  async loginCustomerByPhone(phone, name, otp?): Promise<{ customer: Customer; token: string }> {
    return await this.apollo
      .mutate({
        mutation: this.gql`mutation {  loginCustomerByPhone(phone: "${phone}",name: "${name}" ${otp ? `otp:"${otp}"` : ""
          }) {
          token
          customer{
            ${CustomerService.shortFragment}
          }
        }}`,
      })
      .then((res) => ({
        customer: res.data["loginCustomerByPhone"]["customer"] as Customer,
        token: res.data["loginCustomerByPhone"]["token"] as string,
      }));
  }
  async getCustomer() {
    return await this.query({
      query: `customerGetMe { ${this.fullFragment} }`,
      options: {
        fetchPolicy: "no-cache",
      },
    }).then((res) => res.data["g0"] as Customer);
  }
  async requestOtp(phone: string) {
    return await this.mutate({
      mutation: `requestOtp(phone:"${phone}")`,
    }).then((res) => res.data["g0"]);
  }
  async updatePresenter(colCode) {
    return await this.mutate({
      mutation: `updatePresenter(colCode: "${colCode}")`,
    }).then((res) => res.data["g0"]);
  }
  async updateCustomerPSID(psid: string) {
    return await this.mutate({
      mutation: `updateCustomerPSID(psid: "${psid}")`,
    }).then((res) => res.data["g0"]);
  }
  async updateCustomerFollowerId(followerId: string) {
    return await this.mutate({
      mutation: `updateCustomerFollowerId(followerId: "${followerId}")`,
    }).then((res) => res.data["g0"]);
  }

  async submitCustomerMomoWallet({ name, idCard }) {
    return await this.mutate({
      mutation: `submitCustomerMomoWallet(name: "${name}", idCard: "${idCard}")`,
    }).then((res) => res.data["g0"]);
  }

  async exportExcel() {
    return axios
      .get("/api/report/exportCustomer", {
        // params: {
        //   fromDate,
        //   toDate,
        //   filter: Buffer.from(JSON.stringify(filter)).toString("base64"),
        // },
        headers: {
          "x-token": GetMemberToken(),
        },
        responseType: "blob",
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  }
  async exportExcelAdmin(fromDate: string, toDate: string, memberId) {
    return axios
      .get("/api/reportAdmin/exportCustomer", {
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
  adminShortFragment = this.shortFragment.concat(`
    member { id shopName shopLogo code }
  `);
}

export const CustomerService = new CustomerRepository();

export type CustomerMomoWalletStatus =
  | "none"
  | "processing"
  | "invalid"
  | "wallet_invalid"
  | "walled_not_found"
  | "valid";
export const CUSTOMER_MOMO_WALLET_STATUS: Option<CustomerMomoWalletStatus>[] = [
  {
    value: "none",
    label: "Chưa đăng ký",
    color: "slate",
  },
  {
    value: "processing",
    label: "Chờ xử lý",
    color: "warning",
  },
  {
    value: "invalid",
    label: "Thông tin không hợp lệ",
    color: "danger",
  },
  {
    value: "wallet_invalid",
    label: "Ví MoMo không hợp lệ",
    color: "danger",
  },
  {
    value: "walled_not_found",
    label: "Không tìm thấy ví MoMo",
    color: "danger",
  },
  {
    value: "valid",
    label: "Ví MoMo hợp lệ",
    color: "success",
  },
];
