import { Types } from "mongoose";
import { Owner, OwnerSchema } from "../../mixin/owner.graphql";
import { UserModel, UserRole } from "../../user/user.model";
import { WalletModel, WalletType } from "../wallet.model";

export default test("Hash Code", async () => {
  const adminUser = await UserModel.findOne({ role: UserRole.ADMIN });
  const owner: Owner = {
    name: adminUser.name,
    email: adminUser.email,
    phone: "",
    role: adminUser.role,
  };
  const globalWallet = await WalletModel.create({
    type: WalletType.CASH,
    owner: owner,
  });
  const globalWallet2 = await WalletModel.create({
    type: WalletType.POINT,
    owner: owner,
  });
  console.log(`Global walletCash: ${globalWallet._id}`);
  console.log(`Global walletPOINT: ${globalWallet2._id}`);
  expect(1).toEqual(1);
});
