import Axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import { EventEmitter } from "events";
import _ from "lodash";
import NodeRSA from "node-rsa";

import { BaseError } from "../../base/error";
import { configs } from "../../configs";
import { logger } from "../../loaders/logger";

class Momo extends EventEmitter {
  sanbox: AxiosInstance;
  live: AxiosInstance;

  constructor() {
    super();
    this.sanbox = Axios.create({
      baseURL: `https://test-payment.momo.vn`,
    });
    this.sanbox.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error(`Lỗi Momo API`, error, { response: error.response.data });
        logger.error(`Response`, error.response.data);
        throw new BaseError(500, "momo-error", `${error.response?.data || error.message}, "")}`);
      }
    );
    this.live = Axios.create({
      baseURL: `https://payment.momo.vn`,
    });

    this.live.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error(`Lỗi Momo API`, error);
        throw new BaseError(500, "casso-error", `${error.message}`);
      }
    );
  }

  generateSignature(rawSignature: string, secretKey: string) {
    return crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
  }

  generateInpResponseSignature(data: any, secretKey: string) {
    const rawSignature =
      `accessKey=${data.accessKey}` +
      `&extraData=${data.extraData}` +
      `&message=${data.message}` +
      `&orderId=${data.orderId}` +
      `&partnerCode=${data.partnerCode}` +
      `&requestId=${data.requestId}` +
      `&responseTime=${data.responseTime}` +
      `&resultCode=${data.resultCode}`;
    return this.generateSignature(rawSignature, secretKey);
  }

  generateRefundSignature(data: any, secretKey: string) {
    const rawSignature =
      `accessKey=${data.accessKey}` +
      `&amount=${data.amount}` +
      `&description=${data.description || ""}` +
      `&orderId=${data.orderId}` +
      `&partnerCode=${data.partnerCode}` +
      `&requestId=${data.requestId}` +
      `&transId=${data.transId}`;
    logger.info("rawSignature", { rawSignature });
    return this.generateSignature(rawSignature, secretKey);
  }

  validateInpSignature(data: any, secretKey: string, accessKey: string) {
    const {
      signature,
      extraData,
      message,
      orderId,
      partnerCode,
      requestId,
      responseTime,
      resultCode,
      amount,
      orderInfo,
      orderType,
      payType,
      transId,
    } = data;
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;
    const decode = this.generateSignature(rawSignature, secretKey);
    return decode == signature;
  }

  hash(data: any, publicKey: string) {
    let jsonString = JSON.stringify(data);
    let rsaKey = "-----BEGIN PUBLIC KEY-----" + publicKey + "-----END PUBLIC KEY-----";
    const key = new NodeRSA(rsaKey, "pkcs8-public", { encryptionScheme: "pkcs1" });
    return key.encrypt(jsonString, "base64");
  }

  get api() {
    const {
      momo: { mode },
    } = configs;
    if (mode == "live") return this.live;
    else return this.sanbox;
  }

  /** Tạo request thanh toán qua App */
  async payApp(data: {
    partnerCode: string;
    partnerRefId: string;
    amount: string;
    customerNumber: string;
    publicKey: string;
    appData: string;
    partnerTransId?: string;
    partnerName?: string;
    description?: string;
    extra_data?: string;
  }) {
    const { partnerCode, partnerRefId, amount, publicKey } = data;
    const hash = this.hash(
      {
        partnerCode,
        partnerRefId,
        amount,
      },
      publicKey
    );

    const reqData = {
      ..._.omit(data, ["publicKey", "amount"]),
      hash: hash,
      version: 2,
      payType: 3,
    };
    return await this.api.post(`/pay/app`, reqData).then((res) => res.data);
  }

  /** Tạo request thanh toán qua QRCode */
  async payQrcode(data: {
    partnerCode: string;
    partnerName?: string;
    storeId?: string;
    requestId: string;
    amount: number;
    orderId: string;
    orderInfo: string;
    autoCapture?: boolean;
    redirectUrl: string;
    ipnUrl: string;
    extraData: string;
    lang: "vi" | "en";
    secretKey: string;
    accessKey: string;
  }) {
    const {
      accessKey,
      amount,
      extraData,
      ipnUrl,
      orderId,
      orderInfo,
      partnerCode,
      redirectUrl,
      requestId,
      secretKey,
    } = data;
    let rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=captureWallet`;
    const signature = this.generateSignature(rawSignature, secretKey);
    const requestData = {
      ..._.omit(data, ["secretKey"]),
      requestType: "captureWallet",
      signature,
    };
    return this.api.post("/v2/gateway/api/create", requestData).then((res) => res.data);
  }

  async confirmTransaction(data: {
    partnerCode: string;
    partnerRefId: string;
    requestType: string;
    requestId: string;
    momoTransId: string;
    customerNumber?: string;
    description?: string;
    secretKey: string;
  }) {
    // logger.info(`confirmTransaction`, data);
    const { partnerCode, partnerRefId, requestType, requestId, momoTransId, secretKey } = data;

    const signature = this.generateSignature(
      `partnerCode=${partnerCode}&partnerRefId=${partnerRefId}&requestType=${requestType}&requestId=${requestId}&momoTransId=${momoTransId}`,
      secretKey
    );
    return await this.api
      .post(`/pay/confirm`, {
        ..._.omit(data, ["secretKey"]),
        signature,
      })
      .then((res) => res.data);
  }

  async refund(data: {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number;
    transId: number;
    lang: string;
    description?: string;
    secretKey: string;
    accessKey: string;
  }) {
    const { secretKey, ...payload } = data;
    const signature = this.generateRefundSignature(payload, secretKey);

    const reqData = {
      ...payload,
      signature,
    };
    logger.info(`Hoàn tiền MOMO`, { reqData });
    return await this.api
      .post(`/v2/gateway/api/refund`, reqData)
      .then((res) => res.data)
      .then((res) => {
        logger.info(`Kết quả hoàn tiền Momo`, { res });
        return res;
      });
  }

  async getAppPaymentInfo(data: {
    orderId: string;
    amount: number;
    customerName: string;
    extra: string;
    partnerCode: string;
    orderLabel: string;
    merchantNameLabel: string;
    fee: number;
    feeType: "VND" | "%";
    description: string;
    testMode: boolean;
    publicKey: string;
    iosSchemeId: string;
    partner?: string;
  }) {
    const {
      partnerCode,
      orderLabel,
      merchantNameLabel,
      fee,
      feeType,
      description,
      testMode,
      publicKey,
      iosSchemeId,
      partner = "merchant",
    } = data;
    if (partnerCode == "" || publicKey == "") throw Error("Không thể thanh toán bằng Momo.");
    const paymentFee = feeType == "%" ? (data.amount * fee) / 100 : fee;
    return {
      appScheme: iosSchemeId,
      merchantcode: partnerCode,
      amount: data.amount,
      orderId: data.orderId,
      orderLabel: orderLabel,
      merchantnamelabel: merchantNameLabel,
      fee: paymentFee,
      description: description,
      username: data.customerName,
      partner: partner,
      extra: data.extra,
      isTestMode: testMode,
    };
  }
}

export default new Momo();

/**
 * Result Code 
 *  0	Giao dịch thành công.	Yes	
    9000	Giao dịch đã được xác nhận thành công.	No	Đối với thanh toán 1 bước (autoCapture=1), đây có thể xem như giao dịch thanh toán đã thành công. Đối với thanh toán 2 bước (autoCapture=0), vui lòng thực hiện tiếp yêu cầu capture hoặc cancel. Đối với liên kết. vui lòng tiến hành yêu cầu lấy recurring token. with either capture or cancel request. For binding, please proceed to request the recurring token.
    8000	Giao dịch đang ở trạng thái cần được người dùng xác nhận thanh toán lại.	No	Giao vẫn đang chờ người dùng xác nhận thanh toán; trạng thái của giao dịch sẽ được tự động thay đổi ngay sau khi người dùng xác nhận hoặc hủy thanh toán.
    7000	Giao dịch đang được xử lý.	No	Vui lòng chờ giao dịch được xử lý hoàn tất.
    1000	Giao dịch đã được khởi tạo, chờ người dùng xác nhận thanh toán.	No	Giao vẫn đang chờ người dùng xác nhận thanh toán; trạng thái của giao dịch sẽ được tự động thay đổi ngay sau khi người dùng xác nhận hoặc hủy thanh toán.
    11	Truy cập bị từ chối.	No	Cấu hình tài khoản doanh nghiệp không cho phép truy cập. Vui lòng xem lại các thông tin đăng ký và cấu hình trên M4B, hoặc liên hệ trực tiếp với MoMo để được điều chỉnh.
    12	Phiên bản API không được hỗ trợ cho yêu cầu này.	No	Vui lòng nâng cấp lên phiên bản mới nhất của cổng thanh vì, vì phiên bản bạn đang truy cấp hiện không còn được hỗ trợ.
    13	Xác thực doanh nghiệp thất bại.	No	Vui lòng kiểm tra thông tin kết nối, bao gồm cả chữ ký mà bạn đang sử dụng, và đối chiếu với các thông tin được cung cấp từ M4B.
    20	Yêu cầu sai định dạng.	No	Vui lòng kiểm tra định dạng của yêu cầu, các biến thể, hoặc tham số còn thiếu.
    21	Số tiền giao dịch không hợp lệ.	No	Vui lòng kiểm tra nếu số tiền thanh toán nằm trong giới hạn quy định của yêu cầu thanh toán này. Đối với yêu cầu dạng capture, hãy kiểm tra số tiền capture có bằng với số tiền đã được xác nhận trước đó hay không.
    40	RequestId bị trùng.	No	Vui lòng thử lại với một requestId khác.
    41	OrderId bị trùng.	No	Vui lòng truy vấn trạng thái của orderId này, hoặc thử lại với một orderId khác.
    42	OrderId không hợp lệ hoặc không được tìm thấy.	No	Vui lòng thử lại với một orderId khác.
    43	Yêu cầu bị từ chối vì xung đột trong quá trình xử lý giao dịch.	No	Trước khi thử lại, vui lòng kiểm tra nếu có một giao dịch khác đang được xử lý có thể hạn chế yêu cầu này được tiếp nhận, hoặc orderId được sử dụng không phù hợp với yêu cầu này.
    1001	Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền.	Yes	
    1002	Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán.	Yes	Sự từ chối xảy ra khi thẻ được dùng để thanh toán hiện không còn khả dụng, hoặc kết nối đến hệ thống của nhà phát hành thẻ bị gián đoạn. Vui lòng tạm thời sử dụng phương thức thanh toán khác.
    1003	Giao dịch bị đã bị hủy.	Yes	Giao dịch bị hủy bởi doanh nghiệp hoặc bởi trình xử lý timeout của MoMo. Vui lòng đánh dấu giao dịch này đã bị hủy (giao dịch thất bại).
    1004	Giao dịch thất bại do số tiền thanh toán vượt quá hạn mức thanh toán của người dùng.	Yes	Vui lòng đánh dấu giao dịch này thất bại, và thử lại vào một khoảng thời gian khác.
    1005	Giao dịch thất bại do url hoặc QR code đã hết hạn.	Yes	Vui lòng gửi lại một yêu cầu thanh toán khác.
    1006	Giao dịch thất bại do người dùng đã từ chối xác nhận thanh toán.	Yes	Please send another payment request.
    1007	Giao dịch bị từ chối vì tài khoản người dùng đang ở trạng thái tạm khóa.	Yes	Vui lòng sử dụng một phương thức thanh toán khác không bị ràng buộc với tài khoản người dùng này. Đối với giao dịch, bạn có thể liên hệ với MoMo để được giúp đỡ.
    1026	Giao dịch bị hạn chế theo thể lệ chương trình khuyến mãi.	Yes	Vui lòng liên hệ MoMo để biết thêm chi tiết.
    1080	Giao dịch hoàn tiền bị từ chối. Giao dịch thanh toán ban đầu không được tìm thấy.	Yes	Vui lòng kiểm tra nếu orderId hoặc TID được dùng trong yêu cầu này là chính xác.
    1081	Giao dịch hoàn tiền bị từ chối. Giao dịch thanh toán ban đầu có thể đã được hoàn.	Yes	Vui lòng kiểm tra nếu giao dịch thanh toán ban đầu đã được hoàn thành công, hoặc số tiền hoàn vượt quá số tiền cho phép hoàn của giao dịch thanh toán ban đầu.
    2001	Giao dịch thất bại do sai thông tin liên kết.	Yes	Token liên kết không tồn tại hoặc đã bị xóa, vui lòng cập nhật dữ liệu của bạn.
    2007	Giao dịch thất bại do liên kết hiện đang bị tạm khóa.	Yes	Token liên kết hiện đang ở trạng thái không hoạt động, do người dùng đã chủ động tạm khóa liên kết.
    3001	Liên kết thất bại do người dùng từ chối xác nhận.	Yes	
    3002	Liên kết bị từ chối do không thỏa quy tắc liên kết.	Yes	Từ chối này thường xảy ra khi partnerClientId dùng trong yêu cầu đã được liên kết với một hoặc nhiều tài khoản MoMo trước đó. Vui lòng liên hệ MoMo để biết thêm chi tiết.
    3003	Hủy liên kết bị từ chối do đã vượt quá số lần hủy.	Yes	Vui lòng liên hệ MoMo để biết thêm chi tiết.
    3004	Liên kết này không thể hủy do có giao dịch đang chờ xử lý.	Yes	Vui lòng kiểm tra nếu có bất kỳ giao dịch chờ liên quan đén token này chưa được yêu cầu capture hoặc cancel (hủy).
    4001	Giao dịch bị hạn chế do người dùng chưa hoàn tất xác thực tài khoản.	Yes	
    4010	Quá trình xác minh OTP thất bại.	Yes	Quá trình xác minh người dùng thất bại. Vui lòng gửi một yêu cầu xác minh người dùng khác để thử lại.
    4011	OTP chưa được gửi hoặc hết hạn.	Yes	Vui lòng yêu cầu gửi một mã OTP khác.
    4100	Giao dịch thất bại do người dùng không đăng nhập thành công.	Yes	
    4015	Quá trình xác minh 3DS thất bại.	Yes	Quá trình xác minh người dùng thất bại. Vui lòng gửi một yêu cầu xác minh người dùng khác để thử lại.
    10	Hệ thống đang được bảo trì.	No	Vui lòng quay lại sau khi bảo trì được hoàn tất.
    99	Lỗi không xác định.	Yes	Vui lòng liên hệ MoMo để biết thêm chi tiết.
 */
