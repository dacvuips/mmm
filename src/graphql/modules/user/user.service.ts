import { CrudService } from "../../../base/crudService";
import { UserModel, UserRole } from "./user.model";
import { ErrorHelper } from "../../../helpers/error.helper";
import { firebaseHelper } from "../../../helpers";
import { Types } from "mongoose";
class UserService extends CrudService<typeof UserModel> {
  constructor() {
    super(UserModel);
  }

  async getChatbotUser() {
    return await UserModel.findOneAndUpdate(
      { email: "chatbot@gmail.com" },
      {
        $setOnInsert: {
          name: "Mcom Chatbot",
          role: UserRole.ADMIN,
          uid: Types.ObjectId().toHexString(),
        },
      },
      { upsert: true, new: true }
    );
  }
}

const userService = new UserService();

export { userService };
