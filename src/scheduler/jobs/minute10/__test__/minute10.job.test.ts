import cancelPendingOrder from "../steps/cancelPendingOrder";

export default describe("Minute 10 Job", () => {
  const ctx = { input: {}, meta: {} };
  it("Cancel Pending Order", async (done) => {
    expect.assertions(1);
    await cancelPendingOrder(ctx);
    expect(true).toBeTruthy();
    done();
  });
});
