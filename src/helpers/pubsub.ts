import { RedisPubSub } from "graphql-redis-subscriptions";
import { redisClient } from "../helpers/redis";

export const pubsub = new RedisPubSub({
  publisher: redisClient(),
  subscriber: redisClient(),
});
