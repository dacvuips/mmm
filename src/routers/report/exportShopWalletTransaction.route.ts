import Excel, { Worksheet } from "exceljs";
import { Request, Response } from "express";
import moment from "moment";
import { Types } from "mongoose";
import { BatchAsync } from "throttle-batch-size";
import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { MemberLoader } from "../../graphql/modules/member/member.model";
import {
  IWalletTransaction,
  WalletTransactionModel,
  WalletTransactionType,
} from "../../graphql/modules/wallet/walletTransaction/walletTransaction.model";
import { UtilsHelper, validateJSON } from "../../helpers";
import { waitForCursor } from "../../helpers/functions/cursor";
import { WorkSheetHelper } from "../../helpers/workSheet";
import { logger } from "../../loaders/logger";
import { parseMatchDateRange } from "./commont";
export default [
  {
    method: "get",
    path: "/api/report/exportShopWalletTransaction",
    midd: [],
    action: async (req: Request, res: Response) => {
      const context = new Context({ req });
      validateJSON(req.query, {
        required: ["fromDate", "toDate"],
      });
      context.auth([ROLES.MEMBER]);

      const { walletId } = await MemberLoader.load(context.id);
      if (!walletId) {
        throw new Error("Thiếu thông tin ID ví");
      }

      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet("data");
      const match = {
        walletId: Types.ObjectId(walletId),
        createdAt: parseMatchDateRange(req.query),
      };
      await fillData(sheet, match, (error) => {
        if (error) {
          throw error;
        }
        const helper = new WorkSheetHelper(sheet);
        helper.autoSize();
        return UtilsHelper.responseExcel(res, workbook, "bao cao tien ra tien vao");
      });
    },
  },
];

async function fillData(sheet: Worksheet, match: any, completed: (error?: any) => any) {
  sheet.columns = [
    { header: "Ngày giao dịch", key: "createdAt" },
    { header: "Mã giao dịch", key: "code" },
    { header: "Loại giao dịch", key: "type" },
    { header: "Ghi chú", key: "note" },
    { header: "Số tiền", key: "amount" },
  ];

  const batchAsync = new BatchAsync(async (items: IWalletTransaction[]) => {
    logger.info(`batching `, items.length);
    sheet.addRows(
      items.map((walletTransaction) => {
        return {
          createdAt: moment(walletTransaction.createdAt).format("HH:mm DD/MM/YYYY"),
          code: walletTransaction.code,
          type: getWalletTransactionType(walletTransaction.type),
          note: walletTransaction.note,
          amount: walletTransaction.amount,
        };
      })
    );
  });

  const cursor = WalletTransactionModel.aggregate([
    {
      $match: match,
    },
  ])
    .cursor({})
    .exec();

  cursor.on("data", (data: any) => {
    batchAsync.feed(data);
  });

  cursor.on("error", (error: any) => {
    completed(error);
  });

  batchAsync.on("completed", () => {
    completed();
  });

  await waitForCursor(cursor);
  await cursor.close();
  batchAsync.complete();
}

function getWalletTransactionType(type: string) {
  switch (type) {
    case WalletTransactionType.DEPOSIT:
      return "Nạp tiền";
    case WalletTransactionType.WITHDRAW:
      return "Rút tiền";
    case WalletTransactionType.ADJUST:
      return "Điều chỉnh";
    case WalletTransactionType.TRANSFER:
      return "Chuyển Khoản";
    case WalletTransactionType.RECEIVE:
      return "Nhận tiền";
    default:
      return "";
  }
}
