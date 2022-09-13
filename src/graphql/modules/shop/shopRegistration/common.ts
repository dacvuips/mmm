import { SettingKey } from "../../../../configs/settingData";
import { UtilsHelper } from "../../../../helpers";
import LocalBroker from "../../../../services/broker";
import { SettingHelper } from "../../setting/setting.helper";
import { IShopRegistration } from "./shopRegistration.model";

export async function sendApproveEmail(regis: IShopRegistration, password: any) {
  const [title, emailTemplate, appDomain, appTitle] = await SettingHelper.loadMany([
    SettingKey.EMAIL_REGIS_APPROVE_TITLE,
    SettingKey.EMAIL_REGIS_APPROVE,
    SettingKey.APP_DOMAIN,
    SettingKey.TITLE,
  ]);
  const context = {
    SHOP_NAME: regis.shopName,
    USERNAME: regis.email,
    PASSWORD: password,
    DASHBOARD_LINK: `${appDomain}/shop`,
  };
  const { subject, html } = UtilsHelper.parseObjectWithInfo({
    object: {
      subject: title,
      html: emailTemplate,
    },
    info: context,
  });
  LocalBroker.emit("email.send", { from: appTitle, to: regis.email, subject, html });
}
