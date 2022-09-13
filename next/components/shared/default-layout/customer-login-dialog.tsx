import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { HiOutlineX } from "react-icons/hi";
import { GetAnonymousToken } from "../../../lib/graphql/auth.link";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { CustomerService } from "../../../lib/repo/customer.repo";
import { ShopService } from "../../../lib/repo/shop.repo";
import { DialogProps } from "../utilities/dialog/dialog";
import { Button } from "../utilities/form/button";
import { Field } from "../utilities/form/field";
import { Form } from "../utilities/form/form";
import { Input } from "../utilities/form/input";

interface Propstype extends DialogProps { }
export function CustomerLoginDialog({ ...props }: Propstype) {
  const { shop, shopCode, loginCustomerOTP, loginCustomer, customer } = useShopContext();
  const [otpDelay, setOTPDelay] = useState(0);
  const toast = useToast();

  useEffect(() => {
    if (otpDelay > 0) {
      setTimeout(() => {
        setOTPDelay(otpDelay - 1);
      }, 1000);
    }
  }, [otpDelay]);
  const isWaitingOTPDelay = useMemo(() => otpDelay > 0, [otpDelay]);
  const isOTPRequired = shop?.config?.smsOtp;

  const handleSubmit = async ({ phone, name, otp }) => {
    try {
      let tokenShop = GetAnonymousToken(shopCode);
      if (!tokenShop) {
        await ShopService.loginAnonymous(shopCode);
      }
      if (isOTPRequired) {
        await loginCustomerOTP(phone, name, otp);
      } else {
        await loginCustomer(phone, name);
      }
      props.onClose();
    } catch (error) {
      toast.error("Đăng nhập thất bại. " + error.message);
    }
  };

  return (
    <Form
      dialog
      width="360px"
      slideFromBottom="none"
      dialogClass="rounded-2xl overflow-auto relative bg-white my-auto"
      extraBodyClass="p-7 sm:p-8"
      onSubmit={handleSubmit}
      {...props}
    >
      <Button
        icon={<HiOutlineX />}
        className="absolute top-2 right-1"
        iconClassName="text-xl"
        hoverDanger
        unfocusable
        onClick={props.onClose}
      />
      <div className="flex flex-col items-center w-full">
        <img src={shop?.shopLogo} className="h-12" />
        <div className="flex flex-col items-center mt-2 mb-3">
          <div className="my-1 text-lg font-medium text-gray-700 sm:text-xl">Xin chào</div>
          <div className="text-sm font-normal text-gray-600">Đăng nhập hoặc Tạo tài khoản</div>
        </div>
        <CustomerLoginFields
          isWaitingOTPDelay={isWaitingOTPDelay}
          isOTPRequired={isOTPRequired}
          setOTPDelay={setOTPDelay}
        />
        {isWaitingOTPDelay && (
          <div className="text-xs text-gray-600 absolute bottom-1.5">
            Có thể gửi lại mã OTP sau <span className="font-medium">{otpDelay}s</span>
          </div>
        )}
      </div>
    </Form>
  );
}

function CustomerLoginFields({ isOTPRequired, isWaitingOTPDelay, setOTPDelay }) {
  const {
    watch,
    formState: { isSubmitting },
  } = useFormContext();
  const toast = useToast();
  const phone = watch("phone");
  const [openDialogConfirmOtp, setOpenDialogConfirmOtp] = useState(false);

  const requestOTP = async (phone: string) => {
    if (phone) {
      try {
        const res = await CustomerService.requestOtp(phone);
        toast.success(res);
        setOTPDelay(60);
      } catch (err) {
        toast.error("Gửi OTP thất bại. " + err.message);
      }
    } else {
      toast.info("Vui lòng nhập số điện thoại");
    }
  };

  return (
    <>
      {!openDialogConfirmOtp && (
        <>
          <Field className="w-full" name="name" required>
            <Input
              className="text-sm font-light border-gray-200 sm:h-12 sm:text-base"
              placeholder="Tên khách hàng"
              autoFocus
            />
          </Field>
          <Field className="w-full" name="phone" required>
            <Input
              className="text-sm font-light border-gray-200 sm:h-12 sm:text-base"
              placeholder="Số điện thoại"
            // suffix={
            //   isOTPRequired && (
            //     <Button
            //       onClick={async () => await requestOTP(phone)}
            //       disabled={isWaitingOTPDelay}
            //       text={`Gửi mã OTP`}
            //       className={`text-sm ${isWaitingOTPDelay ? "bg-gray-100" : "bg-primary-light"
            //         } border-l rounded-l-none h-full`}
            //       textPrimary
            //     />
            //   )
            // }
            />
          </Field>
        </>
      )}

      {isOTPRequired && openDialogConfirmOtp && (
        <Field className="w-full" name="otp" required>
          <Input
            placeholder="Mã OTP sẽ được gửi qua tin nhắn"
            className="text-sm font-light border-gray-200 sm:h-12 sm:text-base"
          />
        </Field>
      )}

      {!isOTPRequired && (
        <Button
          text="Đăng nhập"
          primary
          isLoading={isSubmitting}
          submit
          className="px-8 rounded-full shadow h-11 sm:mt-2 sm:px-12"
        />
      )}

      {isOTPRequired && (
        <Button
          text={`${openDialogConfirmOtp ? "Đăng nhập" : "Gửi mã OTP"}`}
          primary
          isLoading={isSubmitting}
          submit
          className="px-8 rounded-full shadow h-11 sm:mt-2 sm:px-12"
          onClick={async () => {
            if (!openDialogConfirmOtp) {
              await requestOTP(phone);
              setOpenDialogConfirmOtp(true);
            }
            return;
          }}
          disabled={!openDialogConfirmOtp ? isWaitingOTPDelay : false}
        />
      )}
    </>
  );
}
