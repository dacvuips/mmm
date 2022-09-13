import axios, { AxiosInstance } from "axios";
import { EventEmitter } from "events";
import _ from "lodash";
import { BaseError } from "../base/error";
import { logger } from "../loaders/logger";

class Manychat extends EventEmitter {
  public api: AxiosInstance;

  constructor() {
    super();
    this.api = axios.create({
      baseURL: "https://api.manychat.com",
      headers: { "content-type": "application/json" },
    });
    this.api.interceptors.response.use(
      (response) => {
        // console.log("response", response);
        if (response && response.data) return response.data;
        return response;
      },
      (error) => {
        logger.error(`Lỗi API ManyChat`, error);
        if (error.response) {
          logger.error("Error Data", error.response.data);
        }
        throw new BaseError(500, "manychat-error", `${error.message}`);
      }
    );
  }

  get sendDataBuilder() {
    return new SendDataBuilder();
  }

  get messageBuilder() {
    return new MessageBuilder();
  }

  private tokenHeader(apiKey: string) {
    return { Authorization: `Bearer ` + apiKey };
  }

  async getPageInfo(apiKey: string) {
    return await this.api
      .get("/fb/page/getInfo", { headers: { ...this.tokenHeader(apiKey) } })
      .then((res) => res.data);
  }

  async createPageCustomField(
    apiKey: string,
    data: {
      caption: string;
      type: string;
      description: string;
    }
  ) {
    return await this.api
      .post(`/fb/page/createCustomField`, data, { headers: { ...this.tokenHeader(apiKey) } })
      .then((res) => res.data.field);
  }

  async getPageCustomFields(apiKey: string) {
    return await this.api
      .get(`/fb/page/getCustomFields`, {
        headers: { ...this.tokenHeader(apiKey) },
      })
      .then((res) => res.data);
  }

  async findSubscriberByPSID(apiKey: string, psid: string) {
    return await this.api
      .get(`/fb/subscriber/getInfo`, {
        params: { subscriber_id: psid },
        headers: { ...this.tokenHeader(apiKey) },
      })
      .then((res) => res.data);
  }

  async findSubscriberByCustomField(apiKey: string, fieldId: number, value: string) {
    return await this.api
      .get(`/fb/subscriber/findByCustomField`, {
        params: { field_id: fieldId, field_value: value },
        headers: { ...this.tokenHeader(apiKey) },
      })
      .then((res) => res.data);
  }

  async findSubscriberByPhone(apiKey: string, phone: string) {
    const parsedPhone =
      "+84" + ("" + phone).replace(/^0/i, "").replace(/^84/i, "").replace(/^\+84/i, "");
    logger.info(`Tìm kiếm subscriber, phone: ${parsedPhone}`);
    return this.api
      .get("/fb/subscriber/findBySystemField", {
        params: { phone: parsedPhone },
        headers: { ...this.tokenHeader(apiKey) },
      })
      .then((res) => res.data);
  }

  async createSubscriber(
    apiKey: string,
    data: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      gender: string;
      hasOptInSms: boolean;
      hasOptInEmail: boolean;
      consentPhrase: string;
    }
  ) {
    const parsedPhone =
      "+84" + ("" + data.phone).replace(/^0/i, "").replace(/^84/i, "").replace(/^\+84/i, "");
    const createPayload = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: parsedPhone,
      email: data.email,
      gender: data.gender,
      has_opt_in_sms: data.hasOptInSms,
      has_opt_in_email: data.hasOptInEmail,
      consent_phrase: data.consentPhrase,
    };
    logger.info(`Tạo manychat subscriber`, { createPayload });
    return await this.api
      .post(`/fb/subscriber/createSubscriber`, createPayload, {
        headers: { ...this.tokenHeader(apiKey) },
      })
      .then((res) => res.data);
  }

  async send(apiKey: string, data: any) {
    return this.api
      .post(`/fb/sending/sendContent`, data, { headers: { ...this.tokenHeader(apiKey) } })
      .then((res) => res.data);
  }
}
export default new Manychat();

class SendDataBuilder {
  private _data: any = {
    subscriber_id: 0,
    data: {
      version: "v2",
      content: {
        messages: [],
        actions: [],
        quick_replies: [],
      },
    },
    message_tag: "POST_PURCHASE_UPDATE",
  };

  subscriber(id: string) {
    _.set(this._data, "subscriber_id", id);
    return this;
  }
  messageTag(tag: string) {
    _.set(this._data, "message_tag", tag);
    return this;
  }
  actions(actions: any[]) {
    _.set(this._data, "data.content.actions", actions);
    return this;
  }
  quickReplies(replies: any[]) {
    _.set(this._data, "data.content.quick_replies", replies);
    return this;
  }
  messages(messages: any[]) {
    _.set(this._data, "data.content.messages", messages);
    return this;
  }
  build() {
    return { ...this._data };
  }
}

class MessageBuilder {
  private _message: any = {};
  build() {
    return { ...this._message };
  }
  message(content: string) {
    _.set(this._message, "type", "text");
    _.set(this._message, "text", content);
    return this;
  }
  buttons(buttons: any[]) {
    _.set(this._message, "buttons", buttons);
    return this;
  }
}
