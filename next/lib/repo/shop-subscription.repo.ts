import { BaseModel, CrudRepository } from "./crud.repo";
import { SubscriptionRequest } from "./subscription-request.repo";

export interface ShopSubscription extends BaseModel {
  memberId: string;
  plan: "FREE" | "MONTH" | "YEAR";
  expiredAt: Date;
  remindExpiredAt: Date;
  remindLockAt: Date;
  lockedAt: Date;
  fee: number;
  estimate: any;

  request: SubscriptionRequest;
}

export class ShopSubscriptionRepository extends CrudRepository<ShopSubscription> {
  apiName: string = "ShopSubscription";
  displayName: string = "đăng ký dịch vụ";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    plan: String
    expiredAt: DateTime
    remindExpiredAt: DateTime
    remindLockAt: DateTime
    lockedAt: DateTime
    fee: Float
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    plan: String
    expiredAt: DateTime
    remindExpiredAt: DateTime
    remindLockAt: DateTime
    lockedAt: DateTime
    fee: Float
    estimate: Mixed

    request { payment { method status }}
  `);
  async extendSubscription(
    memberId: string,
    plan: string,
    months?: number,
    days?: number
  ): Promise<ShopSubscription> {
    return await this.mutate({
      mutation: `extendSubscription(data: $data) { ${this.fullFragment} }`,
      variablesParams: `($data: ExtendSubscriptionInput!)`,
      options: {
        variables: { data: { memberId, plan, months, days } },
      },
    }).then((res) => res.data.g0);
  }
}
export const ShopSubscriptionService = new ShopSubscriptionRepository();

export const SUBSCRIPTION_PLANS: Option[] = [
  { value: "FREE", label: "Miễn phí", color: "success" },
  { value: "BASIC", label: "Cơ bản", color: "pink" },
  { value: "PROFESSIONAL", label: "Chuyên nghiệp", color: "purple" },
  // { value: "MONTH", label: "Gói tháng", color: "info" },
  // { value: "YEAR", label: "Gói năm", color: "danger" },
];

export const SUBSCRIPTION_PAYMENT_STATUS: Option[] = [
  { value: "PENDING", label: "Đang chờ", color: "warning" },
  { value: "COMPLETE", label: "Đã thanh toán", color: "success" },
  { value: "NONE", label: "Đã thanh toán", color: "info" },
];
