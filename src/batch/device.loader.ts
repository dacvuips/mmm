import DataLoader from "dataloader";
import { get, keyBy } from "lodash";
import { Types } from "mongoose";
import { DeviceInfoModel, IDeviceInfo } from "../graphql/modules/deviceInfo/deviceInfo.model";
import { ttlCache } from "../helpers/ttlCache";

class DeviceLoader {
  public member = new DataLoader<string, IDeviceInfo[]>(
    (ids: string[]) => {
      return this.deviceAggregate(ids, "memberId");
    },
    { cache: true, cacheMap: ttlCache({ ttl: 10000, maxSize: 100 }) }
  );
  public customer = new DataLoader<string, IDeviceInfo[]>(
    (ids: string[]) => {
      return this.deviceAggregate(ids, "customerId");
    },
    { cache: true, cacheMap: ttlCache({ ttl: 10000, maxSize: 100 }) }
  );
  public staff = new DataLoader<string, IDeviceInfo[]>(
    (ids: string[]) => {
      return this.deviceAggregate(ids, "staffId");
    },
    { cache: true, cacheMap: ttlCache({ ttl: 10000, maxSize: 100 }) }
  );
  private deviceAggregate(ids: string[], key: string) {
    const objectIds = ids.map(Types.ObjectId);
    return DeviceInfoModel.aggregate([
      { $match: { [key]: { $in: objectIds } } },
      { $group: { _id: "$" + key, devices: { $push: "$$ROOT" } } },
    ]).then((list) => {
      const keyByIds = keyBy(list, "_id");
      return ids.map((id) => get(keyByIds, id + ".devices", []));
    });
  }
}

export const deviceLoader = new DeviceLoader();
