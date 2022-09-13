import Excel from "exceljs";
import { Request, Response } from "express";
import _, { get } from "lodash";
import moment from "moment-timezone";

import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { CustomerModel } from "../../graphql/modules/customer/customer.model";
import { MemberModel } from "../../graphql/modules/member/member.model";
import { OrderModel, OrderStatus } from "../../graphql/modules/order/order.model";
import { IOrderItem } from "../../graphql/modules/orderItem/orderItem.model";
import { ShopBranchModel } from "../../graphql/modules/shop/shopBranch/shopBranch.model";
import { UtilsHelper, validateJSON } from "../../helpers";
import { WorkSheetHelper } from "../../helpers/workSheet";
import { ReportAdminRouter } from "./common";
export default [
  {
    method: "get",
    path: "/api/reportAdmin/exportOrder",
    midd: [],
    action: async (req: Request, res: Response) => {
      const context = new Context({ req });
      context.auth(ROLES.ADMIN_EDITOR);
      validateJSON(req.query, {
        required: ["fromDate", "toDate"],
      });
      const data: any = {
        filter: req.query,
      };
      ReportAdminRouter.parseMatch(data);
      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet("data");
      setHeader(sheet);
      const {
        match: { dateRange, fromMember },
      } = data;
      const orders = await OrderModel.aggregate([
        { $match: { loggedAt: dateRange, ...fromMember } },
        {
          $lookup: { from: "orderitems", localField: "itemIds", foreignField: "_id", as: "items" },
        },
      ]);
      const [customers, shopBranchs, shops] = await Promise.all([
        CustomerModel.find({ _id: { $in: orders.map((o) => o.buyerId) } })
          .select("_id name phone")
          .then((res) => _.keyBy(res, "_id")),
        ShopBranchModel.find({ _id: { $in: orders.map((o) => o.shopBranchId) } })
          .select("_id name")
          .then((res) => _.keyBy(res, "_id")),
        MemberModel.find({ _id: { $in: orders.map((o) => o.fromMemberId) } })
          .select("_id code shopName")
          .then((res) => _.keyBy(res, "_id")),
      ]);
      for (const o of orders) {
        const c = customers[o.buyerId];
        const sb = shopBranchs[o.shopBranchId];
        const s = shops[o.fromMemberId];
        const itemText = o.items
          .map((i: IOrderItem) => {
            let line = `${i.productName} (${i.qty})`;
            i.toppings = i.toppings ? i.toppings : [];
            if (i.toppings.length > 0) {
              line += ": " + i.toppings.map((t) => t.optionName).join(", ");
            }
            return line;
          })
          .join("\n");
        sheet.addRow([
          s.code,
          s.shopName,
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
      sheet.getColumn("I").alignment = { wrapText: true };
      sheet.getColumn("I").width = 100;
      UtilsHelper.responseExcel(res, workbook, "danh sach don hang");
    },
  },
];

function setHeader(sheet: Excel.Worksheet) {
  sheet.addRow([
    "Mã Cửa hàng",
    "Cửa hàng",
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
