import { Request, Response } from "express";
import { ROLES } from "../../constants/role.const";
import { Context } from "../../graphql/context";
import { ReportAdmin } from "../../graphql/modules/reportAdmin/common";
import Excel from "exceljs";
import { CollaboratorModel } from "../../graphql/modules/collaborator/collaborator.model";
import moment from "moment-timezone";
import { WorkSheetHelper } from "../../helpers/workSheet/workSheet.helper";
import { UtilsHelper } from "../../helpers/utils.helper";
import { ReportAdminRouter } from "./common";
export default [
  {
    method: "get",
    path: "/api/reportAdmin/exportCollaborator",
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
      const cursor = CollaboratorModel.aggregate([
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
            shortCode: 1,
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
          c.code || "",
          c.name || "",
          c.phone || "",
          c.shortCode || "",
          c.likeCount || 0,
          c.shareCount || 0,
          c.commentCount || 0,
          c.engagementCount || 0,
        ]);
      }
      new WorkSheetHelper(sheet).autoSize();
      UtilsHelper.responseExcel(res, workbook, "danh sach ctv");
    },
  },
];

function setHeader(sheet: Excel.Worksheet) {
  sheet.addRow([
    "Mã Cửa hàng",
    "Cửa hàng",
    "Ngày tạo",
    "Mã CTV",
    "Tên CTV",
    "SĐT",
    "Mã Giới thiệu",
    "Like",
    "Share",
    "Comment",
    "Tương tác",
  ]);
}
