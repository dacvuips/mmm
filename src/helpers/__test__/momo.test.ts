import { Types } from "mongoose";
import { configs } from "../../configs";
import { counterService } from "../../graphql/modules/counter/counter.service";
import momo from "../momo";

export default describe("Momo", () => {
  const {
    momo: { partnerCode, publicKey, accessKey, secretKey },
  } = configs;
  // it("Request QR Payment", async (done) => {
  //   expect.assertions(1);
  //   const result = await momo.payQrcode({
  //     partnerCode,
  //     partnerName: "TEST",
  //     amount: 100000,
  //     requestId: await counterService.trigger("momo-request").then((res) => "MM" + res),
  //     storeId: "",
  //     lang: "vi",
  //     orderId: Types.ObjectId().toHexString(),
  //     orderInfo: "Thông tin đơn hàng",
  //     redirectUrl: "https://momo.vn/return",
  //     ipnUrl: "https://webhook.site/a1d97727-c7bc-4954-8398-9f1d5b1ef8d5",
  //     extraData: "",
  //     secretKey,
  //     accessKey,
  //   });
  //   console.log({ result });
  //   expect(result).toBeDefined();
  //   done();
  // });

  // it("Validate Signature", (done) => {
  //   var json = {
  //     partnerCode: "MOMOTKAI20210831",
  //     orderId: "54321",
  //     requestId: "12345",
  //     amount: 50000,
  //     orderInfo: "Thông tin đơn hàng",
  //     orderType: "momo_wallet",
  //     transId: 2570941112,
  //     resultCode: 0,
  //     message: "Giao dịch thành công.",
  //     payType: "qr",
  //     responseTime: 1630477540226,
  //     extraData: "",
  //     signature: "9becb4c57e890532ce2246e49844aa5ca34e780c5e9da182bc1cc50dc73f1928",
  //   };
  //   expect(momo.validateInpSignature(json, secretKey, accessKey)).toBeTruthy();
  //   done();
  // });

  it("Refund", async (done) => {
    expect.assertions(1);
    var json = {
      partnerCode,
      orderId: "HTDH101305-1",
      requestId: "613a3d0cc6ba82432ff60910",
      amount: 228500,
      transId: 2572693344,
      lang: "vi",
      description: "Huỷ đơn DH101305",
      secretKey,
      accessKey,
    };
    const result = await momo.refund(json);
    expect(result).toBeDefined();
    done();
  });
});
