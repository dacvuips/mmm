import jwt_decode from "jwt-decode";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  AdminPermission,
  ADMIN_SCOPE_PERMISSIONS,
  ScopeAdminPermission,
} from "../constants/admin-scopes.const";
import {
  ScopePermission,
  STAFF_SCOPE_PERMISSIONS,
  StaffPermission,
} from "../constants/staff-scopes.const";
import {
  ClearMemberToken,
  ClearStaffToken,
  ClearUserToken,
  GetMemberToken,
  GetStaffToken,
  GetUserToken,
  SetMemberToken,
  SetStaffToken,
  SetUserToken,
} from "../graphql/auth.link";
import { firebase } from "../helpers/firebase";
import { GraphService } from "../repo/graph.repo";
import { Member, MemberService } from "../repo/member.repo";
import { Staff, StaffService } from "../repo/staff.repo";
import { User, UserService } from "../repo/user.repo";

export const AuthContext = createContext<
  Partial<{
    user: User;
    member: Member;
    staff: Staff;
    loginUser: (email: string, password: string) => Promise<any>;
    logoutUser: () => Promise<any>;
    loginMember: (username: string, password: string, memberCode?: string) => Promise<any>;
    logoutMember: () => Promise<any>;
    memberUpdateMe: (data) => Promise<Member>;

    redirectToAdminLogin: Function;
    redirectToAdmin: Function;
    redirectToShopLogin: Function;
    redirectToShop: Function;
    verifyPhoneMember: Function;
    staffPermission: (permission: StaffPermission) => ScopePermission;
    adminPermission: (permission: AdminPermission) => ScopeAdminPermission;
  }>
>({});

export const PRE_LOGIN_PATHNAME = "pre-login-pathname";

export function AuthProvider(props) {
  // undefined = chưa authenticated, null = chưa đăng nhập
  const [user, setUser] = useState<User>(undefined);
  const [member, setMember] = useState<Member>(undefined);
  const [staff, setStaff] = useState<Staff>(undefined);

  const router = useRouter();

  const mode: "user" | "member" | "customer" = useMemo(() => {
    const pathname = router.pathname;
    if (pathname == "/admin" || pathname.startsWith("/admin/")) {
      return "user";
    } else if (pathname == "/shop" || pathname.startsWith("/shop/")) {
      return "member";
    } else {
      return "customer";
    }
  }, [router.pathname]);

  const loadUser = async () => {
    // firebase.auth().onAuthStateChanged(async (user) => {
    //   if (user) {
    //     UserService.login(await user.getIdToken())
    //       .then((res) => {
    //         const { user, token } = res;
    //         let decodedToken = jwt_decode(token) as {
    //           exp: number;
    //           role: string;
    //         };
    //         if (Date.now() >= decodedToken.exp * 1000) {
    //           ClearUserToken();
    //           setUser(null);
    //           return;
    //         } else {
    //           SetUserToken(token);
    //           setUser(user);
    //         }
    //       })
    //       .catch((err) => {
    //         ClearUserToken();
    //         setUser(null);
    //       });
    //   } else {
    //     ClearUserToken();
    //     setUser(null);
    //   }
    // });

    let token = GetUserToken();
    if (token) {
      if (user === undefined) {
        try {
          setUser(await UserService.userGetMe());
        } catch (err) {
          ClearUserToken();
          setUser(null);
          throw err.message;
        }
      } else {
        return user;
      }
    } else {
      ClearUserToken();
      setUser(null);
    }
  };

  const loadMember = async () => {
    let memberToken = GetMemberToken();
    if (memberToken) {
      if (member === undefined) {
        try {
          let res = await GraphService.query({
            query: `
              memberGetMe {
                ${MemberService.fullFragment}
              }
            `,
          });
          setMember(res.data.g0);
        } catch (err) {
          ClearMemberToken();
          setMember(null);
          throw err.message;
        }
      } else {
        return member;
      }
    } else {
      let staffToken = GetStaffToken();

      if (staffToken) {
        try {
          let res = await GraphService.query({
            query: `
              staffGetMe {
                ${StaffService.fullFragmentWithMember}
              }
            `,
          });
          setStaff(res.data.g0);
          setMember(res.data.g0.member);
        } catch (err) {
          ClearMemberToken();
          setMember(null);
          setStaff(null);
          throw err.message;
        }
      } else {
        ClearMemberToken();
        setMember(null);
        setStaff(null);
      }
    }
  };

  useEffect(() => {
    switch (mode) {
      case "user": {
        loadUser();
        break;
      }
      case "member": {
        loadMember();
        break;
      }
      case "customer": {
        break;
      }
    }
  }, [mode]);

  const loginUser = async (email: string, password: string) => {
    try {
      // const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      // const { user, token } = await UserService.login(await userCredential.user.getIdToken());
      const { user, token } = await UserService.loginUserByPassword(email, password);
      SetUserToken(token);
      setUser(user);
    } catch (err) {
      console.error(err);
      ClearUserToken();
      setUser(null);
      let message = "";
      switch (err.code) {
        case "auth/user-not-found": {
          message = "Không tìm thấy người dùng";
          break;
        }
        case "auth/invalid-email": {
          message = "Email không hợp lệ";
          break;
        }
        case "auth/wrong-password": {
          message = "Sai mật khẩu";
          break;
        }
        default: {
          message = err.message;
          break;
        }
      }
      throw new Error(message);
    }
  };

  const logoutUser = async () => {
    await firebase.auth().signOut();
    await UserService.clearStore();
    ClearUserToken();
    setUser(null);
  };

  const loginMember = async (username: string, password: string, memberCode?: string) => {
    let deviceId = localStorage.getItem("device-id");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("device-id", deviceId);
    }

    let deviceToken = "";
    try {
      const messaging = firebase.messaging();
      deviceToken = await messaging.getToken({ vapidKey: VAPID_KEY });
    } catch (err) {
      console.error(err);
    }

    try {
      if (memberCode) {
        let { token, staff } = await StaffService.loginWithPassword(
          username,
          password,
          memberCode,
          deviceId,
          deviceToken
        );
        SetStaffToken(token);
        setStaff(staff);
        setMember(staff?.member);
      } else {
        const { member, token } = await MemberService.loginMemberByPassword(
          username,
          password,
          deviceId,
          deviceToken
        );
        SetMemberToken(token);
        setMember(member);
      }
    } catch (err) {
      ClearMemberToken();
      setMember(null);
      setStaff(null);
      throw err.message;
    }
  };

  const verifyPhoneMember = async (idToken) => {
    try {
      let newMember = await MemberService.verifyMemberPhoneByFirebaseToken(idToken);
      if (newMember) {
        setMember(newMember.data["verifyMemberPhoneByFirebaseToken"]);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const logoutMember = async () => {
    sessionStorage.removeItem(`stepChecked${member.code}`);
    localStorage.removeItem("device-id");
    ClearMemberToken();
    ClearStaffToken();
    setMember(null);
    setStaff(null);
    await MemberService.clearStore();
  };

  const memberUpdateMe = async (data) => {
    return MemberService.mutate({
      mutation: `
        memberUpdateMe(data: $data) {
          ${MemberService.fullFragment}
        }
      `,
      variablesParams: `($data: UpdateMemberInput!)`,
      options: {
        variables: {
          data,
        },
      },
    })
      .then((res) => {
        setMember(res.data.g0);
        return res.data.g0;
      })
      .catch((err) => {
        throw err;
      });
  };

  const redirectToAdminLogin = () => {
    sessionStorage.setItem(PRE_LOGIN_PATHNAME, location.pathname);
    router.replace("/admin/login");
  };

  const redirectToAdmin = () => {
    let pathname = sessionStorage.getItem(PRE_LOGIN_PATHNAME);
    if (user) {
      if (pathname?.includes("/admin")) router.replace(pathname || "/admin");
      else router.replace("/admin");
    } else {
      router.replace("/");
    }
  };

  const redirectToShopLogin = () => {
    sessionStorage.setItem(PRE_LOGIN_PATHNAME, location.pathname);
    router.replace("/shop/login");
  };

  const redirectToShop = () => {
    let pathname = sessionStorage.getItem(PRE_LOGIN_PATHNAME);
    if (member) {
      if (pathname?.includes("/shop")) router.replace(pathname || "/shop");
      else router.replace("/shop");
    } else {
      router.replace("/");
    }
  };

  const staffPermission = (permission: StaffPermission): ScopePermission => {
    let flag: ScopePermission = false;
    if (staff) {
      if (staff.scopes.includes("ADMIN")) {
        flag = true;
      } else {
        for (let scope of staff.scopes) {
          const scopePermission: ScopePermission = STAFF_SCOPE_PERMISSIONS[scope][permission];
          flag = flag || scopePermission;
        }
      }
    } else if (member) {
      flag = true;
    }
    return flag;
  };

  const adminPermission = (permission: AdminPermission): ScopeAdminPermission => {
    let flag: ScopeAdminPermission = false;
    if (user) {
      if (user.scopes?.includes("ADMIN")) {
        flag = true;
      } else {
        for (let scope of user.scopes) {
          const scopePermission: ScopeAdminPermission = ADMIN_SCOPE_PERMISSIONS[scope][permission];
          flag = flag || scopePermission;
        }
      }
    } else if (member) {
      flag = true;
    }
    return flag;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        staff,
        loginUser,
        logoutUser,
        loginMember,
        logoutMember,
        memberUpdateMe,

        redirectToAdminLogin,
        redirectToAdmin,
        redirectToShopLogin,
        redirectToShop,

        verifyPhoneMember,
        staffPermission,
        adminPermission,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

const VAPID_KEY = `BKh34EjqetrcY6C1ZSSzbVXLlk0CZElMcjByujFcZUpgqbAQ8mAhWDl62g-EhsWx9_r7fz_jp91PikA9IVsUvgg`;
