import Redis from "ioredis";
import { configs } from "../configs";

const redis = new Redis({
  host: configs.redis.host,
  port: configs.redis.port,
  password: configs.redis.password,
  keyPrefix: configs.redis.prefix,
  lazyConnect: true,
});

export default redis;

export const redisClient = () => {
  return new Redis({
    host: configs.redis.host,
    port: configs.redis.port,
    password: configs.redis.password,
    keyPrefix: configs.redis.prefix,
    lazyConnect: true,
  });
};
