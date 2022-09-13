import { FirebaseScrypt } from "firebase-scrypt";
import { configs } from "../configs";

export default new FirebaseScrypt({
  memCost: configs.firebaseScrypt.memCost,
  rounds: configs.firebaseScrypt.rounds,
  saltSeparator: configs.firebaseScrypt.saltSeparator,
  signerKey: configs.firebaseScrypt.signerKey,
});
