import { MemberModel } from "../../member/member.model";
import { WalletModel } from "../wallet.model";
import {
  WalletTransactionModel,
  WalletTransactionType,
} from "../walletTransaction/walletTransaction.model";
import { walletTransactionService } from "../walletTransaction/walletTransaction.service";

export default test("Wallet deposit", async () => {
  const member = await MemberModel.findOne({ code: "3MSHOP" });
  const wallet = await WalletModel.findOne({ _id: member.walletId });
  const transaction = new WalletTransactionModel({
    walletId: wallet.id,
    type: WalletTransactionType.DEPOSIT,
    amount: 100000,
    note: "Nạp tiền 100k",
  });
  await walletTransactionService.newTransaction(transaction);

  const walletAfter = await WalletModel.findOne({ _id: member.walletId });
  expect(walletAfter.balance - wallet.balance).toBe(100000);
});
