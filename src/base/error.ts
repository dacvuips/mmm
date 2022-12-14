import dotenv from "dotenv";
import express from "express";
// import Raven from 'raven';

// import { config } from '..';

dotenv.config();

// let sentry: Raven.Client;
// if (config.enableSentry) {
//   if (!process.env.SENTRY_CONNECTSTRING) throw new Error('Missing config SENTRY_CONNECTSTRING');
//   sentry = Raven.config(process.env.SENTRY_CONNECTSTRING).install();
// }

export interface IErrorInfo {
  status: number;
  code: string;
  message: string;
  data?: any;
}

export class BaseError extends Error {
  constructor(status: number, code: string, message: string, data?: any) {
    super(message);
    this.info = { status, code, message, data };
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
  info: IErrorInfo;
}
export class BaseErrorHelper {
  static handleError(func: (req: express.Request, rep: express.Response) => Promise<any>) {
    return (req: express.Request, res: express.Response) =>
      func
        .bind(this)(req, res)
        .catch((error: any) => {
          if (!error.info) {
            const err = this.somethingWentWrong();
            res.status(err.info.status).json(err.info);
            this.logUnknowError(error);
          } else {
            res.status(error.info.status).json(error.info);
          }
        });
  }
  static logUnknowError(error: Error) {
    console.log("*** UNKNOW ERROR ***");
    console.log(error);
    console.log("********************");
    // if (sentry) {
    //   try {
    //     sentry.captureException(error);
    //   } catch (err) {
    //     console.log('*** CANNOT CAPTURE EXCEPTION TO SENTRY ***');
    //     console.log(err.message);
    //     console.log('******************************************');
    //   }
    // }
  }
  static logError(prefix: string, logOption = true) {
    return (error: any) => {
      console.log(prefix, error.message || error, logOption ? error.options : "");
    };
  }
  // Unknow
  static somethingWentWrong(message?: string) {
    return new BaseError(500, "500", message || "C?? l???i x???y ra");
  }
  // Auth
  static unauthorized() {
    return new BaseError(401, "401", "Ch??a x??c th???c");
  }
  static badToken() {
    return new BaseError(401, "-1", "Kh??ng c?? quy???n truy c???p");
  }
  static tokenExpired() {
    return new BaseError(401, "-2", "M?? truy c???p ???? h???t h???n");
  }
  static permissionDeny() {
    return new BaseError(405, "-3", "Kh??ng ????? quy???n ????? truy c???p");
  }
  // Request
  static requestDataInvalid(message: string) {
    return new BaseError(403, "-4", "D??? li???u g???i l??n kh??ng h???p l??? " + message);
  }
  // External Request
  static externalRequestFailed(message: string) {
    return new BaseError(500, "-5", message);
  }
  // Mongo
  static mgRecoredNotFound(objectName: string = "d??? li???u y??u c???u") {
    return new BaseError(404, "-7", "Kh??ng t??m th???y " + objectName);
  }
  static mgQueryFailed(message: string) {
    return new BaseError(403, "-8", message || "Truy v???n kh??ng th??nh c??ng");
  }
  static branchNotWorking() {
    return new BaseError(403, "-9", "Chi nh??nh kh??ng l??m vi???c v??o ng??y n??y");
  }
  static recoredNotFound(message: string) {
    return new BaseError(404, "-10", `Kh??ng t??m th???y d??? li???u y??u c???u: ${message}`);
  }
}

export class ErrorHelper extends BaseErrorHelper {
  static userNotExist() {
    return new BaseError(403, "-103", "Ng?????i d??ng kh??ng t???n t???i");
  }
  static userExisted() {
    return new BaseError(403, "-104", "Ng?????i d??ng ???? t???n t???i");
  }
  static userRoleNotSupported() {
    return new BaseError(401, "-105", "Ng?????i d??ng kh??ng ???????c c???p quy???n");
  }
  static userError(message: string) {
    return new BaseError(403, "-106", "L???i ng?????i d??ng: " + message);
  }
  static duplicateError(key: string) {
    return new BaseError(403, "-107", `${key} ???? b??? tr??ng.`);
  }
  static readOnlyError(key: string) {
    return new BaseError(403, "-108", `${key} ch??? ???????c ph??p xem.`);
  }
  static createUserError(message: string) {
    return new BaseError(401, "-109", `L???i t???o ng?????i d??ng: ${message}`);
  }
  static updateUserError(message: string) {
    return new BaseError(401, "-110", `L???i c???p nh???t ng?????i d??ng: ${message}`);
  }
  static userPasswordNotCorrect() {
    return new BaseError(403, "-111", `M???t kh???u kh??ng ????ng.`);
  }
  static farmerPinNotCorrect() {
    return new BaseError(403, "-112", `M?? pin kh??ng ????ng`);
  }
  static deliveryStatusWrong() {
    return new BaseError(403, "-113", `Tr???ng th??i ????n h??ng kh??ng ????ng`);
  }
  static notEnoughtPoint() {
    return new BaseError(403, "-114", "T??i kho???n kh??ng ????? ??i???m");
  }
  static spinError(message: string) {
    return new BaseError(403, "-115", message);
  }
  static invalidPin() {
    return new BaseError(403, "-116", "M?? pin ph???i l?? 6 s???");
  }
  static validateJSONError(message: string = "") {
    return new BaseError(500, "-117", message);
  }
  static error(message: string) {
    return new BaseError(403, "-118", message);
  }

  static productNotExist() {
    return new BaseError(403, "-117", "S???n ph???m kh??ng t???n t???i");
  }
}
