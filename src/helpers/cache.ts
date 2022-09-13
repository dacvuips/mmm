import Redis from "ioredis";
import Redlock from "redlock";
import { configs } from "../configs";

const redis = new Redis({
  host: configs.redis.host,
  port: configs.redis.port,
  password: configs.redis.password,
  keyPrefix: configs.redis.prefix,
});

const redlock = new Redlock([redis], {
  // the expected clock drift; for more details
  // see http://redis.io/topics/distlock
  driftFactor: 0.01, // multiplied by lock ttl to determine drift time

  // the max number of times Redlock will attempt
  // to lock a resource before erroring
  retryCount: 1,

  // the time in ms between attempts
  retryDelay: 10, // time in ms

  // the max time in ms randomly added to retries
  // to improve performance under high contention
  // see https://www.awsarchitectureblog.com/2015/03/backoff.html
  retryJitter: 10, // time in ms
});

/**
 * Set cache value
 *
 * @param {*} key
 * @param {*} value
 * @param {*} ttl seconds
 */
const set = async (key: string, value: string, ttl?: number) => {
  // const lock = await redlock.lock(`redlock:${key}`, 500);

  let result;
  if (ttl) {
    result = await redis.setex(key, ttl, value);
  } else {
    result = await redis.set(key, value);
  }

  // await lock.unlock();
  return result;
};

/**
 * Get value from key
 *
 * return true;
 * @param {*} key
 */
const get = async (key: string) => {
  // const lock = await redlock.lock(`redlock:${key}`, 500);
  const result = await redis.get(key);
  // await lock.unlock();

  return result;
};

/**
 *
 * Get value with TTL
 *
 * @param {*} key
 * @returns
 */
const getWithTTL = async (key: string) => redis.multi().ttl(key).get(key).exec();

/**
 * Delete key
 *
 * @param {*} key
 */
const del = async (key: string) => {
  const lock = await redlock.lock(`redlock:${key}`, 500);
  const result = await redis.del(key);
  await lock.unlock();
  return result;
};

/**
 * Set cache value
 *
 * @param {*} key
 * @param {*} field
 * @param {*} value
 */
const hset = async (key: string, field: string, value: string) => {
  const lock = await redlock.lock(`redlock:${key}:${field}`, 500);
  const result = await redis.hset(key, field, value);
  await lock.unlock();
  return result;
};

/**
 * Get value from key
 *
 * @param {*} key
 * @param {*} field
 */
const hget = async (key: string, field: string) => {
  const lock = await redlock.lock(`redlock:${key}:${field}`, 500);
  const result = await redis.hget(key, field);
  await lock.unlock();
  return result;
};

/**
 * Get value from key wihtout lock
 * @param {*} key
 * @param {*} field
 * @returns
 */
const hgetWithoutLock = async (key: string, field: string) => redis.hget(key, field);

/**
 * Get value from key
 *
 * @param {*} key
 */
const hgetall = async (key: string) => redis.hgetall(key);

/**
 * Delete key/field
 *
 * @param {*} key
 * @param {*} field
 */
const hdel = async (key: string, field: string) => {
  const lock = await redlock.lock(`redlock:${key}:${field}`, 500);
  const result = await redis.hdel(key, field);
  await lock.unlock();
  return result;
};

const incr = async (key: string) => {
  return new Promise<number>((resolve, reject) =>
    redis.incr(key, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    })
  );
};

const hincr = async (key: string, field: string, increment: number = 1) => {
  return new Promise<number>((resolve, reject) =>
    redis.hincrby(key, field, increment, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply);
    })
  );
};

/** Check key exists */
const exists = async (key: string) => {
  return new Promise<boolean>((resolve, reject) =>
    redis.exists(key, (err, reply) => {
      if (err) return reject(err);
      return resolve(reply === 1);
    })
  );
};

export default {
  set,
  get,
  getWithTTL,
  del,
  hset,
  hgetWithoutLock,
  hget,
  hgetall,
  hdel,
  incr,
  hincr,
  exists,
};
