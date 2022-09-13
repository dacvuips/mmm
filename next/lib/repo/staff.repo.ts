import { BaseModel, CrudRepository } from "./crud.repo";
import { Member, MemberService } from "./member.repo";
import { ShopBranch } from "./shop-branch.repo";

export interface Staff extends BaseModel {
  /** Mã chủ shop */
  memberId?: string;
  /** Tên đăng nhập */
  username?: string;
  /** Mật khẩu */
  password?: string;
  /** Tên nhân viên */
  name?: string;
  /** Điện thoại nhân viên */
  phone?: string;
  /** Ảnh đại diện */
  avatar?: string;
  /** Địa chỉ liên hệ */
  address?: string;
  /** Mã chi nhánh */
  branchId?: string;
  /** Email */
  email?: string;
  /** Phân quyền */
  scopes?: StaffScope[];
  /** Chi nhánh */
  branch?: ShopBranch;
}
export class StaffRepository extends CrudRepository<Staff> {
  apiName: string = "Staff";
  displayName: string = "nhân viên";
  shortFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    username: String
    name: String
    phone: String
    avatar: String
    address: String
    branchId: ID
    branch {
      id: String
      name: String
    }: ShopBranch
    scopes: String
    email: String
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    createdAt: DateTime
    updatedAt: DateTime
    memberId: ID
    username: String
    name: String
    phone: String
    avatar: String
    address: String
    branchId: ID
    branch {
      id: String
      name: String
    }: ShopBranch
    scopes: String
    email: String
  `);
  fullFragmentWithMember: string = this.parseFragment(`
    ${this.fullFragment}
    member {
      ${MemberService.fullFragment}
    }
  `);

  updateStaffPassword(staffId: string, password: string) {
    return this.mutate({
      mutation: `
        updateStaffPassword(staffId: "${staffId}", password: "${password}") {
          id
        }
      `,
    });
  }
  loginWithPassword(
    username: string,
    password: string,
    memberCode: string,
    deviceId: string,
    deviceToken: string
  ) {
    return this.mutate({
      mutation: `loginStaff(memberCode: "${memberCode}", username: "${username}", password: $password, deviceId: "${deviceId}", deviceToken: "${deviceToken}") {
        staff { ${StaffService.fullFragmentWithMember} } token
      }`,
      variablesParams: "($password: String!)",
      options: { variables: { password } },
    }).then((res) => res.data.g0);
  }
}

export const StaffService = new StaffRepository();

export type StaffScope = "ADMIN" | "OPERATOR" | "USER" | "VIEWER";
export const STAFF_SCOPES: Option<StaffScope>[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "OPERATOR", label: "Operator" },
  { value: "USER", label: "User" },
  { value: "VIEWER", label: "Viewer" },
];
