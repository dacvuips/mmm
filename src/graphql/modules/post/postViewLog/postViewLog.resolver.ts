import { ROLES } from "../../../../constants/role.const";
import { Context } from "../../../context";
import { postViewLogService } from "./postViewLog.service";

const Query = {
  getAllPostViewLog: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    return postViewLogService.fetch(args.q);
  },
};

const PostViewLog = {};

export default {
  Query,
  PostViewLog,
};
