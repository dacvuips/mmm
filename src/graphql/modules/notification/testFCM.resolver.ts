import { firebaseHelper } from "../../../helpers/firebase.helper";
import { Context } from "../../context";

const Mutation = {
  testFCM: async (root: any, args: any, context: Context) => {
    const { deviceToken, title, body, data } = args;
    const notifyData = {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      ...data,
    };
    const notification = { title, body };
    return firebaseHelper.messaging.send({
      notification,
      data: notifyData,
      token: deviceToken,
      android: {
        priority: "high",
        notification: { ...notification, sound: "default" },
        data: notifyData,
      },
      apns: {
        payload: {
          aps: {
            sound: "sound.aiff",
          },
        },
      },
    });
  },
};

export default { Mutation };
