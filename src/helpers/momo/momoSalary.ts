import MomoSalary from "momo-salary";
import { configs } from "../../configs";

const { mode, user1, pass1, user2, pass2 } = configs.momo.salary;
export const momoSalary1 = new MomoSalary({
  mode: mode as any,
  username: user1,
  password: pass1,
});

export const momoSalary2 = new MomoSalary({
  mode: mode as any,
  username: user2,
  password: pass2,
});
