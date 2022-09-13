import { BaseModel, CrudRepository } from "./crud.repo";

export interface User extends BaseModel {
  uid: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  avatar: string;
  province: string;
  district: string;
  ward: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  role: "ADMIN" | "EDITOR";
  unseenNotify: number;
  psid: string;
  subscriber: SubscriberInfo;
  scopes: AdminScope[];
}
interface SubscriberInfo {
  id: string;
  psid: string;
  name: string;
  firstName: string;
  lastName: string;
  gender: string;
  locale: string;
  profilePic: string;
}
export class UserRepository extends CrudRepository<User> {
  apiName: string = "User";
  displayName: string = "tài khoản";
  shortFragment: string = this.parseFragment(`
    id: String
    uid: string
    email: string
    name: string
    phone: string
    wardId: string
    role: 'ADMIN' | 'EDITOR'
    createdAt: DateTime
    updatedAt: DateTime
    scopes: String
  `);
  fullFragment: string = this.parseFragment(`
    id: String
    uid: string
    email: string
    name: string
    phone: string
    wardId: string
    role: 'ADMIN' | 'EDITOR'
    createdAt: DateTime
    updatedAt: DateTime
    scopes: String
  `);

  // for firebase
  async login(token): Promise<{ user: User; token: string }> {
    return await this.apollo
      .mutate({
        mutation: this
          .gql`mutation {  login(idToken: "${token}") { user { ${this.fullFragment} } token }}`,
      })
      .then((res) => res.data["login"]);
  }

  /** Đăng nhập trực tiếp bằng password */
  async loginUserByPassword(email: string, password: string) {
    return await this.mutate({
      mutation: `loginUserByPassword(email: """${email}""", password: $password) {
        user { ${this.fullFragment} }
        token
      }`,
      variablesParams: `($password: String!)`,
      options: {
        variables: { password },
      },
    }).then((res) => res.data.g0);
  }

  // fore server username
  async userGetMe() {
    return await this.apollo
      .query({
        query: this.gql`query {  userGetMe { ${this.fullFragment} }}`,
      })
      .then((res) => res.data["userGetMe"] as User);
  }

  // for firebase

  async updateUserPassword(id: string, password: string) {
    return await this.mutate({
      mutation: `updateUserPassword(id: "${id}", password: "${password}")`,
    }).then((res) => res.data.g0);
  }

  async loginWithUsernamePassword(username: string, password: string) {
    return await this.apollo
      .mutate({
        mutation: this.gql`
        mutation {
            loginWithUsernamePassowrd(
                username: "${username}",
                password: "${password}"
            ) {
                user { ${this.fullFragment} }
                token
            }
        }
      `,
      })
      .then((res) => ({
        user: res.data["loginWithUsernamePassowrd"]["user"] as User,
        token: res.data["loginWithUsernamePassowrd"]["token"] as string,
      }));
  }

  async activeUser(userId: string) {
    return await this.apollo
      .mutate({
        mutation: this.gql`mutation { activeUser(userId: "${userId}") { ${this.fullFragment}}}`,
      })
      .then((res) => res.data["activeUser"] as User);
  }

  async blockUser(userId: string) {
    return await this.apollo
      .mutate({
        mutation: this.gql`mutation { blockUser(userId: "${userId}") { ${this.fullFragment}}}`,
      })
      .then((res) => res.data["blockUser"] as User);
  }
}

export const UserService = new UserRepository();

export const USER_ROLES: Option[] = [
  { value: "ADMIN", label: "Quản trị", color: "primary" },
  { value: "EDITOR", label: "Biên tập viên", color: "success" },
];

export type AdminScope = "ADMIN" | "OPERATOR" | "USER" | "VIEWER";
export const ADMIN_SCOPES: Option<AdminScope>[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "OPERATOR", label: "Operator" },
  { value: "USER", label: "User" },
  { value: "VIEWER", label: "Viewer" },
];
