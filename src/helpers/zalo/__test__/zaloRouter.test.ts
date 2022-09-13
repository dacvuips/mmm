import { configs } from "../../../configs";
import crypto from "crypto";

export default describe("Zalo Router", () => {
  it("Verify Webhook Event", async (done) => {
    const event = {
      event_name: "user_send_text",
      app_id: "1392296306176270752",
      sender: {
        id: "7548498899888327582",
      },
      recipient: {
        id: "506554428972805117",
      },
      message: {
        text: "hello world",
        msg_id: "ebaab21e3ab641ea18a5",
      },
      timestamp: "1633716429546",
      reorder_id: "1633716429546",
    };

    const oaId = "506554428972805117";
    const eventSignature = "mac=844f1dc22aef49d85f10ec9ad24631de1cb7eb8e311658d3b21a6eed8014f5c2";
    const webhookSecret = configs.zalo.webhookSecret;

    const jsonString = event.app_id + JSON.stringify(event) + event.timestamp + webhookSecret;
    console.log("jsonString", jsonString);
    const encode = "mac=" + crypto.createHash("sha256").update(jsonString).digest("hex");

    expect(encode).toEqual(eventSignature);
    done();
  });
});
