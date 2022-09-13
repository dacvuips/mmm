import { EmailModel, EmailType, IEmail } from "./email.model";
import chalk from "chalk";

async function setDefaultEmail(type: EmailType, data: IEmail) {
  const email = await EmailModel.findOne({ type });
  if (email) return;
  console.log(chalk.yellow("==> Khởi tạo email", data.name));
  await EmailModel.create({ ...data, type: type });
  console.log(chalk.green("==> Đã tạo mail", data.name));
}
export default async () => {
  // await setDefaultEmail(
  //   EmailType.GROUP_INVITE,
  //   require("../../../../public/emailTemplate/groupInvite.json")
  // );
};
