import { BaseModel, CrudRepository } from "./crud.repo";
import { TriggerGroup } from "./trigger-group.repo";

export interface Trigger extends BaseModel {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  memberId?: string;
  code?: string;
  name?: string;
  active?: boolean;
  event?: string;
  actions?: TriggerAction[];
  triggerGroupId?: string;
  triggerGroup?: TriggerGroup;
}
export class TriggerRepository extends CrudRepository<Trigger> {
  apiName: string = "Trigger";
  displayName: string = "chiến dịch";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    code: String
    name: String
    active: Boolean
    event: String
    triggerGroupId: string;
    actions: [Mixed]
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    code: String
    name: String
    active: Boolean
    event: String
    triggerGroupId: string;
    actions: [Mixed]
  `);

  async getTriggerEvents(): Promise<TriggerEvent[]> {
    return await this.query({
      query: `getTriggerEvents`,
    }).then((res) => res.data["g0"]);
  }
}

export const TriggerService = new TriggerRepository();

export interface TriggerEvent {
  id: string;
  name: string;
  events: TriggerSubEvent[];
  context: TriggerSubEvent[];
}
export interface TriggerSubEvent {
  id: string;
  name: string;
}

export type TriggerActionType = "manychat" | "zalo" | "smaxbot" | "notification";
export const TRIGGER_ACTION_TYPES: Option<TriggerActionType>[] = [
  { value: "manychat", label: "ManyChat", color: "brand" },
  { value: "zalo", label: "Zalo", color: "info" },
  { value: "smaxbot", label: "Smaxbot", color: "slate" },
  { value: "notification", label: "Thông báo", color: "danger" },
];

export type TriggerNotificationActionType = "NONE" | "WEBSITE" | "ORDER" | "PRODUCT";
export const TRIGGER_NOTIFICATION_ACTION_TYPES: Option<TriggerNotificationActionType>[] = [
  { value: "NONE", label: "Không có" },
  { value: "WEBSITE", label: "Link Website" },
  { value: "ORDER", label: "Mã đơn hàng" },
  { value: "PRODUCT", label: "Sản phẩm" },
];

export type MessagingTag =
  | "CONFIRMED_EVENT_UPDATE"
  | "POST_PURCHASE_UPDATE"
  | "ACCOUNT_UPDATE"
  | "HUMAN_AGENT";
export const MESSAGING_TAGS: Option<MessagingTag>[] = [
  { value: "CONFIRMED_EVENT_UPDATE", label: "Cập nhật sự kiện" },
  { value: "POST_PURCHASE_UPDATE", label: "Cập nhật thanh toán" },
  { value: "ACCOUNT_UPDATE", label: "Cập nhật tài khoản" },
  { value: "HUMAN_AGENT", label: "Tác nhân" },
];

export type SmaxbotType = "block" | "text";
export const SMAXBOT_TYPES: Option<SmaxbotType>[] = [
  { value: "block", label: "Kịch bản" },
  // { value: "text", label: "Tin nhắn" },
];

// const MESSAGiNG_TAG: Option[] = [
//   { value: "CONFIRMED_EVENT_UPDATE", label: "Cập nhật sự kiện", color: "warning" },
//   { value: "POST_PURCHASE_UPDATE", label: "Cập nhật thanh toán", color: "info" },
//   { value: "ACCOUNT_UPDATE", label: "Cập nhật tài khoản", color: "slate" },
//   { value: "HUMAN_AGENT", label: "Tác nhân", color: "Tác nhân" },
// ];

export type TriggerAction = {
  type: TriggerActionType;
} & (
    | {
      type: "manychat" | "zalo";
      options: {
        text;
      };
    }
    | {
      type: "smaxbot";
      options: {
        type: string;
        botId: string;
        botToken: string;
        blockId: string;
        messagingTag: string;
        text: string;
        attr: { key: string; value: string }[];
      };
    }
    | {
      type: "notification";
      options: {
        title: string;
        body: string;
        action: {
          type: "WEBSITE" | "ORDER" | "PRODUCT";
          active: boolean;
          link?: string;
          orderId?: string;
          productId?: string;
        };
      };
    }
  );

export const TRIGGER_STATUS: Option[] = [
  { value: true, label: "Đang hoạt động", color: "success" },
  { value: false, label: "Chưa kích hoạt", color: "danger" },
];
