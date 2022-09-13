import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormState } from "react-hook-form";
import { RiCheckboxCircleFill } from "react-icons/ri";
import { Footer } from "../../../layouts/admin-layout/components/footer";
import { validateKeyword } from "../../../lib/constants/validate-keyword";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { ShopCategoryService } from "../../../lib/repo/shop-category.repo";
import { ShopRegistrationService } from "../../../lib/repo/shop-registration.repo";
import { Dialog } from "../../shared/utilities/dialog/dialog";
import { Button, Checkbox, Field, Form, Input, Select } from "../../shared/utilities/form";
import { Spinner } from "../../shared/utilities/misc";

export function ShopRegisterPage() {
  const { member, redirectToShop } = useAuth();
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (member) {
      redirectToShop();
    }
  }, [member]);

  const register = async ({ shopName, shopCode, email, phone, name, categoryId, password }) => {
    if (shopName && shopCode && email && phone && categoryId) {
      await ShopRegistrationService.create({
        data: { shopName, name, shopCode, email, phone, categoryId, password },
      })
        .then((user) => {
          setSuccess(true);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Đăng ký thất bại. " + err.message);
        });
    }
  };

  if (member !== null) return <Spinner />;
  if (success)
    return (
      <div
        className="flex flex-col min-h-screen bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(/assets/img/register-success-background.jpg)` }}
      >
        <Dialog isOpen={true} extraDialogClass="flex flex-col items-center p-10">
          <h3 className="text-2xl font-semibold uppercase text-primary">Đăng ký thành công</h3>
          <img className="w-48" src="/assets/img/register-success.png" />
          <div className="mt-8 mb-4 text-lg text-center text-white">
            Bạn đã đăng ký tài khoản thành công! <br />
            Vui lòng đợi phản hồi kích hoạt từ 3M Marketing
          </div>
          <Button className="h-12 px-20" primary text="Về trang đăng nhập" href="/shop/login" />
        </Dialog>
      </div>
    );
  else
    return (
      <div
        className="flex flex-col min-h-screen bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(/assets/img/register-background.jpg)` }}
      >
        <div className="flex items-center flex-1 gap-12 main-container justify-evenly">
          <div className="flex-col flex-1 max-w-xl flex-center ">
            <img className="w-40 h-auto mb-8" src="/assets/img/logo-som.png" />
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
              {REGISTER_INFOS.map((info) => (
                <div className="flex w-full p-3 font-bold text-center uppercase " key={info.title}>
                  <div className="flex items-center w-full mb-1 font-semibold text-white lg:justify-start">
                    <i className="text-3xl">
                      <RiCheckboxCircleFill />
                    </i>
                    <div className="pl-2 text-lg whitespace-nowrap">{info.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Form
            className="flex flex-col flex-1 w-8/12 px-10 py-6 my-6 border border-white rounded-lg max-w-screen-xs"
            onSubmit={async (data) => {
              if (data.accept) {
                await register(data);
              } else {
                toast.warn("Bạn phải đồng ý với điều khoản của 3M Marketing");
              }
            }}
          >
            {/* <img className="w-20 h-auto mx-auto my-6" src="/assets/img/logo-som.png" /> */}
            <h2 className="mt-2 mb-6 text-xl font-bold text-center uppercase text-accent">
              Đăng ký cửa hàng
            </h2>

            <Field
              name="shopName"
              required
              validation={{
                shopNameValid: (shopName) => validateKeyword(shopName),
              }}
            >
              <Input
                className="h-12 border-0 rounded-lg shadow-md"
                placeholder="Tên hiển thị cửa hàng"
                autoFocus
              />
            </Field>

            <Field
              name="shopCode"
              required
              validation={{
                code: true,
                invalidCode: (val) => {
                  if (val == "3MMarketing" || val == "shop" || val == "admin") {
                    return "Không được phép dùng mã này";
                  } else if (validateKeyword(val)) {
                    validateKeyword(val);
                  } else {
                    return "";
                  }
                },
              }}
            >
              <Input
                className="h-12 border-0 rounded-lg shadow-md"
                suffix={`.${location.host}`}
                suffixClassName="bg-brand-light text-primary font-semibold border-l border-primary"
                placeholder="Đặt tên cho gian hàng của bạn"
              />
            </Field>

            <Field
              name="email"
              required
              validation={{
                email: true,

              }}
            >
              <Input
                className="h-12 border-0 rounded-lg shadow-md"
                placeholder="Email dùng để đăng nhập"
              />
            </Field>

            <Field name="password" required
              validation={{
                passwordValid: (val) => {
                  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
                  if (val.length > 0 && !regex.test(val)) {
                    return "Mật khẩu sai định dạng (8 ký tự, ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 chữ số)";
                  }
                }
              }}
            >
              <Input
                className="h-12 border-0 rounded-lg shadow-md"
                placeholder="Mật khẩu đăng nhập"
                type="password"
              />
            </Field>

            <Field name="categoryId" required>
              <Select
                placeholder="Chọn danh mục cửa hàng"
                className="inline-grid h-12 border-0 rounded-lg shadow-md"
                optionsPromise={() => ShopCategoryService.getAllOptionsPromise()}
              />
            </Field>

            <Field
              name="name"
              required
              validation={{
                nameValid: (name) => validateKeyword(name),
              }}
            >
              <Input
                className="h-12 border-0 rounded-lg shadow-md"
                placeholder="Người đại diện cửa hàng"
              />
            </Field>

            <Field name="phone" required validation={{ phone: true }}>
              <Input
                className="h-12 border-0 rounded-lg shadow-md"
                placeholder="Số điện thoại liên hệ"
              />
            </Field>
            <div className="flex items-center justify-center">
              <div className="flex items-start justify-around">
                <Field name="accept">
                  <Checkbox
                    placeholder="Tôi đồng ý điều khoản"
                    style={{ color: "#fff" }}
                    className="text-white border-white hover:border-white"
                  />
                </Field>
                <Link href={"/3MMarketing/news/de-an-hoat-dong-ung-dung"}>
                  <a
                    className="mt-2 text-sm font-semibold text-accent hover:underline"
                    target="_blank"
                  >
                    Xem điều khoản
                  </a>
                </Link>
              </div>
            </div>
            <RegisterButton />
            <div className="mt-3 text-base font-medium text-center text-white">
              Bạn đã có tài khoản?{" "}
              <Link href="/shop/login">
                <a className="font-bold cursor-pointer text-accent hover:underline">Đăng nhập</a>
              </Link>
            </div>
          </Form>
        </div>
        {/* <Footer className="text-white" /> */}
      </div>
    );
}

function RegisterButton() {
  const { isSubmitting } = useFormState();

  return (
    <Button
      submit
      primary
      className="h-12 mt-4 shadow"
      text="Đăng ký cửa hàng"
      isLoading={isSubmitting}
    />
  );
}

const REGISTER_INFOS = [
  {
    title: "Không lo chiết khấu",
    content:
      "Hoàn thiện thông tin về Điểm kinh doanh, Biểu giả vận chuyển, Món, Kết nối thiết bị bahana là bạn đã sẵn sàng kinh doanh.",
  },
  {
    title: "Tích hợp đa kênh",
    content:
      "Tùy biến ứng dụng đặt đồ ăn với nhiều hiệu chính đặc biệt giúp tạo dầu ân thương hiệu tạo trải nghiệm gọi món thân thiện và tối ưu hiệu suất kinh doanh.",
  },
  {
    title: "Sử dụng dễ dàng",
    content:
      "Thông báo trực tiếp đến cửa hàng ngày khi khách hàng đặt món, đồng bộ xử lý số lượng lớn đơn hàng tại cùng một thời điểm và dễ dàng gọi dịch vụ vận chuyển trong vài thao tác",
  },
  {
    title: "Quy trình khép kín",
    content:
      "Thông báo trực tiếp đến cửa hàng ngày khi khách hàng đặt món, đồng bộ xử lý số lượng lớn đơn hàng tại cùng một thời điểm và dễ dàng gọi dịch vụ vận chuyển trong vài thao tác",
  },
];
