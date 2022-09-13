import { CustomerVoucher, CustomerVoucherService } from "./customer-voucher.repo";
import { Customer, CustomerService } from "./customer.repo";
import { BaseModel, CrudRepository } from "./crud.repo";
import { Gift } from "./lucky-wheel.repo";

export interface LuckyWheelResult extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  customerId: string;
  luckyWheelId: string;
  code: string;
  gift: Gift;
  customer: Customer;
  voucher: CustomerVoucher;
}
export class LuckyWheelResultRepository extends CrudRepository<LuckyWheelResult> {
  apiName: string = "LuckyWheelResult";
  displayName: string = "kết quả vòng quay";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    customerId: ID
    luckyWheelId: ID
    code: String
    gift {
      code
      name
      desc
      image
      payPresent
      qty
      usedQty
      voucherId
      voucherQty
      voucherExpiredDay
      type
      isLose
      commission
    }
    customer {
      id
      name
      phone
    }
    voucher {
      id
      code
      voucherCode
      status
    }
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    customerId: ID
    luckyWheelId: ID
    code: String
    gift{
      code
      name
      desc
      image
      payPresent
      qty
      usedQty
      voucherId
      voucherQty
      voucherExpiredDay
      type
      isLose
      commission
    }
    customer{
      ${CustomerService.shortFragment}
    }
    voucher{
      ${CustomerVoucherService.shortFragment}
    }
  `);
  async playLuckyWheel(id: string) {
    return await this.apollo
      .mutate({
        mutation: this.gql`
        mutation {
          playLuckyWheel(wheelId: "${id}" ) {
            customerId
            luckyWheelId
            code
            gift{
              code
              name
              desc
              image
              payPresent
              qty
              usedQty
              voucherId
              voucherQty
              voucherExpiredDay
              type
              isLose
              commission
            }
            voucher{
              voucherId
              voucherCode
              issueNumber
              used
              expiredDate
              status
            }
          }
        }
      `,
        fetchPolicy: "no-cache",
      })
      .then((res) => res.data["playLuckyWheel"]);
  }
}

export const LuckyWheelResultService = new LuckyWheelResultRepository();
