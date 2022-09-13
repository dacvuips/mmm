import { Request, Response } from "express";
import { BaseError } from "../../base/error";
import { configs } from "../../configs";
import { validateJSON } from "../../helpers";
import momo from "../../helpers/momo";
import { MainConnection } from "../../loaders/database";
import { logger } from "../../loaders/logger";
export default [
  {
    method: "post",
    path: "/api/paymentTracking/momo",
    midd: [],
    action: async (req: Request, res: Response) => {
      validateJSON(req.body, {
        required: ["partnerCode", "orderId", "requestId", "amount", "transId", "signature"],
      });

      // Lưu trư dữ liệu webhook
      await MainConnection.collection("debug_momo_webhook").insertOne({
        ...req.body,
        createdAt: new Date(),
      });
      logger.info(`Tiếp nhận thanh toán từ Momo`, req.body);
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        // resultCode,
        // message,
        payType,
        // signature,
      } = req.body;
      const {
        momo: { accessKey, secretKey },
      } = configs;
      try {
        // Confirm giao dịch thành công

        if (!momo.validateInpSignature(req.body, secretKey, accessKey)) {
          logger.info(`Chữ ký điện tử không hợp lệ, dữ liệu đã bị thay đổi`);
          throw new BaseError(500, "momo-error", `Chữ ký điện tử không hợp lệ`);
        }
        const resultCode = 0;
        const message = `Giao dịch thành công`;
        const extraData = "";
        const responseData = {
          partnerCode,
          requestId,
          orderId,
          responseTime: new Date().getTime(),
          extraData,
          resultCode,
          message,
        };
        res.status(200).json({
          ...responseData,
          signature: momo.generateInpResponseSignature(responseData, secretKey),
        });
        logger.info(`Xác nhận thanh toán Momo`, { responseData });
        momo.emit(`paid`, req.body);
      } catch (err) {
        logger.error(`Lỗi xử lý giao dịch trả về từ Momo`, err);
        const responseData = {
          partnerCode,
          requestId,
          orderId,
          responseTime: new Date().getTime(),
          extraData: "",
          resultCode: 99,
          message: err.message,
        };
        res.status(200).json({
          ...responseData,
          signature: momo.generateInpResponseSignature(responseData, secretKey),
        });
      }
    },
  },
];
