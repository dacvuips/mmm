import casso from "../casso";

export default describe("casso", () => {
  let dataframe: any = {
    apiKey: "beac6810-08b7-11ec-804d-fb896fac4f7f",
    url: "https://webhook.site/a1d97727-c7bc-4954-8398-9f1d5b1ef8d5",
    secretToken: "123123",
  };
  it("Get Token", async (done) => {
    expect.assertions(1);
    dataframe.token = await casso.getToken(dataframe.apiKey);
    expect(dataframe.token).toBeDefined();
    done();
  });

  it("Get User Info", async (done) => {
    expect.assertions(1);
    dataframe.userInfo = await casso.getUser(dataframe.token);
    expect(dataframe.userInfo).toBeDefined();
    done();
  });

  it("Regis Webhook", async (done) => {
    expect.assertions(1);
    const { apiKey, url, secretToken } = dataframe;
    dataframe.webhook = await casso.regisWebhookByApiKey(apiKey, url, secretToken);
    // console.log("webhook", dataframe.webhook);
    expect(dataframe.webhook).toBeDefined();
    done();
  });

  it("Get Webhook", async (done) => {
    expect.assertions(1);
    const {
      token,
      webhook: { id },
    } = dataframe;
    const webhook = await casso.getWehhook(token, id);
    expect(webhook.id).toEqual(id);
    done();
  });

  it("Delete Webhook", async (done) => {
    expect.assertions(1);
    const {
      token,
      webhook: { id },
    } = dataframe;
    await casso.deleteWebhook(token, id);
    expect(await casso.getWehhook(token, id)).toBeNull();
    done();
  });
});
