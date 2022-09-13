import Excel from "exceljs";
import { Request, Response } from "express";
import _, { get } from "lodash";
import moment from "moment-timezone";

import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { CustomerModel } from "../../graphql/modules/customer/customer.model";
import { UtilsHelper } from "../../helpers";
import { WorkSheetHelper } from "../../helpers/workSheet";
import { ReportAdminRouter } from "./common";

export default [
  {
    method: "get",
    path: "/api/reportAdmin/exportCustomer",
    midd: [],
    action: async (req: Request, res: Response) => {
      const context = new Context({ req });
      context.auth(ROLES.ADMIN_EDITOR);
      const data: any = {
        filter: req.query,
      };
      ReportAdminRouter.parseMatch(data);
      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet("data");
      setHeader(sheet);
      const cursor = CustomerModel.aggregate([
        { $match: { ...data.match.combined } },
        {
          $lookup: {
            from: "members",
            localField: "memberId",
            foreignField: "_id",
            as: "m",
          },
        },
        { $unwind: "$m" },
        {
          $project: {
            _id: 1,
            name: 1,
            phone: 1,
            fullAddress: 1,
            context: 1,
            createdAt: 1,
            shopCode: "$m.code",
            shopName: "$m.shopName",
          },
        },
        { $sort: { shopCode: 1, _id: 1 } },
      ])
        .cursor({ batchSize: 1000 })
        .exec();

      let c;
      while ((c = await cursor.next())) {
        sheet.addRow([
          c.shopCode,
          c.shopName,
          moment(c.createdAt).format("YYYY/MM/DD HH:mm"),
          c.name || "",
          c.phone || "",
          c.fullAddress || "",
          get(c, "context.order", 0),
          get(c, "context.completed", 0),
          get(c, "context.canceled", 0),
          get(c, "context.voucher", 0),
          get(c, "context.discount", 0),
          get(c, "context.revenue", 0),
        ]);
      }
      new WorkSheetHelper(sheet).autoSize();
      UtilsHelper.responseExcel(res, workbook, "danh sach khach hang");
    },
  },
];

function setHeader(sheet: Excel.Worksheet) {
  sheet.addRow([
    "Mã Cửa hàng",
    "Cửa hàng",
    "Ngày tạo",
    "Tên KH",
    "SĐT",
    "Địa chỉ",
    "Tổng đơn",
    "Hoàn thành",
    "Huỷ",
    "Voucher SD",
    "Giảm giá",
    "Doanh số",
  ]);
}
