import { sleep } from "../../../helpers/functions/sleep";
import GlobalCustomerConvertJob from "../globalCustomerConvert.job";

export default test("Check globalCustomerConvert", async () => {
  console.log("execute Job globalCustomerConvert");
  await GlobalCustomerConvertJob.execute({} as any);
  await sleep(30000);
  console.log("done");
});
