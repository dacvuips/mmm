import { gql } from "apollo-server-express";
import _ from "lodash";
import { Types } from "mongoose";
import { configs } from "../../../../configs";
import { ROLES } from "../../../../constants/role.const";
import cache from "../../../../helpers/cache";
import momo from "../../../../helpers/momo";
import redis from "../../../../helpers/redis";
import { logger } from "../../../../loaders/logger";
import { Context } from "../../../context";
import { WalletModel } from "../../wallet/wallet.model";
import { WalletTransactionHelper } from "../../wallet/walletTransaction/walletTransaction.helper";
import { WalletTransactionType } from "../../wallet/walletTransaction/walletTransaction.model";
import { walletTransactionService } from "../../wallet/walletTransaction/walletTransaction.service";
import { MemberLoader, MemberModel } from "../member.model";

export default {
  schema: gql`
    extend type Mutation {
      depositWalletByMomo("Số tiền nạp" amount: Float!): Mixed
    }
  `,
  resolver: {
    Mutation: {
      depositWalletByMomo: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.MEMBER, ROLES.STAFF]);
        const { amount } = args;

        if (amount < 50000) {
          throw new Error("Số tiền nạp phải lớn hơn 50.000 VND");
        }

        const member = await MemberLoader.load(context.sellerId);
        const wallet = await member.getWallet();

        // generate  momo payment qr code
        logger.info(`Tạo mã nạp tiền bằng QRCode`);
        // Thanh toán bằng momo
        const {
          momo: { partnerCode, secretKey, accessKey, iosSchemeId, mode },
          domain,
        } = configs;

        const depositTransaction = {
          _id: Types.ObjectId().toHexString(),
          memberId: member._id,
          code: "GD" + _.random(100000, 999999),
          amount: amount,
          type: "deposit",
          payUrl: "",
        };
        const extraData = "shop-wallet-deposit:" + member.code;
        const momoTransaction = await momo.payQrcode({
          partnerCode,
          partnerName: member.shopName,
          amount: amount,
          requestId: depositTransaction._id,
          lang: "vi",
          orderId: depositTransaction.code,
          orderInfo: `Nạp tiền cửa hàng ${member.code}(${member.shopName})`,
          redirectUrl: `${domain}/shop/wallet?paymentCb=deposit`,
          ipnUrl: `https://webhook.site/863cbeef-7731-481f-8b16-9ce0e914e16a`,
          // ipnUrl: `${domain}/api/paymentTracking/momo`,
          extraData: extraData,
          secretKey,
          accessKey,
        });

        depositTransaction.payUrl = momoTransaction.payUrl;

        cache.set(extraData, JSON.stringify(depositTransaction), 60 * 10);

        return depositTransaction;
      },
    },
  },
};

momo.on("paid", async (transaction: any) => {
  const { extraData, orderId: code, amount } = transaction;
  const {
    momo: { partnerCode },
  } = configs;

  if (
    partnerCode != transaction.partnerCode ||
    extraData.startsWith("shop-wallet-deposit:") == false
  ) {
    // Bỏ quà nếu không phải giao dịnh của chủ shop
    return;
  }

  // get transaction from cache
  const transactionCache = await cache.get(extraData);
  if (transactionCache == null) {
    logger.error(`Không tìm thấy giao dịnh nạp tiền của shop`);
    return;
  }

  const transactionCacheObj = JSON.parse(transactionCache);
  const { memberId } = transactionCacheObj;

  const member = await MemberModel.findById(memberId);
  if (member == null) {
    logger.error(`Không tìm thấy thành viên`);
    return;
  }
  const wallet = await member.getWallet();
  // update wallet
  const data: any = {
    code: await WalletTransactionHelper.generateCode(),
    walletId: wallet.id,
    type: WalletTransactionType.DEPOSIT,
    amount: amount,
    note: `Nạp tiền từ momo. Mã GD: ${code}. Momo: ${transaction.transId}`,
    extra: {
      transId: transaction.transId,
      type: "momo",
      code: code,
    },
  };
  await walletTransactionService.newTransaction(data);

  // clear cache
  cache.del(extraData);
  logger.info("Nạp tiền thành công", transaction);
});
