import { CommissionLogModel, CommissionLogType, ICommissionLog } from "./commissionLog.model";

export class CommissionLogBuilder {
  data: any = {};
  constructor(memberId: string, customerId: string) {
    this.data.memberId = memberId;
    this.data.customerId = customerId;
  }

  disburse(value: number, type: "manual" | "momo", content?: string, attachments?: string[]) {
    this.data.value = -Math.abs(value);
    switch (type) {
      case "manual":
        this.data.type = CommissionLogType.DISBURSE_COMMISSION_MANUAL;
        this.data.content = content;
        this.data.attachments = attachments;
        break;
      case "momo":
        this.data.type = CommissionLogType.DISBURSE_COMMISSION_MOMO;
        break;
    }
    return this;
  }

  build() {
    return new CommissionLogModel(this.data);
  }
}
