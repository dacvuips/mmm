import { ServiceBroker } from "moleculer";
const LocalBroker = new ServiceBroker({
  logger: false,
});
LocalBroker.loadServices("dist/services", "**/*.service.js");
LocalBroker.start().then(() => {
  console.log("Service Broker is Ready");
});

export default LocalBroker;
