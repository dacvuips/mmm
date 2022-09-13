import axios from "axios";
import { GetUserToken } from "../graphql/auth.link";
import { BaseModel, CrudRepository } from "./crud.repo";
import { ShopCategory } from "./shop-category.repo";
import { ShopSubscription, ShopSubscriptionService } from "./shop-subscription.repo";
import { Thread, ThreadService } from "./thread.repo";
import { Wallet } from "./wallet-transaction.repo";

interface Branch extends BaseModel {
  name: string;
}

interface Position extends BaseModel {
  name: string;
}

interface SubscriberInfo {
  id: string;
  psid: string;
  name: string;
  firstName: string;
  lastName: string;
  gender: string;
  locale: string;
  profilePic: string;
}

export interface Member extends BaseModel {
  code: string;
  username: string;
  uid: string;
  name: string;
  avatar: string;
  phone: string;
  fanpageId: string;
  fanpageName: string;
  fanpageImage: string;
  shopName: string;
  shopLogo: string;
  shopCover: string;
  cumulativePoint: number;
  diligencePoint: number;
  commission: number;
  address: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  province: string;
  district: string;
  ward: string;
  identityCardNumber: string;
  gender: string;
  birthday: string;
  parentIds: string[];
  activedAt: string;
  activated: boolean;
  type: string;
  branchId: string;
  positionId: string;
  psids: string[];
  phoneVerified: boolean;
  chatbotStory: {
    pageId: string;
    storyId: string;
    name: string;
    isStarted: boolean;
    isUseRef: boolean;
    ref: string;
    message: string;
    btnTitle: string;
    type: string;
    image: string;
  }[];
  allowSale: boolean;
  branch: Branch;
  position: Position;
  parents: Member[];
  subscribers: SubscriberInfo[];
  chatbotRef: string;
  shopUrl: string;
  ordersCount: number;
  toMemberOrdersCount: number;
  deliveryDistricts: string[];
  categoryId: string;
  category: ShopCategory;
  subscription: ShopSubscription;
  threadId: string;
  thread: Thread;

  walletId: string;
  wallet: Wallet;

  memberGroupId: string;
  memberGroup: {
    id: string;
    name: string;
    priority: number;
    active: boolean;
  };
}
export class MemberRepository extends CrudRepository<Member> {
  apiName: string = "Member";
  displayName: string = "cửa hàng";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    username: String
    uid: String
    name: String
    avatar: String
    phone: String
    fanpageId: String
    fanpageName: String
    fanpageImage: String
    shopName: String
    shopLogo: String
    activated: Boolean
    phoneVerified: Boolean
    categoryId: string
    category { id name }
    subscription {
      ${ShopSubscriptionService.shortFragment}
    }
    threadId: ID
 
    wallet {
      id balance
    }
    memberGroupId:String
    memberGroup{
      id:String
      name:String
    }
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    username: String
    uid: String
    name: String
    avatar: String
    phone: String
    fanpageId: String
    fanpageName: String
    fanpageImage: String
    shopName: String
    shopLogo: String
    shopCover: String
    cumulativePoint: Float
    diligencePoint: Float
    commission: Float
    address: String
    provinceId: String
    districtId: String
    wardId: String
    province: String
    district: String
    ward: String
    identityCardNumber: String
    gender: String
    birthday: DateTime
    parentIds: [ID]
    activedAt: DateTime
    activated: Boolean
    type: String
    branchId: ID
    positionId: ID
    phoneVerified: Boolean
    psids: [String]
    allowSale: Boolean
    shopUrl: String
    ordersCount: Int
    toMemberOrdersCount: Int
    deliveryDistricts: [String]
    categoryId: string
    category { id name }: ShopCategory
    subscription {
      ${ShopSubscriptionService.fullFragment}
    }
    threadId: ID
    thread { id }
    wallet { id balance }
    memberGroupId:String
    memberGroup {
      id:String
      name:String
    }
  `);
  async verifyMemberPhoneByFirebaseToken(idToken: string) {
    return await this.apollo.mutate({
      mutation: this.gql`
        mutation {
          verifyMemberPhoneByFirebaseToken(token: "${idToken}") {
            ${this.fullFragment}
          }
        }
      `,
    });
  }
  async updateMemberPassword(id: string, password: string) {
    return await this.apollo.mutate({
      mutation: this.gql`
        mutation {
          updateMemberPassword(memberId: "${id}", password: "${password}") {
            id
          }
        }
      `,
    });
  }

  async getMemberToken(memberId: string) {
    return await this.query({
      query: `getMemberToken(memberId: "${memberId}")`,
    }).then((res) => res.data.g0);
  }

  async sendOTP(emailOTP: string) {
    return await this.mutate({
      mutation: `sendOTP(emailOTP: "${emailOTP}")`,
    }).then((res) => res.data.g0);
  }

  async resetMemberPassword(emailOTP: string, OTP: string, newPassword: string) {
    return await this.mutate({
      mutation: `resetMemberPassword(emailOTP: "${emailOTP}", OTP: "${OTP}", newPassword: "${newPassword}")`,
    }).then((res) => res.data.g0);
  }

  async updateMemberEmail(emailOTP: string, OTP: string, newEmail: string) {
    return await this.mutate({
      mutation: `updateMemberEmail(emailOTP: "${emailOTP}", OTP: "${OTP}", newEmail: "${newEmail}")`,
    }).then((res) => res.data.g0);
  }
  async memberResetPasswordOTPSMSRequest(code: string, username: string) {
    return await this.mutate({
      mutation: `memberResetPasswordOTPSMSRequest(code: "${code}",username: "${username}")`,
    }).then((res) => res.data.g0);
  }
  async memberResetPasswordGetToken(code: string, OTP: string) {
    return await this.mutate({
      mutation: `memberResetPasswordGetToken(code: "${code}", OTP: "${OTP}")`,
    }).then((res) => res.data.g0.token as string);
  }
  async memberRequestResetPwd(email: string) {
    return await this.mutate({
      mutation: `memberRequestResetPwd(email: "${email}")`,
    }).then((res) => res.data.g0 as string);
  }
  async validateResetPwdToken(token: string) {
    return await this.mutate({
      mutation: `validateResetPwdToken(token: "${token}")`,
    }).then((res) => res.data.g0 as string);
  }
  async memberResetPwd(token: string, password: string) {
    return await this.mutate({
      mutation: `memberResetPwd(token: "${token}",password:"${password}")`,
    }).then((res) => res.data.g0 as string);
  }
  async memberResetPasswordByToken(code: string, newPassword: string, token: string) {
    return await this.mutate({
      mutation: `memberResetPasswordByToken(code: "${code}", newPassword: "${newPassword}")`,
      token,
    }).then((res) => res.data.g0);
  }
  async loginMemberByPassword(
    username: string,
    password: string,
    deviceId: string,
    deviceToken: string
  ) {
    return await this.mutate({
      mutation: `loginMemberByPassword(username: "${username}", password: $password, deviceId: "${deviceId}", deviceToken: "${deviceToken}") {
        member { ${MemberService.fullFragment} } token
      }`,
      variablesParams: `($password: String!)`,
      options: {
        variables: { password },
      },
    }).then((res) => res.data.g0);
  }

  async exportMemberExcel(all: boolean, plan: string, status: string) {
    return axios
      .get("/api/report/exportMember", {
        params: {
          all: all,
          plan: plan,
          status: status,
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
}
export const STATUS_MEMBER: Option[] = [
  { value: "NONE", label: "Chưa chọn", },
  { value: "ACTIVE", label: "Hoạt động", },
  { value: "NONACTIVE", label: "Đóng cửa", },
]
export const SERVICE_PACKAGE: Option[] = [
  { value: "NONE", label: "Chưa chọn", },
  { value: "FREE", label: "Miễn phí", },
  { value: "PAY", label: "Trả phí", },
  { value: "EXPIRED30", label: "Sắp hết hạn trong 30 ngày", },
]
export const MemberService = new MemberRepository();
