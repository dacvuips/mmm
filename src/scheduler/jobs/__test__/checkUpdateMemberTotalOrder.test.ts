import { sleep } from "../../../helpers/functions/sleep";
import UpdateMemberTotalOrderJob from "../updateMemberTotalOrder.job";

export default test("Check UpdateMemberTotalOrderJob", async () => {
  console.log("execute Job UpdateMemberTotalOrderJob");
  await UpdateMemberTotalOrderJob.execute({} as any);
  await sleep(30000);
  console.log("done");
});
