import axios, { AxiosInstance } from "axios";
import { EventEmitter } from "events";
import { Request } from "express";
import _ from "lodash";

import { BaseError } from "../base/error";
import { logger } from "../loaders/logger";
import cache from "./cache";

class Casso extends EventEmitter {
  public api: AxiosInstance;
  constructor() {
    super();
    this.api = axios.create({
      baseURL: "https://oauth.casso.vn/v2",
      headers: {
        "content-type": "application/json",
      },
    });
    this.api.interceptors.response.use(
      (response) => {
        // console.log("response", response);
        if (response && response.data) return response.data;
        return response;
      },
      (error) => {
        logger.error(`Lỗi Casso API`, error);
        throw new BaseError(500, "casso-error", `${error.message}`);
      }
    );
  }

  private tokenHeader(accessToken: string) {
    return { Authorization: `ApiKey ` + accessToken };
  }

  async getToken(apiKey: string) {
    return apiKey;
    const key = `cassos:token:${apiKey}`;
    // Láy token từ cache, mỗi token được lưu trữ 6 tiếng
    let tokenFromCache = await cache.get(key);
    if (_.isEmpty(tokenFromCache) == false) return tokenFromCache;

    logger.info(`Get Casso Token From API. Auth Code: ${apiKey}`);
    const res: any = await this.api.post("/token", { code: apiKey });
    await cache.set(key, res.access_token, 60 * 60 * 6); // Lưu trữ trong 6 tiếng
    return res.access_token;
  }

  getUser(accessToken: string) {
    return this.api
      .get("/userInfo", {
        headers: { ...this.tokenHeader(accessToken) },
      })
      .then((res) => res.data);
  }

  async syncTransaction(accessToken: string, bankNumber: string) {
    const key = `casso-sync:${bankNumber}:${accessToken}`;
    if (_.isEmpty(await cache.get(key)) == false) {
      // Bỏ quả không đồng bộ, chờ hết cache
    }
    await cache.set(key, "0", 60 * 2); // Chờ trong 2 phút
    return await this.api
      .post("/sync", { bank_acc_id: bankNumber }, { headers: { ...this.tokenHeader(accessToken) } })
      .then((res) => res.data);
  }

  createWebhook(accessToken: string, data: any) {
    return this.api
      .post("/webhooks", data, { headers: { ...this.tokenHeader(accessToken) } })
      .then((res) => res.data);
  }

  getWehhook(accessToken: string, webhookId: string) {
    return this.api
      .get(`/webhooks/${webhookId}`, {
        headers: { ...this.tokenHeader(accessToken) },
      })
      .then((res) => res.data);
  }

  updateWebhook(accessToken: string, webhookId: string, data: any) {
    return this.api
      .put(`/webhooks/${webhookId}`, data, {
        headers: { ...this.tokenHeader(accessToken) },
      })
      .then((res) => res.data);
  }

  deleteWebhook(accessToken: string, webhookId: number) {
    return this.api
      .delete(`/webhooks/${webhookId}`, { headers: { ...this.tokenHeader(accessToken) } })
      .then((res) => res.data);
  }

  deleteWebhookByUrl(accessToken: string, url: string) {
    return this.api
      .delete(`/webhooks`, {
        headers: { ...this.tokenHeader(accessToken) },
        params: { webhook: url },
      })
      .then((res) => res.data);
  }

  async regisWebhookByApiKey(apiKey: string, url: string, secureToken: string) {
    logger.info(`Đăng ký Casso webhook ${url}`);
    const token = await this.getToken(apiKey);
    // Delete Toàn bộ webhook đã đăng kí trước đó
    await this.deleteWebhookByUrl(token, url);
    // Tiến hành tạo webhook
    const data = {
      webhook: url,
      secure_token: secureToken,
      income_only: true,
    };
    return await this.createWebhook(token, data);
  }
}

export default new Casso();
