import { SettingHelper } from "../graphql/modules/setting/setting.helper";
import expressLoader from "./express";
import { logger } from "./logger";
import "../scheduler";
import zalo from "../helpers/zalo";
import zaloRouter from "../helpers/zalo/zaloRouter";
export default ({ expressApp }: any) => {
  expressLoader({ app: expressApp });
  SettingHelper.seedingSetting();

  zaloRouter(expressApp);

  logger.info("Load Source Successfully!");
};
