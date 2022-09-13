import { BaseModel, CrudRepository } from "./crud.repo";
import { Owner } from "./types/mixed.type";

export interface Wallet extends BaseModel {
  type: string;
  balance: string;
  owner: Owner;
}
export interface WalletTransaction extends BaseModel {
  code: string;
  walletId: string;
  type: string;
  amount: number;
  note: string;
  extra: any;
  fromWalletId: string;
  toWalletId: string;
}

export class WalletTransactionRepository extends CrudRepository<WalletTransaction> {
  apiName: string = "WalletTransaction";
  displayName: string = "lịch sử ví tiền";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    walletId: String
    type: String
    amount: Float
    note: String
    extra: Mixed
    fromWalletId: ID
    toWalletId: ID
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    code: String
    walletId: String
    type: String
    amount: Float
    note: String
    extra: Mixed
    fromWalletId: ID
    toWalletId: ID
  `);
  async depositWalletByMomo(amount: number) {
    return await this.apollo.mutate({
      mutation: this.gql`
        mutation { depositWalletByMomo(amount: ${amount}) }
      `,
    })
      .then((res) => res.data);

  }
  async manualTopUpByAdmin(walletId: string, amount: number) {
    return await this.apollo.mutate({
      mutation: this.gql`
        mutation { manualTopUpByAdmin(data:{walletId: "${walletId}", amount: ${amount}}){ id } }
      `,
    })
      .then((res) => res.data);
  }
}
export const WalletTransactionService = new WalletTransactionRepository();

export const WALLET_TRANSACTION_TYPE_OPTIONS: Option[] = [
  { value: "DEPOSIT", label: "Nạp tiền", color: "primary" },
  { value: "WITHDRAW", label: "Rút tiền", color: "danger" },
  { value: "ADJUST", label: "Điều chỉnh", color: "warning" },
  { value: "TRANSFER", label: "Chuyển Khoản", color: "orange" },
  { value: "RECEIVE", label: "Nhận tiền", color: "success" },
];

export const MEMBER_WALLET_TRANS_LABEL_OPTIONS: Option[] = [
  { value: "ORDER", label: "Đơn hàng", color: "primary" },
  { value: "MOMO", label: "Momo", color: "accent" },
];
