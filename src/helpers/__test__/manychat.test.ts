import { logger } from "../../loaders/logger";
import manychat from "../manychat";
import dotenv from "dotenv";
dotenv.config();

export default describe("Manychat", () => {
  const apiKey = process.env.MANYCHAT_APIKEY;

  it("Get Page Info", async (done) => {
    expect.assertions(1);
    const info = await manychat.getPageInfo(apiKey);
    logger.info("page info", { info });
    expect(info.id).toBeDefined();
    done();
  });

  it("Create Subscriber", async (done) => {
    expect.assertions(1);
    let subscriber = await manychat.findSubscriberByPhone(apiKey, "0916968263");
    if (!subscriber) {
      subscriber = await manychat.createSubscriber(apiKey, {
        firstName: "Dương",
        lastName: "Jerry",
        email: "diepmyduong@gmail.com",
        phone: "+84916968263",
        gender: "male",
        hasOptInEmail: false,
        hasOptInSms: false,
        consentPhrase: "",
      });
    }
    logger.info(`subscriber`, { subscriber });
    expect(subscriber.id).toBeDefined();
    done();
  });

  it("Send Message", async (done) => {
    expect.assertions(1);
    const sendData = manychat.sendDataBuilder
      .subscriber("4314971528579548")
      .messages([manychat.messageBuilder.message("Hello world").build()])
      .build();
    const result = await manychat.send(apiKey, sendData);
    expect(result).toBeDefined();
    done();
  });

  it("Get Subscriber By PSID", async (done) => {
    const psid = "4314971528579548";
    const data = await manychat.findSubscriberByPSID(apiKey, psid);
    expect(data.id).toEqual(psid);
    done();
  });
});
