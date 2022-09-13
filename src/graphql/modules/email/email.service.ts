import { CrudService } from "../../../base/crudService";
import { EmailModel } from "./email.model";
import nodemailer from "nodemailer";
import { counterService } from "../counter/counter.service";
import { SettingKey } from "../../../configs/settingData";
import { SettingHelper } from "../setting/setting.helper";
class EmailService extends CrudService<typeof EmailModel> {
  constructor() {
    super(EmailModel);
  }
}

const emailService = new EmailService();

export { emailService };
