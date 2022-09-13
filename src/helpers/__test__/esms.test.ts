import esms from "../esms";

export default describe("ESMS", () => {
  it("send", async (done) => {
    expect.assertions(1);

    const result = await esms.send(
      "0908744234",
      // "CTY 3M MKT gui ma OTP de dang nhap tai khoan tai web giaohang.shop cua Quy khach la 123456."
      // `3MSHop - Cam on ban da su dung dich vu cua chung toi. Moi ban bam: https://giaohang.shop/3MSHOP/order de danh gia dich vu`
      "3MSHop - Don hang cua ban dang tren duong giao toi. Ban de y dien thoai nhe. Xem thong tin don hang tai day: https://giaohang.shop/3MSHOP/order"
      //{P2,15} - Don hang cua ban dang tren duong giao toi. Ban de y dien thoai nhe. Xem thong tin don hang tai day: https://giaohang.shop/{P2,15}
    );

    console.log({ result });

    expect(result.success).toBeTruthy();
  });
});
