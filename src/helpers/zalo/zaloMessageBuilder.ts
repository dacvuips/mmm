import _ from "lodash";

export class ZaloMessageBuilder {
  constructor(public data: any = {}) {}

  text(text: string) {
    _.set(this.data, "message.text", text);
    return this;
  }

  media(element: {
    media_type: "image" | "gif";
    attachment_id?: string;
    url?: string;
    width?: number;
    height?: number;
  }) {
    _.set(this.data, "message.attachment", {
      type: "template",
      payload: { template_type: "media", elements: [element] },
    });
    return this;
  }

  list(elements: any[] = []) {
    _.set(this.data, "message.attachment", {
      type: "template",
      payload: {
        template_type: "list",
        elements,
      },
    });
    return this;
  }

  buttons(buttons: any[] = []) {
    _.set(this.data, "message.attachment.type", "template");
    _.set(this.data, "message.attachment.payload.buttons", buttons);
    return this;
  }

  requestUserInfo(element: { title: string; subtitle: string; image_url: string }) {
    _.set(this.data, "message.attachment", {
      type: "template",
      payload: { template_type: "request_user_info", elements: [element] },
    });
    return this;
  }

  file(fileToken: string) {
    _.set(this.data, "message.attachment", { type: "file", payload: { token: fileToken } });
    return this;
  }

  send(userId: string) {
    const data = { ...this.data };
    _.set(data, "recipient", { user_id: userId });
    return { ...data };
  }

  reply(messageId: string) {
    const data = { ...this.data };
    _.set(data, "recipient", { message_id: messageId });
    return { ...data };
  }

  broadcast(
    target: {
      ages?: string;
      gender?: string;
      locations?: string;
      cities?: string;
      platform?: string;
    } = {}
  ) {
    const data = { ...this.data };
    _.set(data, "recipient", { target });
    return { ...data };
  }
}
