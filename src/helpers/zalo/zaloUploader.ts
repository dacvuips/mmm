import fs from "fs";
import FormData from "form-data";
import zalo from ".";
import { logger as BaseLogger } from "../../loaders/logger";

const logger = BaseLogger.child({ _reqId: "ZaloUploader" });

class ZaloUploader {
  async uploadImage(token: string, path: string) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(path));
    return await zalo
      .api({
        method: "post",
        url: "/oa/upload/image",
        headers: { access_token: token, ...formData.getHeaders() },
        data: formData,
      })
      .then((res) => res.data);
  }

  async uploadGif(token: string, path: string) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(path));
    return await zalo
      .api({
        method: "post",
        url: "/oa/upload/gif",
        headers: { access_token: token, ...formData.getHeaders() },
        data: formData,
      })
      .then((res) => res.data);
  }

  async uploadFile(token: string, path: string) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(path));
    return await zalo
      .api({
        method: "post",
        url: "/oa/upload/file",
        headers: { access_token: token, ...formData.getHeaders() },
        data: formData,
      })
      .then((res) => res.data);
  }
}

export default new ZaloUploader();
