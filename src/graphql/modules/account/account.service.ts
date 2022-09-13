import { Types } from "mongoose";

import { CrudService } from "../../../base/crudService";
import firebaseScrypt from "../../../helpers/firebaseScrypt";
import { AccountModel, IAccount, LoginMethod } from "./account.model";

class AccountService extends CrudService<typeof AccountModel> {
  constructor() {
    super(AccountModel);
  }

  /** Kiểm tra email có tồn tại chưa */
  async existsEmail(email: string) {
    return await AccountModel.exists({ email });
  }

  /** Tạo tài khoản bằng email và mật khẩu */
  async createAccountByEmailAndPassword(email: string, password: string) {
    const exists = await this.existsEmail(email);
    if (exists) {
      throw new Error("Email này đã có tài khoản");
    }
    /** Craete random salt */
    const salt =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return (await this.create({
      code: Types.ObjectId().toHexString(),
      loginMethod: LoginMethod.PASSWORD,
      email,
      passwordHash: await firebaseScrypt.hash(password, salt),
      salt: salt,
    })) as IAccount;
  }

  /** Đăng nhập bằng email và mật khẩu */
  async loginByEmailAndPassword(email: string, password: string) {
    const account = await AccountModel.findOne({ email });
    if (!account) {
      throw new Error("Tài khoản không tồn tại");
    }
    if (account.loginMethod !== "PASSWORD") {
      throw new Error("Phương thức đăng nhập không hợp lệ");
    }
    if (!account.passwordHash || !account.salt) {
      throw new Error("Mật khẩu không hợp lệ");
    }
    const verified = await firebaseScrypt.verify(password, account.salt, account.passwordHash);
    if (!verified) {
      throw new Error("Mật khẩu không hợp lệ");
    }
    await account.updateOne({ $set: { lastSignedInAt: new Date() } });
    return account;
  }

  /** Xoá tài khoản bằng mã tài khoản */
  async deleteByCode(code: string) {
    const account = await AccountModel.findOne({ code });
    if (!account) {
      throw new Error("Tài khoản không tồn tại");
    }
    return await account.remove();
  }

  /** Cập nhật mật khẩu của tài khoản */
  async updatePassword(code: string, password: string) {
    const account = await AccountModel.findOne({ code });
    if (!account) {
      throw new Error("Tài khoản không tồn tại");
    }
    if (account.loginMethod !== LoginMethod.PASSWORD) {
      throw new Error("Phương thức đăng nhập không hợp lệ");
    }
    const salt =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return await account.updateOne({
      $set: {
        passwordHash: await firebaseScrypt.hash(password, salt),
        salt: salt,
      },
    });
  }
}

const accountService = new AccountService();

export { accountService };
