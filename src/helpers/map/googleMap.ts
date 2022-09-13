import { Client, DistanceMatrixResponse, LatLng } from "@googlemaps/google-maps-services-js";
import dotenv from "dotenv";
import _ from "lodash";

import cache from "../cache";
import { hashCode } from "../functions/hashCode";

dotenv.config();

const key = process.env["GOOGLE_MAPS_API_KEY"];
class GoogleMap {
  private _client = new Client();

  async getDistance(origins: LatLng[], destinations: LatLng[]) {
    const hash = `googlemap:distance:${hashCode(JSON.stringify({ origins, destinations }))}`;
    const result = JSON.parse(await cache.get(hash));
    if (_.isEmpty(result) == false) return { data: result } as DistanceMatrixResponse;

    const res = await this._client.distancematrix({
      params: {
        origins, // [{ lat: 10.758078194049508, lng: 106.65753611240946 } as any],
        destinations, // [{ lat: 10.789881879897505, lng: 106.7011222159035 } as any],
        key,
      },
    });

    await cache.set(key, JSON.stringify(res.data), 60 * 5); // cache  trong 5 phút
    return res;
  }
}

export default new GoogleMap();
