import { BaseRoute, Request, Response, NextFunction } from "../../../base/baseRoute";
import { ROLES } from "../../../constants/role.const";
import { Context } from "../../../graphql/context";
import { auth } from "../../../middleware/auth";
import Excel from "exceljs";
import { UtilsHelper } from "../../../helpers";
import { MemberModel, MemberType } from "../../../graphql/modules/member/member.model";
import { ObjectId } from "mongodb";
import {
  CommissionLogModel,
  CommissionLogType,
  ICommissionLog,
} from "../../../graphql/modules/commissionLog/commissionLog.model";
import { BranchModel } from "../../../graphql/modules/branch/branch.model";
import { isValidObjectId, Types } from "mongoose";
import { ErrorHelper } from "../../../base/error";
import { get, isEmpty, set } from "lodash";
import { OrderLogModel } from "../../../graphql/modules/orderLog/orderLog.model";
import { CollaboratorModel } from "../../../graphql/modules/collaborator/collaborator.model";
import { CustomerModel } from "../../../graphql/modules/customer/customer.model";
import moment from "moment";

const STT = "STT";
const RESULT_IMPORT_FILE_NAME = "ket_qua_import_buu_cuc";
const SHEET_NAME = "Sheet1";

export const exportPortReport = async (req: Request, res: Response) => {
  const context = (req as any).context as Context;
  context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);

  let fromDate: string = req.query.fromDate ? req.query.fromDate.toString() : null;
  let toDate: string = req.query.toDate ? req.query.toDate.toString() : null;

  const memberId: string = req.query.memberId ? req.query.memberId.toString() : "";

  if (!isEmpty(memberId)) {
    if (!isValidObjectId(memberId)) {
      throw ErrorHelper.requestDataInvalid("Mã cửa hàng");
    }
  }

  const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate);

  const $match: any = {};
  const $memberMatch: any = { type: MemberType.BRANCH, activated: true };

  if ($gte) {
    set($match, "createdAt.$gte", $gte);
  }

  if ($lte) {
    set($match, "createdAt.$lte", $lte);
  }

  if (memberId) {
    set($memberMatch, "_id", new ObjectId(memberId));
  }

  if (context.isMember()) {
    set($memberMatch, "_id", new ObjectId(memberId));
  }

  const members = await MemberModel.aggregate([
    {
      $match: {
        ...$memberMatch,
        activated: true,
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branchId",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: "$branch" },
    {
      $project: {
        _id: 1,
        code: 1,
        shopName: 1,
        district: 1,
        branchCode: "$branch.code",
        branchName: "$branch.name",
        lastLoginDate: 1,
        fanpageId: 1,
      },
    },
  ]);

  // console.log('members', members);

  const memberIds = members.map((member) => member._id).map(Types.ObjectId);

  let data: any = [];
  let staticsticData: any = [];
  const branchesData = [];

  const [orderStats, collaboratorsStats, branches] = await Promise.all([
    OrderLogModel.aggregate([
      {
        $match: {
          memberId: { $in: memberIds },
          ...$match,
        },
      },
      {
        $group: {
          _id: "$orderId",
          memberId: { $first: "$memberId" },
          log: { $last: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $group: {
          _id: "$memberId",
          ordersCount: { $sum: 1 },
          pendingCount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "PENDING"] }, 1, 0] } },
          confirmedCount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "CONFIRMED"] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "COMPLETED"] }, 1, 0] } },
          deliveringCount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "DELIVERING"] }, 1, 0] } },
          canceledCount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "CANCELED"] }, 1, 0] } },
          failureCount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "FAILURE"] }, 1, 0] } },

          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$log.orderStatus", "PENDING"] }, "$order.amount", 0] },
          },
          confirmedAmount: {
            $sum: { $cond: [{ $eq: ["$log.orderStatus", "CONFIRMED"] }, "$order.amount", 0] },
          },
          deliveringAmount: {
            $sum: { $cond: [{ $eq: ["$log.orderStatus", "DELIVERING"] }, "$order.amount", 0] },
          },
          canceledAmount: {
            $sum: { $cond: [{ $eq: ["$log.orderStatus", "CANCELED"] }, "$order.amount", 0] },
          },
          failureAmount: {
            $sum: { $cond: [{ $eq: ["$log.orderStatus", "FAILURE"] }, "$order.amount", 0] },
          },
          // estimatedIncome: { $sum: { $cond: [{ $in: ["$log.orderStatus", ["CANCELED", "FAILURE", "COMPLETED"]] }, 0, "$order.amount"] } },
          income: {
            $sum: { $cond: [{ $eq: ["$log.orderStatus", "COMPLETED"] }, "$order.amount", 0] },
          },

          pendingCommission: {
            $sum: {
              $cond: [
                { $eq: ["$log.orderStatus", "PENDING"] },
                { $sum: ["$order.commission1", "$order.commission2", "$order.commission3"] },
                0,
              ],
            },
          },
          confirmedCommission: {
            $sum: {
              $cond: [
                { $eq: ["$log.orderStatus", "CONFIRMED"] },
                { $sum: ["$order.commission1", "$order.commission2", "$order.commission3"] },
                0,
              ],
            },
          },
          deliveringCommission: {
            $sum: {
              $cond: [
                { $eq: ["$log.orderStatus", "DELIVERING"] },
                { $sum: ["$order.commission1", "$order.commission2", "$order.commission3"] },
                0,
              ],
            },
          },
          canceledCommission: {
            $sum: {
              $cond: [
                { $eq: ["$log.orderStatus", "CANCELED"] },
                { $sum: ["$order.commission1", "$order.commission2", "$order.commission3"] },
                0,
              ],
            },
          },
          failureCommission: {
            $sum: {
              $cond: [
                { $eq: ["$log.orderStatus", "FAILURE"] },
                { $sum: ["$order.commission1", "$order.commission2", "$order.commission3"] },
                0,
              ],
            },
          },
          // estimatedCommission: { $sum: { $cond: [{ $in: ["$log.orderStatus", ["CANCELED", "FAILURE", "COMPLETED"]] }, 0, { $sum: ["$order.commission1", "$order.commission2", "$order.commission3"] }] } },
          realCommission: {
            $sum: {
              $cond: [
                { $eq: ["$log.orderStatus", "COMPLETED"] },
                { $sum: ["$order.commission1", "$order.commission2", "$order.commission3"] },
                0,
              ],
            },
          },
        },
      },
    ]),
    CollaboratorModel.aggregate([
      {
        $match: {
          memberId: { $in: memberIds },
          createdAt: {
            $lte,
          },
        },
      },
      {
        $group: {
          _id: "$memberId",
          collaboratorsCount: { $sum: 1 },
          customersAsCollaboratorCount: {
            $sum: { $cond: [{ $ne: ["$customerId", undefined] }, 1, 0] },
          },
        },
      },
    ]),
    BranchModel.find({}),
  ]);

  for (let i = 0; i < members.length; i++) {
    const member: any = members[i];
    const orderStat = orderStats.find((stats) => stats._id.toString() === member._id.toString());
    const collaboratorStat = collaboratorsStats.find(
      (stats) => stats._id.toString() === member._id.toString()
    );
    const customersCount = await CustomerModel.count({
      createdAt: {
        $lte,
      },
      pageAccounts: {
        $elemMatch: {
          memberId: member._id,
        },
      },
    });
    // console.log('orderStat',orderStat);
    const params = {
      code: member.code,
      shopName: member.shopName,
      district: member.district,
      branchCode: member.branchCode,
      branchName: member.branchName,
      customersCount,
      collaboratorsCount: collaboratorStat ? collaboratorStat.collaboratorsCount : 0,
      customersAsCollaboratorCount: collaboratorStat
        ? collaboratorStat.customersAsCollaboratorCount
        : 0,
      ordersCount: orderStat ? orderStat.ordersCount : 0,
      pendingCount: orderStat ? orderStat.pendingCount : 0,
      confirmedCount: orderStat ? orderStat.confirmedCount : 0,
      deliveringCount: orderStat ? orderStat.deliveringCount : 0,
      completedCount: orderStat ? orderStat.completedCount : 0,
      failureCount: orderStat ? orderStat.failureCount : 0,
      canceledCount: orderStat ? orderStat.canceledCount : 0,
      realCommission: orderStat ? orderStat.realCommission : 0,
      income: orderStat ? orderStat.income : 0,
      lastLoginDate: member.lastLoginDate ? member.lastLoginDate : "Chưa đăng nhập",
      connectFacebook: member.fanpageId ? "Có kết nối" : "Chưa kết nối",
    };

    // console.log('count', i);
    data.push(params);
  }

  const workbook = new Excel.Workbook();

  const createSheetData = (data: [], name: string) => {
    const sheet = workbook.addWorksheet(name);
    const excelHeaders = [
      STT,
      "Mã cửa hàng",
      "Cửa hàng",
      "Quận / Huyện",
      "Chi nhánh",
      "Số lượng Khách hàng",
      "Số lượng CTV",
      "Số lượng CTV - khách hàng",
      "Số lượng đơn hàng",
      "Đơn chờ",
      "Đơn xác nhận",
      "Đơn giao",
      "Đơn thành công",
      "Đơn thất bại",
      "Đơn đã huỷ",
      "Hoa hồng thực nhận",
      "Doanh thu thực nhận",
      "Thời gian đăng nhập",
      "Kết nối facebook",
    ];
    sheet.addRow(excelHeaders);

    data.forEach((d: any, i: number) => {
      // console.log('d.customersAsCollaboratorCount',d.customersAsCollaboratorCount);
      const dataRow = [
        i + 1, //STT
        d.code, //"Mã cửa hàng",
        d.shopName, // "Cửa hàng",
        d.district, //"Quận / Huyện",
        d.branchName, //"Chi nhánh",
        d.customersCount,
        d.collaboratorsCount,
        d.customersAsCollaboratorCount,
        d.ordersCount, //
        d.pendingCount,
        d.confirmedCount,
        d.deliveringCount,
        d.completedCount,
        d.failureCount,
        d.canceledCount,
        d.realCommission,
        d.income,
        d.lastLoginDate,
        d.connectFacebook,
      ];
      sheet.addRow(dataRow);
    });

    UtilsHelper.setThemeExcelWorkBook(sheet);

    const vnFromDate = moment(fromDate).format("DD-MM-YYYY");
    const vnToDate = moment(toDate).format("DD-MM-YYYY");
    const title = `Báo cáo cửa hàng ${vnFromDate} - ${vnToDate}`;
    UtilsHelper.setTitleExcelWorkBook(sheet, title);
  };

  const createStatisticSheetData = (data: [], name: string) => {
    const sheet = workbook.addWorksheet(name);
    const excelHeaders = [
      STT,
      "Cửa hàng",
      "Số lượng Khách hàng",
      "Số lượng CTV",
      "Số lượng CTV - khách hàng",
      "Số lượng đơn hàng",
      "Đơn chờ",
      "Đơn xác nhận",
      "Đơn giao",
      "Đơn thành công",
      "Đơn thất bại",
      "Đơn đã huỷ",
      "Hoa hồng thực nhận",
      "Doanh thu thực nhận",
    ];
    sheet.addRow(excelHeaders);

    data.forEach((d: any, i: number) => {
      const dataRow = [
        i + 1,
        d.name,
        d.customersCount,
        d.collaboratorsCount,
        d.customersAsCollaboratorCount,
        d.ordersCount,
        d.pendingCount,
        d.confirmedCount,
        d.deliveringCount,
        d.completedCount,
        d.failureCount,
        d.canceledCount,
        d.realCommission,
        d.income,
      ];
      sheet.addRow(dataRow);
    });

    UtilsHelper.setThemeExcelWorkBook(sheet);

    const vnFromDate = moment(fromDate).format("DD-MM-YYYY");
    const vnToDate = moment(toDate).format("DD-MM-YYYY");
    const title = `BÁO CÁO TỔNG QUAN CÁC KHU VỰC ${vnFromDate} - ${vnToDate}`;
    UtilsHelper.setTitleExcelWorkBook(sheet, title);
  };

  const sumAllData = (name: string, data: any[]) => {
    return {
      name: name,
      customersAsCollaboratorCount: data.reduce(
        (total: number, m: any) => (total += m.customersAsCollaboratorCount),
        0
      ),
      ordersCount: data.reduce((total: number, m: any) => (total += m.ordersCount), 0),
      pendingCount: data.reduce((total: number, m: any) => (total += m.pendingCount), 0),
      confirmedCount: data.reduce((total: number, m: any) => (total += m.confirmedCount), 0),
      deliveringCount: data.reduce((total: number, m: any) => (total += m.deliveringCount), 0),
      completedCount: data.reduce((total: number, m: any) => (total += m.completedCount), 0),
      failureCount: data.reduce((total: number, m: any) => (total += m.failureCount), 0),
      canceledCount: data.reduce((total: number, m: any) => (total += m.canceledCount), 0),
      estimatedCommission: data.reduce(
        (total: number, m: any) => (total += m.estimatedCommission),
        0
      ),
      realCommission: data.reduce((total: number, m: any) => (total += m.realCommission), 0),
      estimatedIncome: data.reduce((total: number, m: any) => (total += m.estimatedIncome), 0),
      income: data.reduce((total: number, m: any) => (total += m.income), 0),
    };
  };

  const POSTS_SHEET_NAME = "Danh sách Cửa hàng";
  createSheetData(data, POSTS_SHEET_NAME);

  if (!context.isMember() && isEmpty(memberId)) {
    for (const branch of branches) {
      const branchData = data.filter((m: any) => m.branchCode === branch.code);
      staticsticData.push(sumAllData(branch.name, branchData));
      branchesData.push({ name: branch.name, data: branchData });
    }
  }

  if (!context.isMember() && isEmpty(memberId)) {
    staticsticData.push(sumAllData("Tổng", data));
    createStatisticSheetData(staticsticData, "TH");

    for (const branchData of branchesData) {
      createSheetData(branchData.data, branchData.name);
    }
  }

  const vnFromDate = moment(fromDate).format("DD.MM.YYYY");
  const vnToDate = moment(toDate).format("DD.MM.YYYY");
  const fileName = `bao_cao_buu_cuc_${vnFromDate}_${vnToDate}`;
  return UtilsHelper.responseExcel(res, workbook, fileName);
};
