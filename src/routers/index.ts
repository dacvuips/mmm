import path from "path";
import express from "express";
import { ErrorHelper } from "../base/error";
import { UtilsHelper } from "../helpers/utils.helper";

const router = express.Router() as any;
const RouterFiles = UtilsHelper.walkSyncFiles(path.join(__dirname));

function onError(res: express.Response, error: any) {
  // if (!error.info) {
  //   ErrorHelper.logUnknowError(error);
  //   const err = ErrorHelper.somethingWentWrong();
  //   res.status(err.info.status).json(err.info);
  // } else {
  //   res.status(error.info.status).json(error.info);
  // }
  return res.status(error?.info?.status || 500).json({
    code: error?.info?.status || 500,
    message: error.info || error.message,
  });
}

RouterFiles.filter((f) => /(.*).route.js$/.test(f)).map((f) => {
  const { default: routes } = require(f);
  for (const route of routes) {
    router[route.method](route.path, route.midd, (req: express.Request, res: express.Response) =>
      route.action(req, res).catch((error: any) => onError(res, error))
    );
  }
});

export default router;
