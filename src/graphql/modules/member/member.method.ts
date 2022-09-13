import { ROLES } from "../../../constants/role.const";
import { IWallet, WalletLoader, WalletModel, WalletType } from "../wallet/wallet.model";

export interface MemberMethod {
  getWallet: () => Promise<IWallet>;
}

export function addMemberMethod(schema: any) {
  schema.methods = {
    ...schema.methods,
    getWallet: async function () {
      const root = this;
      if (!root.walletId) {
        // create  commission wallet
        const wallet = await WalletModel.create({
          type: WalletType.CASH,
          owner: {
            _id: root._id,
            name: root.name || root.phone,
            phone: root.phone,
            email: root.username,
            role: ROLES.MEMBER,
          },
        });
        root.walletId = wallet._id;
        await root.save();
      }
      return WalletLoader.load(root.walletId);
    },
  };
}
