import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Footer } from "../../../layouts/admin-layout/components/footer";
import { useDevice } from "../../../lib/hooks/useDevice";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { MemberService } from "../../../lib/repo/member.repo";
import { Button } from "../../shared/utilities/form/button";
import { Field } from "../../shared/utilities/form/field";
import { Form } from "../../shared/utilities/form/form";
import { Input } from "../../shared/utilities/form/input";
import { NotFound, Spinner } from "../../shared/utilities/misc";
import { TabGroup } from "../../shared/utilities/tab/tab-group";

export default function ShopLoginPage({ regisEnabled }: { regisEnabled: boolean }) {
  const { member, loginMember, redirectToShop } = useAuth();
  const [openForgetPassword, setOpenForgetPassword] = useState(false);
  const [hasOTPSent, setHasOTPSent] = useState<string>();
  const [optResetPassword, setOptResetPassword] = useState<string>();
  const [tokenResetPassword, setTokenResetPassword] = useState<string>();
  const [index, setIndex] = useState(0);
  const toast = useToast();

  const isStaffMode = useMemo(() => index == 1, [index]);

  useEffect(() => {
    if (member) {
      redirectToShop();
    }
  }, [member]);

  useEffect(() => {
    if (!openForgetPassword) {
      setHasOTPSent("");
    }
  }, [openForgetPassword]);

  const login = async ({ username, password, memberCode }) => {
    if (username && password) {
      await loginMember(username, password, memberCode)
        .then((user) => { })
        .catch((err) => {
          console.error(err);
          toast.error("Đăng nhập thất bại. " + err);
        });
    }
  };
  const { isSafari } = useDevice();
  if (isSafari) return <NotFound text="Hệ thống chưa hỗ trợ trên trình duyệt này" />;

  if (member !== null) return <Spinner />;
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-center bg-no-repeat bg-cover w-ful"
      style={{ backgroundImage: `url(/assets/img/login-background.png)` }}
    >
      <div className="flex items-center justify-center flex-1 w-full bg-center bg-no-repeat bg-cover">
        <Form
          className="flex flex-col w-5/6 py-4 sm:w-3/12 min-w-sm max-w-screen-xs sm:py-0 sm:min-h-screen"
          onSubmit={async (data) => {
            await login(data);
          }}
        >
          <img className="h-auto mx-auto my-3 mt-auto w-28 " src="/assets/img/logo-som.png" />
          <h2 className="my-1 text-2xl font-bold text-center uppercase text-accent">Đăng nhập</h2>
          <TabGroup
            name="login-tab"
            index={index}
            onChange={(index) => {
              setIndex(index);
            }}
            tabsClassName="mb-6"
            tabClassName="py-3"
            titleClassName="text-gray-200 font-bold"
            activeClassName="text-white"
          >
            <TabGroup.Tab label="Đăng nhập cửa hàng">
              <></>
            </TabGroup.Tab>
            <TabGroup.Tab label="Đăng nhập nhân viên">
              <></>
            </TabGroup.Tab>
          </TabGroup>
          {isStaffMode && (
            <Field className="mb-0.5" name="memberCode" required>
              <Input
                className="border-0 rounded-lg shadow-md h-14"
                placeholder="Mã cửa hàng"
                autoFocus
              />
            </Field>
          )}
          <Field className="mb-0.5" name="username" required>
            <Input
              className="border-0 rounded-lg shadow-md h-14"
              placeholder="Email đăng nhập"
              autoFocus
            />
          </Field>
          <Field className="mb-0.5" name="password" required>
            <Input
              className="border-0 rounded-lg shadow-md h-14"
              type="password"
              placeholder="Mật khẩu"
            />
          </Field>
          <LoginButton text={isStaffMode ? "Đăng nhập nhân viên" : "Đăng nhập cửa hàng"} />
          {regisEnabled && (
            <div className="mt-3 font-medium text-center text-white">
              Bạn chưa có tài khoản?{" "}
              <Link href="/shop/register">
                <a className="font-semibold cursor-pointer text-accent hover:underline">
                  Đăng ký ngay
                </a>
              </Link>
            </div>
          )}
          <Button
            className="h-auto mt-2 text-white border-none"
            hoverWhite
            text={"Quên mật khẩu"}
            unfocusable
            onClick={() => {
              setOpenForgetPassword(true);
            }}
          />
          <Footer className="mt-auto text-white border-gray-400" />
        </Form>
        <Form
          width={400}
          dialog
          title="Đổi mật khẩu"
          isOpen={openForgetPassword}
          onClose={() => {
            setOpenForgetPassword(false);
          }}
          defaultValues={{} as any}
          onSubmit={async (data) => {
            try {
              await MemberService.memberRequestResetPwd(data.email).then((res) => {
                toast.success(res, "vui lòng kiểm tra email của bạn!");
                setOpenForgetPassword(false);
              });
            } catch (err) {
              toast.error("Gửi yêu cầu thất bại. " + err.message);
            }
          }}
        >
          <Field label="Nhập email đăng nhập" name="email" required validation={{ email: true }}>
            <Input type="email" />
          </Field>
          <Form.Footer submitText={"Gửi yêu cầu"} />
        </Form>
        <Form
          width={400}
          dialog
          title="Đổi mật khẩu"
          // isOpen={openForgetPassword}
          // onClose={() => {
          //   setOpenForgetPassword(false);
          // }}
          onSubmit={async (data) => {
            if (hasOTPSent) {
              if (!data.otp || !data.code) {
                toast.info("Vui lòng nhập OTP và mã cửa hàng");
                return;
              }
              try {
                await MemberService.memberResetPasswordGetToken(data.code, data.otp).then((res) => {
                  setTokenResetPassword(res);
                });
                setOptResetPassword(data.otp);
                setHasOTPSent("");
              } catch (err) {
                toast.error("Đổi mật khẩu thất bại. " + err.message);
              }
            } else if (optResetPassword) {
              if (!data.code || !data.newPassword) {
                toast.info("Vui lòng nhập mã cửa hàng và mật khẩu mới");
              } else {
                try {
                  await MemberService.memberResetPasswordByToken(
                    data.code,
                    data.newPassword,
                    tokenResetPassword
                  );
                  toast.success("Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
                  setOpenForgetPassword(false);
                } catch (err) {
                  toast.error("Đổi mật khẩu thất bại. " + err.message);
                }
              }
            } else {
              if (!data.code && !data.username) {
                toast.info("Vui lòng nhập mã cửa hàng và email");
                return;
              } else {
                try {
                  await MemberService.memberResetPasswordOTPSMSRequest(
                    data.code,
                    data.username
                  ).then((res) => {
                    // toast.warn(res);
                    toast.success(`${res} . Xin kiểm tra hộp thư SMS của bạn`);
                  });
                  setHasOTPSent(data.code);
                } catch (err) {
                  toast.error("Gửi OTP thất bại. " + err.message);
                }
              }
            }
          }}
        >
          {/* <Field name="email" label="Email cửa hàng" readOnly={!!hasOTPSent}>
            <Input type="email" />
          </Field> */}
          <Field name="code" label="Mã cửa hàng" required>
            <Input />
          </Field>
          {!hasOTPSent && (
            <Field name="username" label="Email cửa hàng" required readOnly={!!hasOTPSent}>
              <Input type="email" />
            </Field>
          )}

          {hasOTPSent && (
            <>
              <Field name="otp" label="Mã OTP">
                <Input />
              </Field>
              {/* <Field name="password" label="Mật khẩu mới">
                <Input type="password" />
              </Field> */}
            </>
          )}
          {optResetPassword && (
            <Field name="newPassword" label="Mật khẩu mới">
              <Input type="password" />
            </Field>
          )}
          <Form.Footer
            submitText={
              hasOTPSent
                ? "Gửi yêu cầu"
                : optResetPassword
                  ? "Xác nhập đổi nhật khẩu"
                  : "Nhận mã OTP SMS"
            }
          />
        </Form>
      </div>
    </div>
  );
}

function LoginButton({ text }: { text: string }) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button
      submit
      primary
      className="mt-2 rounded-lg shadow h-14"
      text={text}
      isLoading={isSubmitting}
    />
  );
}
