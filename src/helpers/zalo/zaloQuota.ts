import zalo from ".";

class ZaloQuota {
  async message(token: string, messageId?: string) {
    return zalo
      .api("/oa/quota/message", {
        method: "post",
        headers: { access_token: token },
        data: messageId ? { message_id: messageId } : undefined,
      })
      .then((res) => res.data);
  }
}

export default new ZaloQuota();
