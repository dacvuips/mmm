import { ROLES } from "../../../constants/role.const";
import { BaseRoute, Request, Response, NextFunction } from "../../../base/baseRoute";
import { ErrorHelper } from "../../../base/error";
import { Context } from "../../../graphql/context";

import { auth } from "../../../middleware/auth";

import _, { isEmpty, reverse, set, sortBy } from "lodash";
import numeral from "numeral";
import { PrinterHelper } from "../../../helpers/printerHelper";
import {
  // getShipMethods,
  IOrder,
  OrderStatus,
  ShipMethod,
} from "../../../graphql/modules/order/order.model";
import { OrderModel } from "../../../graphql/modules/order/order.model";
import { AddressDeliveryModel } from "../../../graphql/modules/addressDelivery/addressDelivery.model";
import { MemberModel } from "../../../graphql/modules/member/member.model";
import { UtilsHelper } from "../../../helpers";
import Excel from "exceljs";
import { ObjectId } from "bson";
import moment from "moment";
import { AddressStorehouseModel } from "../../../graphql/modules/addressStorehouse/addressStorehouse.model";
import { BranchModel } from "../../../graphql/modules/branch/branch.model";
import { isValidObjectId, Types } from "mongoose";

export const exportOrdersReport = async (req: Request, res: Response) => {
  const context = (req as any).context as Context;
  context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);

  let data: any = [];
  let staticsticData: any = [];

  let fromDate: string = req.query.fromDate ? req.query.fromDate.toString() : null;
  let toDate: string = req.query.toDate ? req.query.toDate.toString() : null;
  const memberId: string = req.query.memberId ? req.query.memberId.toString() : null;
  const status: any = req.query.status ? req.query.status.toString() : null;

  if (status) {
    if (
      ![
        OrderStatus.PENDING,
        OrderStatus.FAILURE,
        OrderStatus.DELIVERING,
        OrderStatus.CONFIRMED,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELED,
        OrderStatus.RETURNED,
      ].includes(status)
    ) {
      throw ErrorHelper.requestDataInvalid("Tr???ng th??i ????n h??ng");
    }
  }

  const memberIdsString = req.query.memberIds ? req.query.memberIds.toString() : null;
  let memberIds: any = null;
  if (memberIdsString) {
    memberIds = memberIdsString.split("|");
    if (memberIds.length < 0) throw ErrorHelper.requestDataInvalid("M?? c???a h??ng");

    memberIds.map((m: string) => {
      if (!isValidObjectId(m)) {
        throw ErrorHelper.requestDataInvalid("M?? c???a h??ng");
      }
    });

    memberIds = memberIds.map(Types.ObjectId);
  }

  if (!isValidObjectId(memberId)) {
    throw ErrorHelper.requestDataInvalid("M?? c???a h??ng");
  }

  const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate);

  const params: any = {};

  if ($gte) {
    set(params, "createdAt.$gte", $gte);
  }

  if ($lte) {
    set(params, "createdAt.$lte", $lte);
  }

  if (memberIds) {
    set(params, "sellerId.$in", memberIds);
  } else {
    if (memberId) {
      set(params, "sellerId", new ObjectId(memberId));
    }
  }

  if (context.isMember() || context.isStaff()) {
    set(params, "sellerId", new ObjectId(context.sellerId));
  }

  if (status) {
    set(params, "status", status);
  }

  // console.log('params', params);

  const [orders, addressDeliverys, addressStorehouses, sellers, branches] = await Promise.all([
    OrderModel.find(params),
    AddressDeliveryModel.find({}),
    AddressStorehouseModel.find({}),
    MemberModel.find({ activated: true }).select(
      "-addressStorehouseIds -addressDeliveryIds -fanpageImage -fanpageName"
    ),
    BranchModel.find({}),
  ]);

  const statusText = (order: any) => {
    switch (order.status) {
      case OrderStatus.PENDING:
        return `Ch??? duy???t`;
      case OrderStatus.CONFIRMED:
        return `X??c nh???n`;
      case OrderStatus.DELIVERING:
        return `??ang giao`;
      case OrderStatus.COMPLETED:
        return `Ho??n th??nh`;
      case OrderStatus.FAILURE:
        return `Th???t b???i`;
      case OrderStatus.CANCELED:
        return `???? hu???`;
      case OrderStatus.RETURNED:
        return `???? ho??n h??ng`;
      default:
        return order.status;
    }
  };

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const shipMethod =
      order.shipMethod === ShipMethod.POST ? "Nh???n h??ng t???i c???a h??ng" : "Giao h??ng t???i ?????a ch???";
    const seller = sellers.find((member) => member.id.toString() === order.sellerId.toString());
    const addressDelivery = order.addressDeliveryId
      ? addressDeliverys.find((addr) => addr.id.toString() === order.addressDeliveryId.toString())
      : null;
    const addressStorehouse = order.addressStorehouseId
      ? addressStorehouses.find(
          (addr) => addr.id.toString() === order.addressStorehouseId.toString()
        )
      : null;

    const deliveryAddressCode = addressDelivery ? addressDelivery.code : null;
    const deliveryAddressName = addressDelivery ? addressDelivery.name : null;
    const deliveryAddress = addressDelivery ? addressDelivery.address : null;

    const storehouseAddressCode = addressStorehouse ? addressStorehouse.code : null;
    const storehouseAddressName = addressStorehouse ? addressStorehouse.name : null;
    const storehouseAddress = addressStorehouse ? addressStorehouse.address : null;

    const buyerAddress = order.buyerAddress;
    const branch = branches.find((br) => br.id.toString() === seller.branchId.toString());
    const createdDate = moment(order.createdAt);
    const finishedDate = order.finishedAt ? moment(order.finishedAt) : null;
    const toDate = moment(new Date());
    const orderDuration = order.isLate
      ? [OrderStatus.COMPLETED, OrderStatus.CANCELED, OrderStatus.FAILURE].includes(order.status)
        ? moment.duration(finishedDate.diff(createdDate))
        : moment.duration(toDate.diff(createdDate))
      : null;
    const remainTime = orderDuration
      ? `${orderDuration.days() - 1} Ng??y ${orderDuration.hours()} Gi???`
      : "";
    const remainDays = orderDuration ? orderDuration.days() - 1 : 0;
    const remainHours = orderDuration ? orderDuration.hours() : 0;
    const params = {
      code: order.code,
      shopName: seller.shopName,
      shopCode: seller.code,
      shopDistrict: seller.district,
      branchCode: branch.code,
      branchName: branch.name,
      buyer: order.buyerName,
      buyerPhone: order.buyerPhone,
      shipMethod,

      deliveryAddressCode: order.shipMethod === ShipMethod.POST ? deliveryAddressCode : null,
      deliveryAddressName: order.shipMethod === ShipMethod.POST ? deliveryAddressName : null,
      deliveryAddress: order.shipMethod === ShipMethod.POST ? deliveryAddress : null,

      storehouseAddressCode: order.shipMethod === ShipMethod.VNPOST ? storehouseAddressCode : null,
      storehouseAddressName: order.shipMethod === ShipMethod.VNPOST ? storehouseAddressName : null,
      storehouseAddress: order.shipMethod === ShipMethod.VNPOST ? storehouseAddress : null,

      buyerAddress,
      district: seller.district,
      note: order.note,
      commission1: order.commission1,
      commission2: order.commission2,
      commission3: order.commission3,
      subTotal: order.subtotal,
      shipfee: order.shipfee,
      amount: order.amount,
      status: statusText(order),
      createdDate: moment(order.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      finishedDate: order.finishedAt ? moment(order.finishedAt).format("DD/MM/YYYY HH:mm:ss") : "",
      logDate: moment(order.loggedAt).format("DD/MM/YYYY HH:mm:ss"),
      late: order.isLate ? "Tr???" : "",
      remainTime: order.isLate ? remainTime : "",
      remainDays: order.isLate ? remainDays : "",
      remainHours: order.isLate ? remainHours : "",
    };
    // console.log('count', i);
    data.push(params);
  }

  // console.log('data', data);
  const branchesData = [];

  const workbook = new Excel.Workbook();

  const createSheetData = (data: [], name: string) => {
    const sheet = workbook.addWorksheet(name);
    const excelHeaders = [
      "STT",
      "M?? ????n",

      "C???a h??ng",
      "M?? c???a h??ng",
      "Qu???n / Huy???n",
      "Chi nh??nh",

      "Ng?????i mua",
      "?????a ch??? ng?????i mua",
      "S??T",

      "PTVC",

      "M?? c???a h??ng nh???n",
      "T??n c???a h??ng nh???n",
      "?????a ch??? c???a h??ng nh???n",

      "M?? c???a h??ng giao",
      "T??n c???a h??ng giao",
      "?????a ch??? c???a h??ng giao",

      "Ghi ch??",
      "HH ??i???m b??n",
      "HH CTV",
      "HH giao h??ng",

      "Th??nh ti???n",
      "Ph?? ship",
      "T???ng c???ng",

      "Ng??y ?????t h??ng",
      "Ng??y ho??n t???t",
      "Ng??y x??? l?? g???n nh???t",
      "T??nh tr???ng",
      "Tr??? - Th???i gian b??? Tr???",
    ];

    sheet.addRow(excelHeaders);

    data.forEach((d: any, i: number) => {
      const dataRow = [
        i + 1,
        d.code,

        d.shopName,
        d.shopCode,
        d.shopDistrict,
        d.branchName,

        d.buyer,
        d.buyerAddress,
        d.buyerPhone,

        d.shipMethod,

        d.deliveryAddressCode,
        d.deliveryAddressName,
        d.deliveryAddress,

        d.storehouseAddressCode,
        d.storehouseAddressName,
        d.storehouseAddress,

        d.note,

        d.commission1,
        d.commission2,
        d.commission3,

        d.subTotal,
        d.shipfee,
        d.amount,

        d.createdDate,
        d.finishedDate,
        d.logDate,
        d.status,
        `${d.late} - ${d.remainTime}`,
      ];
      sheet.addRow(dataRow);
    });

    UtilsHelper.setThemeExcelWorkBook(sheet);
  };

  const POSTS_SHEET_NAME = "Danh s??ch ????n h??ng";
  createSheetData(data, POSTS_SHEET_NAME);

  if (!context.isMember() && isEmpty(memberId)) {
    for (const branch of branches) {
      const branchData = data.filter((m: any) => m.branchCode === branch.code);
      branchesData.push({ name: branch.name, data: branchData });
    }
  }

  if (!context.isMember() && isEmpty(memberId)) {
    for (const branchData of branchesData) {
      createSheetData(branchData.data, branchData.name);
    }
  }

  return UtilsHelper.responseExcel(res, workbook, "danh_sach_don_hang");
};
