import { AbilityBuilder } from "@casl/ability";
import { ROLES } from "../../../constants/role.const";
import { AppAbility } from "../../../helpers/casl";
import { Context } from "../../context";

export default {
  forContext: (context: Context, { can, cannot }: AbilityBuilder<AppAbility>) => {
    switch (context.role) {
      case ROLES.MEMBER:
      // can("execute", "DepositWalletByMomo");
      default:
        break;
    }
  },
};
