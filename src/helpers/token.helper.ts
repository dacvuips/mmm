import { configs } from "../configs";
import jwt from "jsonwebtoken";
import { ROLES } from "../constants/role.const";
import { ICustomer } from "../graphql/modules/customer/customer.model";
import { IGlobalCustomer } from "../graphql/modules/customer/globalCustomer/globalCustomer.model";

export interface IPayloadToken {
  pageId?: String;
  psid?: String;
  role: string;
  [name: string]: any;
}

export class TokenHelper {
  constructor() {}

  static generateToken(payload: IPayloadToken, expiresIn: string = "30d"): string {
    return jwt.sign(payload, configs.secretKey, { expiresIn: expiresIn });
  }

  static decodeToken(token: string) {
    return jwt.verify(token, configs.secretKey);
  }

  static getAdministratorToken() {
    return this.generateToken({
      role: ROLES.ADMIN,
    });
  }
  static getCustomerToken(customer: ICustomer) {
    return TokenHelper.generateToken({
      role: ROLES.CUSTOMER,
      _id: customer._id,
      memberId: customer.memberId,
      username: customer.name,
    });
  }

  static getGlobalCustomerToken(globalCustomer: IGlobalCustomer) {
    return TokenHelper.generateToken({
      role: ROLES.GLOBALCUSTOMER,
      _id: globalCustomer._id,
      username: globalCustomer.name,
    });
  }
}
