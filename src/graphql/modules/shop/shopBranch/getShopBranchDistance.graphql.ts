import { gql } from "apollo-server-express";
import _ from "lodash";

import { configs } from "../../../../configs";
import googleMap from "../../../../helpers/map/googleMap";
import { Context } from "../../../context";
import { IShopBranch } from "./shopBranch.model";

export default {
  schema: gql`
    extend type ShopBranch {
      distance(lat: Float!, lng: Float!): Float
    }
  `,
  resolver: {
    ShopBranch: {
      distance: async (root: IShopBranch, args: any, context: Context) => {
        switch (configs.delivery.estimateBranchDistanceBy) {
          case "google": {
            const res = await googleMap.getDistance(
              [{ lat: args.lat, lng: args.lng }],
              [{ lat: root.location.coordinates[1], lng: root.location.coordinates[0] }]
            );
            const distance = _.get(res.data, "rows[0].elements[0].distance.value", 0);
            if (distance > 0) return parseFloat((distance / 1000).toFixed(2));
          }
          default:
            return parseFloat(
              calcCrow(
                root.location.coordinates[1],
                root.location.coordinates[0],
                args.lat,
                args.lng
              ).toFixed(1)
            );
        }
      },
    },
  },
};
//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1.1;
}

// Converts numeric degrees to radians
function toRad(Value: number) {
  return (Value * Math.PI) / 180;
}
