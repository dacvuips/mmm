import updateExpiredCustomerVoucher from "../steps/updateExpiredCustomerVoucher";

export default describe("Daily Job", () => {
  it("Update Expired Customer Voucher", async (done) => {
    expect.assertions(1);
    await updateExpiredCustomerVoucher();
    done();
  });
});
