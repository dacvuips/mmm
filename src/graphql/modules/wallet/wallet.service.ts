import { CrudService } from "../../../base/crudService";
import { WalletModel } from "./wallet.model";
class WalletService extends CrudService<typeof WalletModel> {
  constructor() {
    super(WalletModel);
  }
}

const walletService = new WalletService();

export { walletService };
