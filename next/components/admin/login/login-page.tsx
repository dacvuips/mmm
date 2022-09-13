import { useEffect } from "react";
import { Footer } from "../../../layouts/admin-layout/components/footer";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { Button, Field, Form, Input } from "../../shared/utilities/form";
import { Spinner } from "../../shared/utilities/misc";
import { useFormContext } from "react-hook-form";

export function LoginPage() {
  const { user, loginUser, redirectToAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      redirectToAdmin();
    }
  }, [user]);

  const login = async ({ username, password }) => {
    if (username && password) {
      await loginUser(username, password)
        .then((user) => {})
        .catch((err) => {
          console.error(err);
          toast.error("Đăng nhập thất bại. " + err.message);
        });
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(/assets/img/admin-background.jpg)` }}
    >
      <div className="flex items-center justify-center flex-1 w-screen">
        {user !== null ? (
          <Spinner />
        ) : (
          <Form
            className="flex flex-col w-5/12 p-6 bg-white shadow-xl max-w-screen-xs"
            onSubmit={async (data) => {
              await login(data);
            }}
          >
            <img className="w-24 h-auto py-6 mx-auto" src="/assets/img/logo-som.png" />
            <h2 className="mb-4 text-xl font-semibold text-center text-gray-700 uppercase">
              Đăng nhập Admin
            </h2>
            <Field className="mb-1" name="username" required>
              <Input className="h-14" placeholder="Email / Tên đăng nhập" autoFocus />
            </Field>
            <Field className="mb-1" name="password" required>
              <Input className="h-14" type="password" placeholder="Mật khẩu" />
            </Field>
            <LoginButton />
          </Form>
        )}
      </div>
      <Footer className="border-none text-primary-light" />
    </div>
  );
}

function LoginButton() {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button submit primary className="h-14" text="Đăng nhập quản trị" isLoading={isSubmitting} />
  );
}
