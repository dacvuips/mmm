import axios, { AxiosInstance } from "axios";
import { EventEmitter } from "events";
import qs from "qs";
import { URL } from "url";

import { BaseError } from "../../base/error";
import { configs } from "../../configs";
import { logger as baseLogger } from "../../loaders/logger";

const logger = baseLogger.child({ _reqId: "Zalo" });

const ENDPOINT = {
  OPEN_API: "https://openapi.zalo.me/v2.0",
  AUTH: "https://oauth.zaloapp.com/v4",
};

class Zalo extends EventEmitter {
  private _appId = configs.zalo.appId;
  private _appSecret = configs.zalo.appSecret;
  public auth: AxiosInstance;
  public api: AxiosInstance;

  constructor() {
    super();

    this.auth = axios.create({
      baseURL: ENDPOINT.AUTH,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
    this.auth.interceptors.response.use(
      (response) => {
        if (response?.data?.error) {
          logger.error(`Lỗi Zalo API`, response.data);
          throw new BaseError(500, "zalo-error", response.data.error_name);
        }
        return response;
      },
      (error) => {
        logger.error(`Lỗi Zalo API`, error);
        throw new BaseError(500, "zalo-error", `${error.message}`);
      }
    );

    this.api = axios.create({
      baseURL: ENDPOINT.OPEN_API,
      headers: {
        "content-type": "application/json",
      },
    });
    this.api.interceptors.response.use(
      (response) => {
        // console.log(response);
        if (response?.data?.error && response?.data?.error != 0) {
          logger.error(`Lỗi Zalo API`, response.data);
          throw new BaseError(500, "zalo-error", response.data.message);
        } else {
          return response.data;
        }
      },
      (error) => {
        logger.error(`Lỗi Zalo API`, error);
        throw new BaseError(500, "zalo-error", `${error.message}`);
      }
    );
  }

  async getAccessTokenByAuthCode(code: string, codeVerifier: string) {
    const tokenData = await this.auth({
      method: "post",
      url: "/oa/access_token",
      headers: { secret_key: this._appSecret },
      data: qs.stringify({
        code,
        app_id: this._appId,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    }).then((res) => res.data);
    return tokenData;
  }

  async getAccessTokenByRefreshToken(token: string) {
    return await this.auth({
      method: "post",
      url: "/oa/access_token",
      headers: { secret_key: this._appSecret },
      data: qs.stringify({
        app_id: this._appId,
        grant_type: "refresh_token",
        refresh_token: token,
      }),
    }).then((res) => res.data);
  }

  async getAuthUrl(redirectUrl: string, codeChallenge: string, state: string) {
    const url = new URL(`${ENDPOINT.AUTH}/oa/permission`);
    url.searchParams.set("app_id", this._appId);
    url.searchParams.set("redirect_uri", redirectUrl);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("state", state);
    return url.href;
  }

  async message(token: string, data: any) {
    return await this.api({
      method: "post",
      url: "/oa/message",
      headers: { access_token: token },
      data,
    }).then((res) => res.data);
  }
}

export default new Zalo();
