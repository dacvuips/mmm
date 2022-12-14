import Excel from "exceljs";
import { ObjectId } from "mongodb";

import { BaseRoute, Request, Response } from "../../base/baseRoute";
import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { AddressModel } from "../../graphql/modules/address/address.model";
import { LuckyWheelModel } from "../../graphql/modules/luckyWheel/luckyWheel.model";
import { GiftType } from "../../graphql/modules/luckyWheelGift/luckyWheelGift.model";
import { LuckyWheelResultModel } from "../../graphql/modules/luckyWheelResult/luckyWheelResult.model";
import { UtilsHelper } from "../../helpers";
import { auth } from "../../middleware/auth";

class LuckyWheelRoute extends BaseRoute {
  constructor() {
    super();
  }

  customRouting() {
    this.router.get("/export", [auth], this.route(this.exportToExcel));
  }

  //{{host}}/api/campaign?campaign=C10004&page=243084826060782&product=sms-all
  async exportToExcel(req: Request, res: Response) {
    const context = (req as any).context as Context;
    context.auth(ROLES.ADMIN_EDITOR);

    const luckyWheelId: string = req.query.luckyWheelId.toString();

    console.log("luckyWheelId", luckyWheelId);
    const luckyWheel = await LuckyWheelModel.findById(luckyWheelId);
    let data: any[] = [];

    let resultCount = 0;
    // do {
    //   resultCount = await LuckyWheelResultModel.count({ luckyWheelId });

    //   console.log("fetch from ", luckyWheelId, resultCount);

    //   console.log("stop do");
    // } while (resultCount > 0);

    const results = await LuckyWheelResultModel.aggregate([
      {
        $match: {
          luckyWheelId: new ObjectId(luckyWheelId),
          // status: { $in: [SpinStatus.WIN, SpinStatus.LOSE] },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $lookup: {
          from: "luckywheelgifts",
          localField: "giftId",
          foreignField: "_id",
          as: "gift",
        },
      },
      {
        $unwind: "$gift",
      },
      {
        $lookup: {
          from: "luckywheels",
          localField: "luckyWheelId",
          foreignField: "_id",
          as: "luckyWheel",
        },
      },
      {
        $unwind: "$luckyWheel",
      },
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "member",
        },
      },
      {
        $unwind: "$member",
      },
      {
        $project: {
          _id: 1,
          agencyType: 1,
          giftType: 1,
          status: 1,
          customerId: 1,
          gamePointUsed: 1,
          memberId: 1,
          luckyWheelId: 1,
          createdAt: 1,
          updatedAt: 1,
          giftId: 1,
          giftName: 1,
          customer: 1,
          gift: 1,
          luckyWheel: 1,
          member: 1,
        },
      },
    ]);

    const newResults = [];

    for (const result of results) {
      const address = await AddressModel.findOne({ wardId: result.customer.wardId });
      result.ward = address.ward;
      result.district = address.district;
      result.province = address.province;

      // result.status = result.status === SpinStatus.WIN ? "Th???ng" : SpinStatus.LOSE ? "Thua" : "";

      // qu?? tr??ng
      result.giftCustomType =
        result.giftType === GiftType.CUMMULATIVE_POINT
          ? result.giftType === GiftType.NOTHING
            ? ""
            : "??i???m th?????ng"
          : "Qu?? t???ng";

      // gi?? tr???
      result.giftCustomValue === GiftType.CUMMULATIVE_POINT
        ? result.gift.payPoint
        : result.gift.payPresent;

      newResults.push(result);
    }

    // console.log('newResults', newResults);

    // resultCount = res.length;
    data = [...data, ...newResults];

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("Danh s??ch kh??ch h??ng tr??ng th?????ng");
    sheet.addRow([
      "M?? s???",
      "Code",
      "K???t qu???",
      "Qu?? tr??ng",
      "Lo???i qu??",
      "Gi?? tr???",
      "Kh??ch h??ng",
      "T??n Facebook",
      "S??T",
      "?????a ch???",
      "Ph?????ng/x??",
      "Qu???n/Huy???n",
      "T???nh th??nh",
      "C???a h??ng ???? quay",
      "Ch??? c???a h??ng",
      "Ng??y quay",
    ]);

    // const ward = await getWardName(d.customer.wardId),
    //   district = await getDistrictName(d.customer.districtId),
    //   province = await getProvinceName(d.customer.provinceId);
    data.forEach((d: any, i) => {
      sheet.addRow([
        i + 1, //M?? s???
        d.gift.code, //Code
        d.status, //K???t qu???
        d.giftName, //Qu?? tr??ng
        d.giftCustomType, //Lo???i qu??
        d.giftCustomValue, //Gi?? tr???
        d.customer.name,
        d.customer.facebookName,
        d.customer.phone,
        d.customer.address,
        d.ward,
        d.district,
        d.province,
        d.member.shopName,
        d.member.name,
        d.createdAt,
      ]);
    });

    UtilsHelper.setThemeExcelWorkBook(sheet);

    return UtilsHelper.responseExcel(
      res,
      workbook,
      `danh_sach_trung_thuong_vong_quay_${luckyWheel.code}`
    );
  }
}

export default new LuckyWheelRoute().router;
