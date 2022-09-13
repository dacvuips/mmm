import zaloOa from "../zaloOa";

export default describe("Zalo OA", () => {
  const accessToken = process.env.ZALO_TOKEN;

  it("getInfo", async (done) => {
    expect.assertions(1);

    const oaInfo = await zaloOa.getInfo(accessToken);

    console.log({ oaInfo });

    expect(oaInfo.oa_id).toBeDefined();
    done();
  });

  it("getFollowers", async (done) => {
    expect.assertions(1);

    const data = await zaloOa.getFollowers(accessToken);

    console.log(JSON.stringify(data, null, 2));

    expect(data).toBeDefined();
    done();
  });

  it("getProfile", async (done) => {
    expect.assertions(1);

    const userId = "7548498899888327582";

    const data = await zaloOa.getProfile(accessToken, userId);

    console.log(JSON.stringify(data, null, 2));

    expect(data.user_id).toEqual(userId);
    done();
  });

  it("updateProfile", async (done) => {
    expect.assertions(1);

    const userId = "2682426638592540262";

    await zaloOa.updateProfile(accessToken, {
      user_id: userId,
      name: "Hung edit",
      phone: "123123123",
    });

    expect(true).toBeTruthy();
    done();
  });

  it("getTags", async (done) => {
    expect.assertions(1);

    const tags = await zaloOa.getTags(accessToken).catch((err) => console.log("err", err));

    console.log({ tags });

    expect(tags).toBeDefined();
    done();
  });
});
