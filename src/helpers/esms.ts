import axios from "axios";
import _ from "lodash";
import { configs } from "../configs";
import { logger } from "../loaders/logger";

const STATUS_CODE = {
  "100": "Request đã được nhận và xử lý thành công.",
  "104": "Brandname không tồn tại hoặc đã bị hủy",
  "118": "Loại tin nhắn không hợp lệ",
  "119": "Brandname quảng cáo phải gửi ít nhất 20 số điện thoại",
  "131": "Tin nhắn brandname quảng cáo độ dài tối đa 422 kí tự",
  "132": "Không có quyền gửi tin nhắn đầu số cố định 8755",
  "99": "Lỗi không xác định",
  "177":
    "Brandname không có hướng ( Viettel - The Network Viettel have not registry.<br>VinaPhone - The Network VinaPhone have not registry.<br>Mobifone - The Network Mobifone have not registry.<br>Gtel - The Network Gtel have not registry.<br>Vietnammobile - The Network Vietnammoile have not registry.)",
  "159": "RequestId quá 120 ký tự",
  "145": "Sai template mạng xã hội",
  "146": "Sai template Brandname CSKH",
};

export class ESMS {
  host = "http://rest.esms.vn";
  apiKey = configs.esms.apiKey;
  secret = configs.esms.secret;
  brandName = configs.esms.brandName;
  sandbox = configs.esms.sandbox;

  constructor() {}

  async send(phone: string, content: string) {
    const { host, apiKey, secret, brandName, sandbox } = this;
    const payload = {
      Phone: phone,
      Content: content,
      Brandname: brandName,
      SmsType: 2,
      // CallBackUrl: callbackUrl,
      ApiKey: apiKey,
      SecretKey: secret,
      sandbox: sandbox ? 1 : 0,
    };
    const result = await axios
      .get(`${host}/MainService.svc/JSON/SendMultipleMessage_V4_get`, { params: payload })
      .catch((err) => {
        console.log("err", err.message);
        throw err;
      });

    const codeResult = _.get(result, "data.CodeResult");
    return {
      success: codeResult == "100",
      message: _.get(STATUS_CODE, codeResult, codeResult),
      data: result.data,
    };
  }
}

export default new ESMS();
