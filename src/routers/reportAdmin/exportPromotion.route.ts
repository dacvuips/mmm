import Excel from "exceljs";
import { Request, Response } from "express";
import _, { keyBy } from "lodash";
import moment from "moment-timezone";

import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { CustomerModel } from "../../graphql/modules/customer/customer.model";
import { OrderModel, OrderStatus } from "../../graphql/modules/order/order.model";
import { ShopVoucherModel } from "../../graphql/modules/shop/shopVoucher/shopVoucher.model";
import { UtilsHelper } from "../../helpers";
import { WorkSheetHelper } from "../../helpers/workSheet";
import { ReportAdminRouter } from "./common";

export default [
  {
    method: "get",
    path: "/api/reportAdmin/exportPromotion",
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
      const discountStats = await getDiscountStats(data);
      const cursor = ShopVoucherModel.aggregate([
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
            createdAt: 1,
            code: 1,
            description: 1,
            type: 1,
            isActive: 1,
            startDate: 1,
            endDate: 1,
            issueNumber: 1,
            issueByDate: 1,
            useLimit: 1,
            useLimitByDate: 1,
            minSubtotal: 1,
            minItemQty: 1,
            isPrivate: 1,
            isPersonal: 1,
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
        const stats = discountStats[c._id] || { order: 0, discount: 0 };
        sheet.addRow([
          c.shopCode,
          c.shopName,
          moment(c.createdAt).format("YYYY/MM/DD HH:mm"),
          c.code || "",
          c.description || "",
          c.type || "",
          c.isActive ? "K??ch ho???t" : "",
          c.startDate ? moment(c.startDate).format("YYYY/MM/DD") : "",
          c.endDate ? moment(c.endDate).format("YYYY/MM/DD") : "",
          c.issueNumber,
          c.issueByDate ? "TRUE" : "",
          c.useLimit,
          c.useLimitByDate ? "TRUE" : "",
          c.minSubtotal,
          c.minItemQty,
          c.isPrivate ? "TRUE" : "",
          c.isPersonal ? "TRUE" : "",
          stats.order,
          stats.discount,
        ]);
      }
      new WorkSheetHelper(sheet).autoSize();
      UtilsHelper.responseExcel(res, workbook, "danh sach khuyen mai");
    },
  },
];

function setHeader(sheet: Excel.Worksheet) {
  sheet.addRow([
    "M?? C???a h??ng",
    "C???a h??ng",
    "Ng??y t???o",
    "Khuy???n m??i",
    "M?? t???",
    "Lo???i",
    "Tr???ng th??i",
    "Ng??y b???t ?????u",
    "Ng??y k???t th??c",
    "S??? l?????ng ph??t h??nh",
    "Trong ng??y",
    "S??? l???n s??? d???ng",
    "Trong ng??y",
    "????n h??ng t???i thi???u",
    "S??? l?????ng t???i thi???u",
    "M?? ri??ng t??",
    "M?? qu?? t???ng",
    "???? s??? d???ng",
    "???? gi???m (VND)",
  ]);
}

async function getDiscountStats(data: any) {
  const {
    match: { dateRange, member },
  } = data;
  const match: any = {
    status: OrderStatus.COMPLETED,
    ...member,
  };
  if (!_.isEmpty(dateRange)) {
    match.loggedAt = dateRange;
  }
  return OrderModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$voucherId",
        order: { $sum: 1 },
        discount: { $sum: "$discount" },
      },
    },
  ]).then((list) => keyBy(list, "_id"));
}
