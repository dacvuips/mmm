import { ProcessDisbursePayoutContext } from "../common";
import $ from "mongo-dot-notation";
import { DisbursePayoutStatus } from "../../disbursePayout.model";
import { Workbook } from "exceljs";
import fs from "fs";
import { momoSalary1 } from "../../../../../../helpers/momo/momoSalary";
import { DisburseItemModel, DisburseItemStatus } from "../../../disburseItem/disburseItem.model";

export default async function execute(ctx: ProcessDisbursePayoutContext) {
  const {
    input: { payout },
    meta: { disburse },
  } = ctx;
  console.log("Upload danh sách chi");
  try {
    const payoutItems = await DisburseItemModel.find({
      disburseId: disburse._id,
      payoutId: payout._id,
      status: DisburseItemStatus.pending,
    });
    console.log("payoutItems", payoutItems.length);
    if (payoutItems.length == 0) throw Error("Không có danh sách chi");
    // Khởi tạo danh sách người nhận
    const workbook = new Workbook();
    let sheet = workbook.addWorksheet("Disburse list");
    sheet.addRow(["SĐT", "Tên", "Số tiền", "Thông tin thêm"]);

    sheet.addRows(
      payoutItems.map((i) => [
        `${i.customerPhone.replace(/\ /, "").replace(/\./, "")}`,
        i.customerName,
        i.value,
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
    const result = fs.createWriteStream(filePath);
    await workbook.xlsx.write(result);
    const payoutFile = await momoSalary1.uploadPayoutList(filePath, fileName);
    await payout.updateOne(
      $.flatten({
        processingMsg: `Tải len dan sách chi`,
        meta: { payoutFileId: payoutFile.fileId },
      })
    );
    console.log(`Đã gửi yêu cầu chi`);
    fs.unlinkSync(filePath);

    ctx.meta.payoutFileId = payoutFile.fileId;
  } catch (err) {
    await payout.updateOne(
      $.flatten({
        processingMsg: `Lỗi khi gửi yêu cầu chi. ${err.message}`,
        status: DisbursePayoutStatus.error,
      })
    );
    throw err;
  }
}
