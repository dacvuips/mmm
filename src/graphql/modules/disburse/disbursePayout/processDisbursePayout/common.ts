import { IDisburse } from "../../disburse.model";
import { IDisbursePayout } from "../disbursePayout.model";

export type ProcessDisbursePayoutContext = {
  input: { payout: IDisbursePayout };
  meta: {
    disburse?: IDisburse;
    deliveryFileId?: string;
    payoutFileId?: string;
  };
};
