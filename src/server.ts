import fs from "fs";
import https from "https";

import app from "./app";
import { configs } from "./configs";
import grapqhQLServer from "./graphql";

let server;

if (configs.ssl.enable) {
  server = https
    .createServer(
      {
        key: fs.readFileSync("./ssl/server.key"),
        cert: fs.readFileSync("./ssl/server.cert"),
      },
      app
    )
    .listen(app.get("port"), "0.0.0.0", () => {
      console.log("Listening HTTPS at port 5556");
    });
} else {
  server = app.listen(app.get("port"), "0.0.0.0", () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
  });

  grapqhQLServer(app, server);
}

export default server;
