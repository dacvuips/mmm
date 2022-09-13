import { CrudService } from "../../../../base/crudService";
import { ROLES } from "../../../../constants/role.const";
import { notFoundHandler } from "../../../../helpers/functions/notFoundHandler";
import { MainConnection } from "../../../../loaders/database";
import { WalletModel, WalletType } from "../wallet.model";
import { WalletTransactionHelper } from "./walletTransaction.helper";
import {
  IWalletTransaction,
  WalletTransactionModel,
  WalletTransactionType,
} from "./walletTransaction.model";
import { UserModel, UserRole } from "../../user/user.model";
import { Owner } from "../../mixin/owner.graphql";

class WalletTransactionService extends CrudService<typeof WalletTransactionModel> {
  constructor() {
    super(WalletTransactionModel);
  }

  async newTransaction(data: IWalletTransaction) {
    const session = await MainConnection.startSession();
    try {
      data.code = await WalletTransactionHelper.generateCode();
      data.note = data.note + ". Mã giao dịch: " + data.code;
      await session.withTransaction(async (session) => {
        const wallet = await notFoundHandler(await WalletModel.findById(data.walletId));

        // check balance in case balance not enough
        wallet.balance = wallet.balance + data.amount;
        if (wallet.balance < 0) throw new Error("Số dư không đủ để thực hiện giao dịch");

        // transaction done
        await wallet.save({ session });

        // Write log
        await WalletTransactionModel.create([data], { session });
      });

      const transaction = await WalletTransactionModel.findOne({ code: data.code });
      if (!transaction) throw new Error("Giao dịch không thành công");
      return await transaction;
    } catch (err) {
      throw err;
    } finally {
      session.endSession();
    }
  }

  async newTransferTransactionToGlobalWallet(transferData: IWalletTransaction) {
    // Tìm ví sàn
    let globalWallet = await WalletModel.findOne({
      type: WalletType.CASH,
      "owner.role": ROLES.ADMIN,
    });
    if (!globalWallet) {
      await createGlobalWallet();
      globalWallet = await WalletModel.findOne({
        type: WalletType.CASH,
        "owner.role": ROLES.ADMIN,
      });
    }
    transferData.toWalletId = globalWallet._id;
    return await this.newTransferTransaction(transferData);
  }

  async newTransferTransaction(transferData: IWalletTransaction) {
    const session = await MainConnection.startSession();
    try {
      transferData.code = await WalletTransactionHelper.generateCode();
      transferData.note = transferData.note + ". Mã giao dịch: " + transferData.code;
      transferData.amount = -Math.abs(transferData.amount);

      const receiveData: IWalletTransaction = await createReceiveData(transferData);
      receiveData.note = receiveData.note + ". Mã giao dịch: " + receiveData.code;
      if (!checkTransferTransactionData(transferData, receiveData))
        throw new Error("Thông tin chuyển tiền sai");

      await session.withTransaction(async (session) => {
        const transferWallet = await notFoundHandler(
          await WalletModel.findById(transferData.walletId)
        );
        const receiveWallet = await notFoundHandler(
          await WalletModel.findById(receiveData.walletId)
        );

        // check balance in case balance not enough
        transferWallet.balance = transferWallet.balance + transferData.amount;
        if (transferWallet.balance < 0) throw new Error("Số dư không đủ để thực hiện giao dịch");
        receiveWallet.balance = receiveWallet.balance + receiveData.amount;

        // transaction done
        await transferWallet.save({ session });
        await receiveWallet.save({ session });

        // Write log
        await WalletTransactionModel.create([transferData], { session });
        await WalletTransactionModel.create([receiveData], { session });
      });

      const transferTransaction = await WalletTransactionModel.findOne({ code: transferData.code });
      if (!transferTransaction) throw new Error("Giao dịch không thành công");
      return await transferTransaction;
    } catch (err) {
      throw err;
    } finally {
      session.endSession();
    }
  }
}

const walletTransactionService = new WalletTransactionService();

export { walletTransactionService };

async function checkTransferTransactionData(
  transferData: IWalletTransaction,
  receiveData: IWalletTransaction
): Promise<boolean> {
  // check transfer data
  if (!transferData) return false;
  if (transferData.type !== WalletTransactionType.TRANSFER) return false;
  if (!transferData.toWalletId) return false;
  if (!transferData.walletId) return false;

  // check receive Data
  if (!(await WalletModel.findById(transferData.toWalletId))) return false;

  if (!receiveData) return false;
  if (receiveData.type !== WalletTransactionType.RECEIVE) return false;
  if (!receiveData.fromWalletId) return false;
  if (!receiveData.walletId) return false;

  if (transferData.toWalletId !== receiveData.walletId) return false;
  if (transferData.walletId !== receiveData.fromWalletId) return false;

  return true;
}

async function createReceiveData(transferData: IWalletTransaction): Promise<IWalletTransaction> {
  return {
    code: await WalletTransactionHelper.generateCode(),
    walletId: transferData.toWalletId,
    type: WalletTransactionType.RECEIVE,
    amount: Math.abs(transferData.amount),
    note: "Nhận tiền từ " + transferData.note,
    tag: transferData.tag,
    extra: transferData.extra,
    fromWalletId: transferData.walletId,
  } as any;
}

async function createGlobalWallet() {
  const adminUser = await UserModel.findOne({ role: UserRole.ADMIN });
  const owner: Owner = {
    name: adminUser.name,
    email: adminUser.email,
    phone: "",
    role: adminUser.role,
  };
  const globalWallet = await WalletModel.create({
    type: WalletType.CASH,
    owner: owner,
  });
  const globalWallet2 = await WalletModel.create({
    type: WalletType.POINT,
    owner: owner,
  });
}
