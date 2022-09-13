import { Job } from "bee-queue";
import { Workbook } from "excel-cloner";
import fs from "fs";
import moment from "moment-timezone";
import { DeliveryStatus } from "momo-salary";
import $ from "mongo-dot-notation";
import { Types } from "mongoose";
import { convertPhone } from "../../../../helpers/functions/string";

import { momoSalary1 } from "../../../../helpers/momo/momoSalary";
import { logger } from "../../../../loaders/logger";
import { BaseQueue } from "../../../../queues/queue";
import { InsertNotification, NotificationTarget } from "../../notification/notification.model";
import { NotificationBuilder } from "../../notification/notificationBuilder";
import { CustomerModel, ICustomer } from "../customer.model";
import { MomoWalletStatus } from "./customerMomoWallet.graphql";

class TrackingCustomerMomoWalletStatusQueue extends BaseQueue {
  constructor() {
    super("tracking-customer-momo-wallet-status", 1);
  }

  protected async process(job: Job<any>) {
    try {
      logger.info(`Tracking Customer Momo Wallet Status Queue: ${job.id}`);
      // step 1: fetch all customer has momoWallet.status is processing
      const customers = await CustomerModel.find({
        "momoWallet.status": MomoWalletStatus.processing,
      })
        .select("_id momoWallet memberId")
        .exec();
      if (customers.length == 0) {
        logger.info(`Không có khách hàng nào cần xử lý`);
        return;
      }

      logger.info(`Có ${customers.length} khách hàng cần xử lý`);
      // step 2: generate delivery list for each customer
      const deliveryFileId = await uploadDevliveryList(customers);

      logger.info(`Upload danh sách nhận thành công`, { deliveryFileId });
      // step 3: tracking delivery list status
      await trackingDeliveryListStatus(deliveryFileId);
      logger.info(`Tracking danh sách nhận thành công`, { deliveryFileId });
      // step 4: update customer momoWallet status
      await updateCustomerMomoWalletStatus(deliveryFileId);
    } catch (err) {
      logger.error(`Lỗi Tracking Customer Momo Wallet Status Queue: ${err}`);
      throw err;
    }
  }
}

export const trackingMomoWalletStatusQueue = new TrackingCustomerMomoWalletStatusQueue();

async function uploadDevliveryList(customers: ICustomer[]) {
  const fileName = `3MSHOP-${moment().format("DD-MM-YYYY-HH-mm-ss")}.xlsx`;
  const filePath = `tmp/${fileName}`;
  try {
    // Khởi tạo danh sách người nhận
    const workbook = new Workbook();
    let sheet = workbook.addWorksheet("Disburse list");
    sheet.addRow(["SĐT", "Tên", "CMND/CCCD", "Thông tin thêm"]);

    sheet.addRows(
      customers.map((i) => [
        convertPhone(`${i.momoWallet.phone.replace(/\ /, "").replace(/\./, "")}`, "0"),
        i.momoWallet.name,
        i.momoWallet.idCard,
        JSON.stringify({
          type: "customer",
          _id: i._id,
          memberId: i.memberId,
        }),
      ])
    );

    // Export workbook
    fs.mkdirSync("tmp", { recursive: true }); // Đảm bảo thư mục tmp có tồn tại
    const result = fs.createWriteStream(filePath);
    await workbook.xlsx.write(result);
    logger.info(`Tạo danh sách nhận thành công`, { filePath });
    const deliveryFile = await momoSalary1.uploadDeliveryList(filePath, fileName);
    logger.info("deliveryFile", { deliveryFile });
    return deliveryFile.fileId;
  } catch (err) {
    logger.error(`Lỗi khi tạo file delivery list`, err);
    throw err;
  } finally {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {}
  }
}
async function trackingDeliveryListStatus(deliveryFileId: string) {
  try {
    const watchStatus = async () => {
      return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
          momoSalary1
            .getDeliveryFileStatus(deliveryFileId)
            .then((status) => {
              if (status.resultCode == 0) {
                // Hoàn thành xử lý
                clearInterval(interval);
                resolve(status);
              }
            })
            .catch((err) => {
              reject(err);
            });
        }, 10000); // 10s kiểm tra 1 lần
      });
    };
    await watchStatus();
  } catch (err) {
    logger.error(`Lỗi khi kiểm tra danh sách nhận`, err);
    throw err;
  }
}
async function updateCustomerMomoWalletStatus(deliveryFileId: string) {
  let total = 0;
  let count = 0;
  let page = 1;
  const bulk = CustomerModel.collection.initializeUnorderedBulkOp();
  do {
    const result = await momoSalary1.getAllDeliveryList({
      fileId: deliveryFileId,
      page: page++,
      size: 1000,
    });
    total = result.total;
    count += result.data.length;
    for (const item of result.data) {
      logger.info(`Cập nhật trạng thái khách hàng`, {
        item,
      });
      try {
        const extra = JSON.parse(item.extra);
        // get momo wallet status from item.status
        const status = getMomoWalletStatus(item.status);
        const statusMsg = getMomoWalletStatusMsg(status);
        bulk
          .find({ _id: Types.ObjectId(extra._id) })
          .updateOne($.flatten({ momoWallet: { status, statusMsg } }));
        // send notification to customer depend on status
        sendNotificationToCustomer(extra._id, statusMsg);
      } catch (err) {
        console.log("Lỗi xử lý dữ liệu người nhận", err.message);
      }
    }
  } while (total > 0 && count < total);
  if (bulk.length > 0) {
    await bulk.execute();
  }
}
function getMomoWalletStatus(status: DeliveryStatus) {
  switch (status) {
    case DeliveryStatus.valid:
      return MomoWalletStatus.valid;
    case DeliveryStatus.walled_invalid:
      return MomoWalletStatus.wallet_invalid;
    case DeliveryStatus.walled_not_found:
      return MomoWalletStatus.walled_not_found;
    default:
      return MomoWalletStatus.invalid;
  }
}
async function sendNotificationToCustomer(customerId: string, statusMsg: string) {
  try {
    const notify = new NotificationBuilder(`Kết quả kết nối tài khoản momo`, statusMsg).sendTo(
      NotificationTarget.CUSTOMER,
      customerId
    );
    await InsertNotification([notify.build()]);
  } catch (err) {
    logger.error(`Lỗi khi gửi thông báo cho khách hàng`, err);
  }
}
function getMomoWalletStatusMsg(status: MomoWalletStatus) {
  switch (status) {
    case MomoWalletStatus.valid: {
      return `Tài khoản momo của bạn đã được kết nối thành công.`;
    }
    case MomoWalletStatus.walled_not_found: {
      return `Không tìm thấy tài khoản momo trên hệ thống`;
    }
    case MomoWalletStatus.wallet_invalid: {
      return `Tài khoản momo của bạn chưa kích hoạt`;
    }
    default: {
      return `Thông tin đăng ký không hợp lệ`;
    }
  }
}
