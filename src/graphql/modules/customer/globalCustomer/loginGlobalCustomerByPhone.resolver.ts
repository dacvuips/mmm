import { firebaseHelper } from "../../../../helpers/firebase.helper";
import { GlobalCustomerModel, IGlobalCustomer } from "./globalCustomer.model";
import { Context } from "../../../context";
import { DeviceInfoModel } from "../../deviceInfo/deviceInfo.model";
import { TokenHelper } from "../../../../helpers/token.helper";
import { BaseError } from "../../../../base/error";

const Mutation = {
  loginGlobalCustomerByPhone: async (root: any, args: any, context: Context) => {
    const { idToken, deviceId, deviceToken } = args;
    let decode = await firebaseHelper.verifyIdToken(idToken);

    let globalCustomer: IGlobalCustomer;
    switch (decode.firebase.sign_in_provider) {
      case "phone": {
        let localPhoneNumber = decode.phone_number.replace("+84", "0");
        globalCustomer = await GlobalCustomerModel.findOne({ phone: localPhoneNumber });
        if (!globalCustomer) {
          globalCustomer = await GlobalCustomerModel.create({
            uid: decode.uid,
            name: "",
            email: "",
            phone: localPhoneNumber,
            signInProvider: decode.firebase.sign_in_provider,
          });
        } else {
          await globalCustomer.updateOne({
            $set: { uid: decode.uid, signInProvider: decode.firebase.sign_in_provider },
          });
        }
        break;
      }
      default: {
        throw new BaseError(404, "404", "Không hỗ trợ phương thức đăng nhập này");
      }
    }

    const token = TokenHelper.getGlobalCustomerToken(globalCustomer);
    const decodedToken: any = TokenHelper.decodeToken(token);
    context.isAuth = true;
    context.tokenData = decodedToken;
    context.token = token;

    await globalCustomer.updateOne({ $set: { "context.lastLoginAt": new Date() } });
    return {
      globalCustomer,
      token: token,
    };
  },
};
export default {
  Mutation,
};
