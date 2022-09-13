import { Dictionary } from "lodash";
import { CrudService } from "../../../base/crudService";
import { logger } from "../../../loaders/logger";
import { TriggerActionModule } from "./actions/common";
import sendManychatAction from "./actions/sendManychatAction";
import sendNotificationAction from "./actions/sendNotificationAction";
import sendSmaxbotAction from "./actions/sendSmaxbotAction";
import sendZaloAction from "./actions/sendZaloAction";
import { ITrigger, TriggerModel } from "./trigger.model";
class TriggerService extends CrudService<typeof TriggerModel> {
  actions: TriggerActionModule[] = [sendZaloAction, sendManychatAction];
  constructor() {
    super(TriggerModel);
  }
  async emitEvent(event: string, memberId: string, context: any) {
    // Gửi trigger
    const triggers = await TriggerModel.find({ memberId, event, active: true });
    for (const trigger of triggers) {
      try {
        await triggerService.call(trigger, context);
      } catch (err) {
        logger.error(`[${trigger.code} - ${event}] Call trigger error`, err);
      }
    }
  }

  async call(trigger: ITrigger, context: any) {
    for (const action of trigger.actions) {
      try {
        switch (action.type) {
          case "zalo":
            await sendZaloAction.handler(action.options, context);
            break;
          case "manychat":
            await sendManychatAction.handler(action.options, context);
            break;
          case "smaxbot":
            await sendSmaxbotAction.handler(action.options, context);
            break;
          case "notification":
            await sendNotificationAction.handler(action.options, context);
            break;
        }
      } catch (err) {
        logger.error(`Lỗi khi xử lý trigger`, err);
      }
    }
  }
}

const triggerService = new TriggerService();

export { triggerService };
