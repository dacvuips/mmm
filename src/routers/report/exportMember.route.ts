import DataLoader from "dataloader";
import { promises } from "dns";
import Excel, { Worksheet } from "exceljs";
import { Request, Response } from "express";
import _ from "lodash";
import moment from "moment";
import { Types } from "mongoose";
import { BatchAsync } from "throttle-batch-size";
import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { IMember, MemberLoader, MemberModel } from "../../graphql/modules/member/member.model";
import { memberService } from "../../graphql/modules/member/member.service";
import {
  IMemberGroup,
  MemberGroupLoader,
  MemberGroupModel,
} from "../../graphql/modules/member/memberGroup/memberGroup.model";
import { memberGroupService } from "../../graphql/modules/member/memberGroup/memberGroup.service";
import { Plan } from "../../graphql/modules/subscription/subscription.model";
import { WalletLoader, WalletModel } from "../../graphql/modules/wallet/wallet.model";
import {
  IWalletTransaction,
  WalletTransactionModel,
  WalletTransactionType,
} from "../../graphql/modules/wallet/walletTransaction/walletTransaction.model";
import { UtilsHelper, validateJSON } from "../../helpers";
import { waitForCursor } from "../../helpers/functions/cursor";
import { ttlCache } from "../../helpers/ttlCache";
import { WorkSheetHelper } from "../../helpers/workSheet";
import { logger } from "../../loaders/logger";
import { parseMatchDateRange } from "./commont";
export default [
  {
    method: "get",
    path: "/api/report/exportMember",
    midd: [],
    action: async (req: Request, res: Response) => {
      const context = new Context({ req });
      validateJSON(req.query, {
        required: ["all", "status", "plan"],
      });
      context.auth(ROLES.ADMIN_EDITOR);

      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet("data");

      const all = req.query.all;
      const status = req.query.status.toString();
      const plan = req.query.plan.toString();
      const match = getMatchAndFilter(all, status, plan);

      await fillData(sheet, match, (error) => {
        if (error) {
          throw error;
        }
        const helper = new WorkSheetHelper(sheet);
        helper.autoSize();

        setTitleForWorkSheet(sheet);

        return UtilsHelper.responseExcel(res, workbook, "bao cao danh sach cua hang");
      });
    },
  },
];

async function fillData(sheet: Worksheet, match: any, completed: (error?: any) => any) {
  styleForHeader(sheet);

  sheet.columns = [
    {
      key: "ordinal",
    },
    {
      key: "shopName",
    },
    {
      key: "name",
    },
    {
      key: "phone",
    },
    {
      key: "email",
    },
    {
      key: "address",
    },
    {
      key: "status",
    },
    {
      key: "wallet",
    },
    {
      key: "type",
    },
    {
      key: "expiredAt",
    },
    {
      key: "createdAt",
    },
    {
      key: "memberGroupType",
    },
  ];

  let index = 0;

  const batchAsync = new BatchAsync(async (items: IMember[]) => {
    console.log("length", items.length);
    const [memberGroup, wallet] = await Promise.all([fetchMemberGroup(items), fetchWallet(items)]);
    sheet.addRows(
      items.map((member) => {
        index += 1;
        return {
          ordinal: index,
          shopName: member.shopName,
          name: member.name,
          phone: member.phone,
          email: member.username,
          address: member.address,
          status: getStatus(member.activated),
          wallet: _.get(wallet, `${member.walletId}.balance`, 0),
          type: getType(member.subscription.plan),
          expiredAt: moment(member.subscription.expiredAt).format("HH:mm DD/MM/YYYY"),
          createdAt: moment(member.createdAt).format("HH:mm DD/MM/YYYY"),
          memberGroupType: _.get(memberGroup, `${member.memberGroupId}.name`, ""),
        };
      })
    );
  });

  const cursor = MemberModel.aggregate([
    {
      $match: match,
    },
  ])
    .cursor({ batchSize: 5 })
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

function fetchMemberGroup(members: IMember[]) {
  return MemberGroupModel.aggregate([
    {
      $match: {
        memberGroupId: { $in: members.map((member) => member.memberGroupId) },
      },
    },
    {
      $project: {
        _id: "$_id",
        name: "$name",
      },
    },
  ]).then((list) => {
    const keyById = _.keyBy(list, "_id");
    return keyById;
  });
}
function fetchWallet(members: IMember[]) {
  return WalletModel.aggregate([
    {
      $match: {
        _id: { $in: members.map((member) => member.walletId) },
      },
    },
    {
      $project: {
        _id: "$_id",
        balance: "$balance",
      },
    },
  ]).then((list) => {
    const keyById = _.keyBy(list, "_id");
    return keyById;
  });
}
function getStatus(activated: boolean) {
  if (activated) {
    return "Hoạt động";
  }
  return "Đóng cửa";
}
// Lấy gói dịch vụ
function getType(type: string) {
  switch (type) {
    case Plan.FREE:
      return "Gói Miễn Phí";
    case Plan.BASIC:
      return "Gói Cơ Bản";
    case Plan.PROFESSIONAL:
      return "Gói Chuyên Nghiệp";
    case Plan.YEAR:
      return "Gói Năm";
    case Plan.MONTH:
      return "Gói Tháng";
    default:
      return "";
  }
}
export enum exportMemberType {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  NONACTIVE = "NONACTIVE",
  FREE = "FREE",
  PAY = "PAY",
  EXPIRED30 = "EXPIRED30",
}
function getMatchAndFilter(all: any, status: string, plan: string) {
  let match: any = {};
  if (all === "TRUE" || (status === "NONE" && plan === "NONE")) {
    return match;
  }

  match = matchPlan(plan);

  match.activated = matchStatus(status);

  return match;
}

function matchStatus(status: string) {
  switch (status) {
    case exportMemberType.ACTIVE:
      return true;
    case exportMemberType.NONACTIVE:
      return false;
    default:
      return true;
  }
}

function matchPlan(plan: string) {
  let match: any = {};
  switch (plan) {
    case exportMemberType.FREE:
      return (match = {
        "subscription.plan": Plan.FREE,
      });
    case exportMemberType.PAY:
      return (match = {
        "subscription.plan": { $in: [Plan.BASIC, Plan.PROFESSIONAL, Plan.YEAR, Plan.MONTH] },
      });
    case exportMemberType.EXPIRED30:
      return (match = {
        "subscription.expiredAt": { $lte: moment().add(30, "days").toDate() },
      });
    default:
      return {};
  }
}

function styleForHeader(sheet: Worksheet) {
  sheet.getRow(2).font = {
    bold: true,
  };
  sheet.getRow(2).values = [
    "STT",
    "Cửa hàng",
    "Người đại diện",
    "Số điện thoại",
    "Email",
    "Địa chỉ",
    "Trạng thái",
    "Số dư",
    "Gói dịch vụ",
    "Ngày hết hạn",
    "Ngày tạo",
    "Nhóm cửa hàng",
  ];
}

function setTitleForWorkSheet(sheet: Worksheet) {
  sheet.mergeCells("A1:L1");
  sheet.getCell("A1").value = `Danh sách cửa hàng`;
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.getCell("A1").font = {
    bold: true,
  };
}
