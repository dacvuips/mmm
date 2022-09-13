import NginxProxyManager from "nginx-proxy-manager-api";
import { configs } from "../configs";
import { logger } from "../loaders/logger";
const nginx = new NginxProxyManager({
  host: configs.nginx.host,
  username: configs.nginx.username,
  password: configs.nginx.password,
});
export default nginx;

nginx.on("ready", () => {
  logger.info(`Nginx Proxy Manager API Connected`);
});
