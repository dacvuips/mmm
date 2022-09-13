import { CustomerVoucherService } from "./customer-voucher.repo";
import { CustomerService } from "./customer.repo";
import { BaseModel, CrudRepository } from "./crud.repo";

export interface LuckyWheel extends BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  code: string;
  title: string;
  backgroundColor: string;
  backgroundImage: string;
  buttonColor: string;
  bannerImage: string;
  footerImage: string;
  wheelImage: string;
  pinImage: string;
  btnTitle: string;
  startDate: string;
  endDate: string;
  successRatio: number;
  gamePointRequired: number;
  gifts: Gift[];
  isActive: boolean;
  designConfig: Partial<DesignConfig>;
  issueNumber: number;
  issueByDate: boolean;
  useLimit: number;
  useLimitByDate: boolean;
  isPrivate: boolean;
  turn: number;
  turnOfDay: number;
}
export interface DesignConfig {
  palette: string;
  giftPalettes: {
    code: string;
    name: string;
    backgroundColor: string;
    color: string;
    image?: string;
    size?: number;
    offset?: number;
  }[];
  textAlignment: "inner" | "outer";
  textOrientation: "horizontal" | "vertical" | "curved";
  textFontSize: number;
  textSplitterSize: number;
  textFontWeight: "normal" | "bold" | "bolder";
  textFontFamily: string;
  gifts: any[];
  imageUrl: string;
  hasPin: boolean;
  pinLogo: string;
  pinColor: string;
  pinUrl: string;
}
export interface Gift {
  id: string;
  code: string;
  name: string;
  desc: string;
  image: string;
  payPresent: string;
  qty: number;
  usedQty: number;
  voucherId: string;
  voucherQty: number;
  voucherExpiredDay: number;
  type: string;
  isLose: boolean;
  commission: number;
}
export class LuckyWheelRepository extends CrudRepository<LuckyWheel> {
  apiName: string = "LuckyWheel";
  displayName: string = "vòng quay";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    code: String
    title: String
    backgroundColor: String
    backgroundImage: String
    gamePointRequired: Int
    wheelImage: String
    startDate: DateTime
    endDate: DateTime
    successRatio: Int
    useLimit: Int
    useLimitByDate: Boolean
    gamePointRequired: Int
    isActive: Boolean
    turn: Int
    turnOfDay: Int
    gifts {
      id: ID
    }
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    code: String
    title: String
    backgroundColor: String
    backgroundImage: String
    buttonColor: String
    bannerImage: String
    footerImage: String
    wheelImage: String
    pinImage: String
    btnTitle: String
    startDate: DateTime
    endDate: DateTime
    successRatio: Int
    gamePointRequired: Int
    gifts {
      id: ID
      code: String
      name: String
      desc: String
      image: String
      payPresent: String
      qty: Int
      usedQty: Int
      voucherId: ID
      voucherQty: Int
      voucherExpiredDay: Int
      type: String
      isLose: Boolean
      commission: Float
    }: [Gift]
    isActive: Boolean
    designConfig: Mixed
    issueNumber: Int
    issueByDate: Boolean
    useLimit: Int
    useLimitByDate: Boolean
    isPrivate: Boolean
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
              id
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

export const LuckyWheelService = new LuckyWheelRepository();

export const GIFT_TYPES: Option[] = [
  // { value: "COMMISSION", label: "Hoa hồng" },
  { value: "VOUCHER", label: "Khuyến mãi" },
];
