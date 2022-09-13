import Excel from "exceljs";
import { Request, Response } from "express";
import { get, keyBy, set } from "lodash";
import moment from "moment-timezone";
import { Types } from "mongoose";
import { ROLES } from "../../constants/role.const";

import { Context } from "../../graphql/context";
import { CustomerModel } from "../../graphql/modules/customer/customer.model";
import { OrderModel } from "../../graphql/modules/order/order.model";
import { IOrderItem } from "../../graphql/modules/orderItem/orderItem.model";
import { ShopBranchModel } from "../../graphql/modules/shop/shopBranch/shopBranch.model";
import { UtilsHelper, validateJSON } from "../../helpers";
import { WorkSheetHelper } from "../../helpers/workSheet";

export default [
  {
    method: "get",
    path: "/api/report/exportOrder",
    midd: [],
    action: async (req: Request, res: Response) => {
      const context = new Context({ req });
      validateJSON(req.query, {
        required: ["fromDate", "toDate"],
      });
      context.auth([ROLES.MEMBER, ROLES.STAFF]);

      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet("data");
      setHeader(sheet);

      const { fromDate, toDate, filter, filterBy = "loggedAt" } = req.query as any;

      const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate);
      let match = {
        fromMemberId: Types.ObjectId(context.sellerId),
        [filterBy]: { $gte, $lte },
      };
      if (filter) {
        try {
          const parseFilter = JSON.parse(Buffer.from(filter, "base64").toString("utf8"));
          if (parseFilter.shopBranchId) {
            parseFilter.shopBranchId = Types.ObjectId(parseFilter.shopBranchId);
          }
          match = {
            ...match,
            ...parseFilter,
          };
        } catch (err) {}
      }
      const query = [
        { $match: { ...match } },
        {
          $lookup: { from: "orderitems", localField: "itemIds", foreignField: "_id", as: "items" },
        },
      ];

      const orders = await OrderModel.aggregate(query);

      const [customers, shopBranchs] = await Promise.all([
        CustomerModel.find({ _id: { $in: orders.map((o) => o.buyerId) } })
          .select("_id name phone")
          .then((res) => keyBy(res, "_id")),
        ShopBranchModel.find({ _id: { $in: orders.map((o) => o.shopBranchId) } })
          .select("_id name")
          .then((res) => keyBy(res, "_id")),
      ]);
      for (const o of orders) {
        const c = customers[o.buyerId];
        const sb = shopBranchs[o.shopBranchId];
        const itemText = o.items
          .map((i: IOrderItem) => {
            let line = `${i.productName} (${i.qty})`;
            if (i.toppings?.length > 0) {
              line += ": " + i.toppings.map((t) => t.optionName).join(", ");
            }
            return line;
          })
          .join("\n");
        sheet.addRow([
          moment(o.createdAt).format("YYYY/MM/DD HH:mm"),
          moment(o.loggedAt).format("YYYY/MM/DD HH:mm"),
          get(sb, "name", ""),
          o.code,
          get(c, "name", ""),
          get(c, "phone", ""),
          itemText,
          o.itemCount,
          o.pickupMethod || "",
          o.shipMethod || "",
          o.paymentMethod || "",
          o.status,
          o.subtotal,
          o.shipfee,
          get(o, "deliveryInfo.partnerFee", 0),
          o.discountDetail,
          o.discount,
          o.amount,
        ]);
      }

      new WorkSheetHelper(sheet).autoSize();
      sheet.getColumn("G").alignment = { wrapText: true };
      sheet.getColumn("G").width = 100;
      UtilsHelper.responseExcel(res, workbook, "danh sach don hang");
    },
  },
];

function setHeader(sheet: Excel.Worksheet) {
  sheet.addRow([
    "Ngày tạo",
    "Ngày cập nhật",
    "Chi nhánh",
    "Mã đơn",
    "Tên KH",
    "SĐT",
    "Nội dung đơn hàng",
    "Số lượng món",
    "Hình thức láy hàng",
    "Đơn vị GH",
    "Thanh toán",
    "Trạng thái",
    "Tiền hàng",
    "Phí ship",
    "Phí ship Đối tác",
    "Khuyến mãi",
    "Giảm giá",
    "Thành tiền",
  ]);
}
