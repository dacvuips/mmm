import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../lib/providers/toast-provider";
import { MemberService } from "../../../lib/repo/member.repo";
import { Field, Form, Input } from "../../shared/utilities/form";
import { Spinner } from "../../shared/utilities/misc";

type Props = {};

export function ResetMemberPwd({ }: Props) {
  const router = useRouter();
  const { token } = router.query;
  const toast = useToast();
  const [validateToke, setValidateToken] = useState(false);
  useEffect(() => {
    if (token) {
      (async () => {
        try {
          await MemberService.validateResetPwdToken(token as string).then((res) => {
            console.log(res);
            setValidateToken(true);
          });
        } catch (err) {
          toast.error(err.message);
          router.push("/not-found-shop")
        }
      })();
    }
  }, [token]);

  if (!validateToke) return <Spinner />
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-center bg-no-repeat bg-cover w-ful">
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-md shadow">
        <div className="mb-5 text-xl font-semibold text-center text-primary">Đổi mật khẩu</div>

        <Form
          className="flex flex-col bg-white w-96 max-w-screen-xs"
          onSubmit={async (data) => {
            if (data.password && validateToke)
              try {
                await MemberService.memberResetPwd(token as string, data.password).then((res) => {
                  toast.success(res);
                  router.replace("/shop/login");
                });
              } catch (err) {
                toast.error("Gửi yêu cầu thất bại. " + err.message);
              }
          }}
        >
          <Field name="password" label="Mật khẩu mới" required>
            <Input placeholder="Nhập mật khẩu mới" type="password" />
          </Field>
          <Field
            name="passwordNew"
            label="Nhập lại mật khẩu mới"
            required
            validation={{
              password: (value, data) =>
                value != data.password ? "Mật khẩu nhập lại không đúng" : "",
            }}
          >
            <Input placeholder="Nhập lại mật khẩu" type="password" />
          </Field>
          <Form.Footer submitText="Xác nhận" cancelText="Hủy" />
        </Form>
      </div>
    </div>
  );
}
