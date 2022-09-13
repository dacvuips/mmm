import { ServiceSchema } from "moleculer";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export default {
  name: "goongjs",
  settings: {
    apiKey: process.env.GOONGJS_API_KEY,
  },
  actions: {
    setApiKey: {
      params: { apiKey: { type: "string" } },
      handler(ctx) {
        this.settings.customKey = ctx.params.apiKey;
      },
    },
    estimateDistance: {
      cache: true,
      params: {
        origins: { type: "string" },
        destinations: { type: "string" },
        vehicle: { type: "string", default: "bike" },
        apiKey: { type: "string", optional: true },
      },
      handler(ctx) {
        const { origins, destinations, vehicle } = ctx.params;
        const apiKey = ctx.params.apiKey || this.settings.customKey || this.settings.apiKey;
        return axios
          .get("https://rsapi.goong.io/DistanceMatrix", {
            params: {
              api_key: apiKey,
              origins: origins,
              destinations: destinations,
              vehicle: vehicle,
            },
          })
          .then((res) => res.data);
      },
    },
  },
} as ServiceSchema;
