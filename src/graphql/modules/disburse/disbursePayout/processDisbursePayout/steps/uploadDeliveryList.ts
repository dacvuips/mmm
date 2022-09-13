import { Workbook } from "exceljs";
import fs from "fs";
import _ from "lodash";
import $ from "mongo-dot-notation";

import { momoSalary1 } from "../../../../../../helpers/momo/momoSalary";
import { DisburseItemModel, DisburseItemStatus } from "../../../disburseItem/disburseItem.model";
import { DisbursePayoutStatus } from "../../disbursePayout.model";
import { ProcessDisbursePayoutContext } from "../common";

export default async function execute(ctx: ProcessDisbursePayoutContext) {
  const {
    input: { payout },
    meta: { disburse },
  } = ctx;

  console.log("Upload danh sách nhận");
  try {
    // Khởi tạo danh sách người nhận
    const workbook = new Workbook();
    let sheet = workbook.addWorksheet("Disburse list");
    sheet.addRow(["SĐT", "Tên", "CMND/CCCD", "Thông tin thêm"]);

    const query = [
      {
        $match: {
          disburseId: disburse._id,
          status: { $ne: DisburseItemStatus.completed },
          $or: [{ payoutId: { $exists: false } }, { payoutId: payout._id }],
        },
      },
      {
        $lookup: {
          from: "customers",
          let: { id: "$customerId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 1, idCard: 1, phone: 1 } },
          ],
          as: "c",
        },
      },
      { $unwind: "$c" },
      {
        $project: {
          _id: 1,
          memberId: 1,
          customerId: 1,
          customerPhone: "$c.phone",
          customerName: 1,
          customerCode: 1,
          idCard: "$c.idCard",
        },
      },
    ];
    // Đổ dữ liệu
    const data = await DisburseItemModel.aggregate(query).then((res) =>
      res.filter((r) => _.isEmpty(r.idCard) == false)
    );

    console.log("delivery items", data.length);

    const bulk = DisburseItemModel.collection.initializeUnorderedBulkOp();
    for (const i of data) {
      bulk
        .find({ _id: i._id })
        .updateOne({ $set: { customerPhone: i.customerPhone, idCard: i.idCard } });
    }
    await bulk.execute();

    if (data.length == 0) {
      throw Error("Không có danh sách nhận");
    }

    sheet.addRows(
      data.map((i) => [
        `${i.customerPhone.replace(/\ /, "").replace(/\./, "")}`,
        i.customerName,
        i.idCard,
        JSON.stringify({
          type: "customer",
          _id: i.customerId,
          itemId: i._id,
          memberId: i.memberId,
        }),
      ])
    );

    // Export workbook
    const fileName = `${disburse.name}_${payout.name}_${payout._id}.xlsx`;
    const filePath = `tmp/${fileName}`;
    fs.mkdirSync("tmp", { recursive: true }); // Đảm bảo thư mục tmp có tồn tại
    const result = fs.createWriteStream(filePath);
    await workbook.xlsx.write(result);
    const deliveryFile = await momoSalary1.uploadDeliveryList(filePath, fileName).catch((err) => {
      console.log("ERROR", err);
      throw err;
    });
    console.log("deliveryFile", deliveryFile);
    await payout.updateOne(
      $.flatten({
        processingMsg: `Đang kiểm tra danh sách người nhận`,
        meta: {
          deliveryFileId: deliveryFile.fileId,
        },
      })
    );

    console.log(`Đang kiểm tra danh sách người nhận`);

    fs.unlinkSync(filePath);

    ctx.meta.deliveryFileId = deliveryFile.fileId;
  } catch (err) {
    await payout.updateOne(
      $.flatten({
        processingMsg: `Lỗi khi kiểm tra danh sách người nhận. ${err.message}`,
        status: DisbursePayoutStatus.error,
      })
    );
    throw err;
  }
}
