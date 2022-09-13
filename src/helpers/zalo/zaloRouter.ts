import crypto from "crypto";
import express from "express";

import zalo from ".";
import { configs } from "../../configs";
import { logger as BaseLogger } from "../../loaders/logger";

export type AuthCallbackPayload = {
  state: string;
  oaId: string;
  accessToken: string;
  refreshToken: string;
};

const logger = BaseLogger.child({ _reqId: "Zalo Router" });
const router = express.Router();

router.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const event = req.body;
    const signature = req.headers["x-zevent-signature"] as string;
    const validEventData = verifyWebhookEvent(event, signature);
    if (validEventData == false) {
      logger.info("Dữ liệu webhook bị thay đổi, bỏ qua");
      return;
    }
    logger.info("event", { event });
    zalo.emit("event", event);
  } catch (err) {}
});

router.get("/webhook", async (req, res) => {
  return res.sendStatus(200);
});

function verifyWebhookEvent(event: any, signature: string) {
  const webhookSecret = configs.zalo.webhookSecret;
  const jsonString = event.app_id + JSON.stringify(event) + event.timestamp + webhookSecret;
  const hash = "mac=" + crypto.createHash("sha256").update(jsonString).digest("hex");
  return signature == hash;
}

export default function (app: any) {
  app.use("/_zalo", router);
}
