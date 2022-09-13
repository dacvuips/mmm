import { counterService } from "../../counter/counter.service";
import { IWalletTransaction } from "./walletTransaction.model";

export class WalletTransactionHelper {
  constructor(public walletTransaction: IWalletTransaction) {}
  static async generateCode() {
    return await counterService.trigger("walletTransaction", 10000).then((count) => "WT" + count);
  }
}
