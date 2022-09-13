import { BaseModel, CrudRepository } from "./crud.repo";

export interface SubscriptionRequest extends BaseModel {
  memberId: string;
  name: string;
  plan: string;
  amount: number;
  expiredAt: string;
  payment: Payment;
}
export interface Payment {
  status: string;
  method: string;
  filledAmount: number;
  meta: {
    amount: number;
    message: string;
    orderId: string;
    partnerCode: string;
    payUrl: string;
    requestId: string;
    responseTime: number;
    resultCode: number;
  };
  logs: {
    createdAt: string;
    message: string;
  }[];
}
export class SubscriptionRequestRepository extends CrudRepository<SubscriptionRequest> {
  apiName: string = "SubscriptionRequest";
  displayName: string = "gia hạn gói dịch vụ";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: string
    name: string
    plan: string
    amount: number
    months:Ing
    expiredAt: string
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: string
    name: string
    plan: string
    amount: number
    months:Int
    expiredAt: string
    payment {
      status: string
      method: string
      filledAmount: number
      meta: any
      logs: any[]
    }
  `);
}
export const SubscriptionRequestService = new SubscriptionRequestRepository();
