import zalo from "..";

export default describe("Zalo", () => {
  it("getAccessTokenByAuthCode", async (done) => {
    expect.assertions(1);
    const code = process.env.ZALO_AUTH_CODE;
    const key = "user01";

    const tokenData = await zalo.getAccessTokenByAuthCode(key, code);
    console.log({ tokenData });

    expect(tokenData.access_token).toBeDefined();
    done();
  });

  it("getAccessTokenByRefreshToken", async (done) => {
    // expect.assertions(1);
    const refeshToken = process.env.ZALO_REFRESH_TOKEN;

    const tokenData = await zalo.getAccessTokenByRefreshToken(refeshToken);
    console.log({ tokenData });

    expect(tokenData.access_token).toBeDefined();
    done();
  });
});
