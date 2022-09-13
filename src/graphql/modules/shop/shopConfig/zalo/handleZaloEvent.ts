import zalo from "../../../../../helpers/zalo";
import { logger } from "../../../../../loaders/logger";
import { getShopConfigByOAId, ZaloEventContext } from "./common";
import followOA from "./events/followOA";

export default async function execute() {
  zalo.on("event", async (event) => {
    logger.info(`Sự kiện Zalo`, { event });
    const ctx: ZaloEventContext = {
      logger: logger.child({ _reqId: "Zalo Event" }),
      event: event,
      shopConfig: await getShopConfigByOAId(event.oa_id),
    };
    switch (event.event_name) {
      case "follow":
        return followOA(ctx);
    }
  });
}
