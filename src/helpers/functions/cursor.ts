import { reject } from "lodash";
import { QueryCursor } from "mongoose";

export function waitForCursor(cursor: QueryCursor<any>) {
  return new Promise((resolve) => {
    cursor.on("end", () => {
      console.log("cursor end");
      resolve(true);
    });

    cursor.on("error", (err) => {
      console.log("cursor error", err);
      reject(err);
      cursor.close();
    });
  });
}
