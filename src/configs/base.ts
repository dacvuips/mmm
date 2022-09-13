import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { compact, get, toNumber, upperCase } from "lodash";
const pjson = require("../../package.json");

if (fs.existsSync(path.join(__dirname, "../../.env"))) {
  console.log(".env exists");
  dotenv.config({ path: path.join(__dirname, "../../.env") });
} else if (fs.existsSync(path.join(__dirname, "../../.env.example"))) {
  console.log(".env not exists");
  dotenv.config({ path: path.join(__dirname, "../../.env.example") }); // you can delete this after you create your own .env file!
} else {
  console.log(".env.example not exists");
}

// if (!process.env.FIREBASE) throw new Error("Chưa config firebase");
if (!process.env.FIREBASE_VIEW) throw new Error("Chưa config firebase views");
if (!process.env.MONGODB_URI) throw new Error("Missing Config MONGODB_URI");

export default {
  name: pjson.name,
  version: pjson.version,
  description: pjson.description,
  port: process.env.PORT || 3000,
  basicAuth: {
    users: { mcom: "mcom@123" },
  },
  winston: {
    db: process.env.MONGO_LOG || "",
    level: process.env.LOG_LEVEL || `silly`,
  },
  query: {
    limit: 10,
  },
  secretKey: process.env.SECRET || "HkQlTCrDfYWezqEp494TjDUqBhSzQSnn",
  timezone: "Asia/Ho_Chi_Minh",
  domain: process.env.DOMAIN || `http://localhost:5555`,
  firebase: JSON.parse(
    process.env.FIREBASE || `{"credential":{},"databaseURL":"https://mshop-1506c.firebaseio.com"}`
  ),
  firebaseView: process.env.FIREBASE_VIEW,
  firebaseScrypt: {
    signerKey: process.env.FIREBASE_SCRYPT_SIGNER_KEY,
    saltSeparator: process.env.FIREBASE_SCRYPT_SALT_SEPARATOR,
    rounds: toNumber(process.env.FIREBASE_SCRYPT_ROUNDS || "8"),
    memCost: toNumber(process.env.FIREBASE_SCRYPT_MEM_COST || "14"),
  },
  redis: {
    enable: false,
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASS,
    prefix: process.env.REDIS_PREFIX || pjson.name,
  },
  chatbot: {
    host: process.env.CHATBOT_HOST || "https://bot-server.mcom.app",
  },
  viettelPost: {
    host: "https://partner.viettelpost.vn/v2",
    token: process.env.VIETTEL_TOKEN,
    secret: process.env.VIETTEL_SECRET || "delivery@Secret123",
    printToken: process.env.VIETTEL_PRINT_TOKEN,
  },
  vietnamPost: {
    host: "https://donhang.vnpost.vn/api/api",
    token: process.env.VIETNAM_POST_TOKEN,
    publicKey:
      "3G3hLSrPwF4FBBA/0yEZkNwX2++SSCIaGKeb8TBb6loc3NRSvo0oDR0dO7c6bk/CgizQ7ZT0d/rlZunV4UbP2gzVl3p6VN2ykoDhnmdGClk1+js6EqWIWztZrcF2mAq0s3OHIH4tLnLIGWbMws1nQNRUoJDwfGVSZcLzFnWRWb21kYjpSbu44Y2IiQX6y3n2YR9VPyxI9VMYkrTvdzN/cTFyRhrPaH15pXzkQ8zQl561mSYGcucJl56GX9hRaho5zuNSNWq+oVXdIBE6UOVVX4TXJJJw+iKlLYO/2OryJ3fNLKWajBaYGzxZ6QLjpfr/HYtAPGLARLtDtean7JjE5Q==",
  },
  nextDev: (process.env.NEXT_DEV || "FALSE").toUpperCase() == "TRUE",
  ahamove: {
    apiKey: process.env.AHAMOVE_API_KEY || "4cd543d3e4e4fbe97db216828c18644f77558275",
  },
  scheduler: {
    includes: compact(get(process.env, "SCHEDULER_INCLUDES", "").split(",")),
    excludes: compact(get(process.env, "SCHEDULER_EXCLUDES", "").split(",")),
  },
  momo: {
    mode: process.env.MOMO_MODE || "sanbox",
    partnerCode: process.env.MOMO_PARTNERCODE,
    partnerName: process.env.MOMO_PAERNERNAME,
    publicKey: process.env.MOMO_PUBLICKEY,
    accessKey: process.env.MOMO_ACCESSKEY,
    secretKey: process.env.MOMO_SECRETKEY,
    iosSchemeId: process.env.MOMO_IOS_SCHEME_ID,
    salary: {
      mode: process.env.MOMO_SALARY_MODE || "test",
      user1: process.env.MOMO_SALARY_USER_1 || "test-salary",
      pass1: process.env.MOMO_SALARY_PASS_1 || "12345678",
      user2: process.env.MOMO_SALARY_USER_2 || "test-salary2",
      pass2: process.env.MOMO_SALARY_PASS_2 || "12345678",
    },
  },
  ssl: {
    enable: (process.env.SSL_ENABLE || "FALSE") == "TRUE" ? true : false,
    key: "ssl/server.key",
    cert: "ssl/server.cert",
  },
  zalo: {
    appId: process.env.ZALO_APP_ID,
    appSecret: process.env.ZALO_APP_SECRET,
    webhookSecret: process.env.ZALO_WEBHOOK_SECRET,
    auth: {
      redirectUrl: "/shop/settings/associate",
    },
    redirectDomain: process.env.ZALO_REDIRECT_DOMAIN,
  },
  esms: {
    apiKey: process.env.ESMS_APIKEY,
    secret: process.env.ESMS_SECRET,
    brandName: process.env.ESMS_BRANDNAME,
    sandbox: (process.env.ESMS_SANDBOX || "FALSE") == "TRUE" ? true : false,
  },
  agenda: {
    enableDash: process.env.AGENDA_ENABLE_DASH == "TRUE" ? true : false,
    auth: {
      username: process.env.AGENDA_AUTH_USERNAME || "admin",
      password: process.env.AGENDA_AUTH_PASSWORD || "admin",
    },
  },
  nginx: {
    host: process.env.NGINX_HOST || "https://dns.mcom.app",
    username: process.env.NGINX_USERNAME || "admin",
    password: process.env.NGINX_PASSWORD || "admin",
  },
  delivery: {
    estimateDistanceBy: process.env.DELIVERY_ESTIMATE_DISTANCE_BY || "goongjs",
    estimateBranchDistanceBy: process.env.DELIVERY_ESTIMATE_BRANCH_DISTANCE_BY || "direct",
  },
  auth: {
    useSession: toBoolean(process.env.AUTH_USE_SESSION || "TRUE"),
    sessionExpries: toNumber(process.env.AUTH_SESSION_EXPIRES || "86400"), // default 1 day
    admin: {
      username: process.env.AUTH_ADMIN_USERNAME || "admin@gmail.com",
      password: process.env.AUTH_ADMIN_PASSWORD || "123123",
    },
  },
};

function toBoolean(value: string) {
  return upperCase(value) == "TRUE";
}
