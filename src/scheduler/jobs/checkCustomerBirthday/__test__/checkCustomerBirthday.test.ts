import { sleep } from "../../../../helpers/functions/sleep";
import CheckCustomerBirthdayJob from "../checkCustomerBirthday.job";

export default test("Check Customer Birthday", async () => {
  console.log("execute Job CheckCustomerBirthday");
  await CheckCustomerBirthdayJob.execute({} as any);
  await sleep(30000);
  console.log("done");
});
