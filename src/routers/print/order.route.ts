import { Request, Response } from "express";
import _ from "lodash";
import moment from "moment-timezone";

import { BaseError } from "../../base/error";
import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { MemberModel } from "../../graphql/modules/member/member.model";
import { OrderModel } from "../../graphql/modules/order/order.model";
import { OrderItemModel } from "../../graphql/modules/orderItem/orderItem.model";
import { ShopBranchModel } from "../../graphql/modules/shop/shopBranch/shopBranch.model";
import { UtilsHelper } from "../../helpers";
import pdfPrinter from "../../helpers/pdfPrinter";
import { PrintCommon } from "./common";

const dividerCell = PrintCommon.dividerCell;

export default [
  {
    method: "get",
    path: "/api/print/order/:orderId",
    midd: [],
    action: async (req: Request, res: Response) => {
      const context = new Context({ req });
      context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);

      const { orderId } = req.params;

      const ctx: PrintCommon.PrintContext = {
        input: { orderId },
        meta: {},
      };

      await getOrder(ctx);
      await getShopInfo(ctx);
      await initPDFContent(ctx);
      await buildHeader(ctx);
      await buildInfoSection(ctx);
      await buildTableHeader(ctx);
      await buildTableBody(ctx);
      await buildSummary(ctx);

      return pdfPrinter.responsePDF(res, ctx.meta.pdf, {
        filename: "order-" + ctx.meta.order.code,
        download: false,
      });
    },
  },
];

async function buildSummary(ctx: PrintCommon.PrintContext) {
  const {
    meta: {
      pdf,
      order: { subtotal, amount, shipDistance, shipfee, discount, paymentMethod },
    },
  } = ctx;

  pdf.content.push({
    stack: [
      {
        columns: [
          {},
          {
            alignment: "right",
            width: 200,
            table: {
              widths: ["*", "*"],
              body: [
                [
                  { text: "Tiền hàng", alignment: "left", bold: true },
                  { text: `${UtilsHelper.toMoney(subtotal)}đ`, alignment: "right", bold: true },
                ],
                [
                  {
                    text: `Phí ship (${shipDistance.toFixed(1)} km)`,
                    alignment: "left",
                    bold: true,
                  },
                  { text: `${UtilsHelper.toMoney(shipfee)}đ`, alignment: "right", bold: true },
                ],
                // Nếu có giảm giá thì hiển thêm giảm giá
                ...(discount > 0
                  ? [
                      { text: "Giảm giá", alignment: "left", bold: true },
                      { text: `${UtilsHelper.toMoney(discount)}đ`, alignment: "right", bold: true },
                    ]
                  : []),
                [dividerCell({ colSpan: 2, color: "red", width: 2 })],
                [
                  { text: "Tổng tiền", alignment: "left", bold: true },
                  { text: `${UtilsHelper.toMoney(amount)}đ`, alignment: "right", bold: true },
                ],
                [
                  { text: "Thanh toán", alignment: "left", bold: true },
                  { text: paymentMethod, alignment: "right", bold: true },
                ],
              ],
            },
            layout: "noBorders",
          },
        ],
      },
    ],
    unbreakable: true,
    margin: [0, 10],
  });
}

async function buildTableBody(ctx: PrintCommon.PrintContext) {
  const {
    meta: { pdf, orderItems },
  } = ctx;

  // Table header
  pdf.content.push({
    alignment: "center",
    table: {
      widths: [30, "*", 25, 100, 100],
      body: [
        ...orderItems.map(
          ({ productName, qty, basePrice, toppingAmount, amount, toppings }, index) => {
            const toppingNames = toppings.map((t) => t.optionName).join(", ");
            return [
              index + 1,
              { text: productName + " " + toppingNames, alignment: "left" },
              qty.toString(),
              { text: `${UtilsHelper.toMoney(basePrice + toppingAmount)}đ`, alignment: "right" },
              { text: `${UtilsHelper.toMoney(amount)}đ`, alignment: "right" },
            ];
          }
        ),
      ],
    },
  });
}

async function buildTableHeader(ctx: PrintCommon.PrintContext) {
  const {
    meta: { pdf },
  } = ctx;

  // Table header
  pdf.content.push({
    alignment: "center",
    table: {
      widths: [30, "*", 30, 100, 100],

      body: [
        [
          "STT",
          { text: "Sản phẩm", alignment: "left" },
          "SL",
          { text: "Giá", alignment: "right" },
          { text: "THÀNH TIỀN", alignment: "right" },
        ],
      ],
    },
    layout: {
      hLineWidth: function (i: any, node: any) {
        return i === 0 ? 2 : 0;
      },
      vLineWidth: function (i: any, node: any) {
        return 0;
      },
      hLineColor: function (i: any, node: any) {
        return "red";
      },
      paddingTop: function (i: any, node: any) {
        return 5;
      },
    },
  });
}

async function buildInfoSection(ctx: PrintCommon.PrintContext) {
  const {
    meta: {
      pdf,
      seller: { shopName },
      shopBranch: { name: shopBranchName, address: shopBranchAddress },
      order: { buyerName, buyerPhone, buyerFullAddress, note },
    },
  } = ctx;

  pdf.content.push({
    stack: [
      {
        layout: "noBorders",
        table: {
          widths: [100, "*"],
          body: [
            [{ text: "Cửa hàng" }, { text: `${shopName} - ${shopBranchName}` }],
            [{ text: "Địa chỉ" }, { text: shopBranchAddress }],
            [{ text: "Khách hàng" }, { text: `${buyerName} - ${buyerPhone}`, bold: true }],
            [
              { text: "Giao tới" },
              {
                text: buyerFullAddress,
              },
            ],
            [{ text: "Ghi chú" }, { text: _.isEmpty(note) == false ? note : "Không có" }],
          ],
        },
      },
    ],
    unbreakable: true,
    margin: [0, 20],
  });
}

async function buildHeader(ctx: PrintCommon.PrintContext) {
  const {
    meta: {
      seller,
      pdf,
      order: { code: orderCode, loggedAt },
    },
  } = ctx;

  // Chuyển logo thành base64
  pdf.images.logo = await PrintCommon.getImageBase64FromUrl(seller.shopLogo);

  pdf.content.push({
    stack: [
      {
        alignment: "justify",
        columns: [
          { alignment: "center", stack: [{ image: "logo", fit: [160, 90] }] },
          {
            layout: "noBorders",
            alignment: "right",
            width: 200,
            table: {
              widths: [60, "*"],
              body: [
                [{ colSpan: 2, text: "ĐƠN HÀNG", style: "textLg" }, ""],
                [
                  { text: "Mã đơn", alignment: "left" },
                  { text: orderCode, alignment: "right", bold: true },
                ],
                [
                  { text: "Ngày tạo", alignment: "left" },
                  {
                    text: moment(loggedAt).format("YYYY-MM-DD HH:mm"),
                    alignment: "right",
                    bold: true,
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
    unbreakable: true,
  });
}

async function initPDFContent(ctx: any) {
  const content: any = {
    content: [],
    styles: {
      textLg: {
        fontSize: 14,
        bold: true,
      },
      tag: {
        bold: true,
        alignment: "center",
        margin: [0, 5],
        color: "white",
      },
      cellH1: {
        fillColor: "red",
        color: "white",
        bold: true,
      },
      cellH2: {
        fillColor: "#C5D9F1",
        bold: true,
      },
    },
    defaultStyle: {
      fontSize: 11,
    },
    images: {},
  };

  ctx.meta.pdf = content;
}

async function getShopInfo(ctx: PrintCommon.PrintContext) {
  const {
    meta: {
      order: { fromMemberId, shopBranchId },
    },
  } = ctx;
  const seller = await MemberModel.findById(fromMemberId);
  const shopBranch = await ShopBranchModel.findById(shopBranchId);

  ctx.meta.seller = seller;
  ctx.meta.shopBranch = shopBranch;
}

async function getOrder(ctx: any) {
  const {
    input: { orderId },
  } = ctx;

  const order = await OrderModel.findById(orderId);
  if (_.isEmpty(order) == true) throw new BaseError(404, `print-order-error`, `Không có đơn hàng`);
  const orderItems = await OrderItemModel.find({ orderId });

  ctx.meta = {
    ...ctx.meta,
    order,
    orderItems,
  };
}
