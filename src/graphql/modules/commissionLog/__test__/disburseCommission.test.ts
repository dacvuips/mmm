import { Types } from "mongoose";
import { CommissionLogBuilder } from "../commissionLogBuilder";

export default test("Disburse Commission Manual", async () => {
  const customerId = "60d1c3c158e9517079287a39";
  const memberId = "60b70f29dbf2e47de3afca33";

  const commissionLogBuilder = new CommissionLogBuilder(memberId, customerId);

  const disburseLog = commissionLogBuilder.disburse(10000, "manual", "Thủ công").build();

  await disburseLog.save();

  console.log("disburseLog", disburseLog);
  console.log("DONE");
});
