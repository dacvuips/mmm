import Link from "next/link";
import QRCode from "qrcode.react";
import { useRef, useState } from "react";
import { RiDownload2Line, RiExternalLinkLine } from "react-icons/ri";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { MemberService } from "../../../../lib/repo/member.repo";
import { ShopCategoryService } from "../../../../lib/repo/shop-category.repo";
import {
  Button,
  Field,
  Form,
  FormProps,
  ImageInput,
  Input,
  Label,
  Select,
} from "../../../shared/utilities/form";
import { Img } from "../../../shared/utilities/misc";
import { AvatarUploader } from "../../../shared/utilities/uploader/avatar-uploader";

export function GeneralSettings() {
  const { member, memberUpdateMe, staffPermission } = useAuth();
  const avatarUploaderRef = useRef<any>();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingMemberAvatar, setUploadingMemberAvatar] = useState(false);
  const [openChangepassword, setOpenChangePassword] = useState(false);
  const [openChangeEmail, setOpenChangeEmail] = useState(false);
  const toast = useToast();
  const disabled = !staffPermission("WRITE_SETTINGS");

  const onSubmit = async (data) => {
    try {
      await memberUpdateMe(data);
      toast.success("Lưu thay đổi thành công");
    } catch (err) {
      toast.error("Lưu thay đổi thất bại. " + err.message);
    }
  };

  const onAvatarChange = async (image: string) => {
    try {
      setUploadingMemberAvatar(true);
      await memberUpdateMe({ shopLogo: image });
      toast.success("Cập nhật ảnh đại diện cửa hàng thành công");
    } catch (err) {
      toast.error("Cập nhật ảnh đại diện cửa hàng thất bại. " + err.message);
    } finally {
      setUploadingMemberAvatar(false);
    }
  };

  function download() {
    let canvas: any = document.getElementById(member.name + "QR");
    if (canvas) {
      let a = document.createElement("a");
      a.href = canvas.toDataURL();
      a.download = member.shopName + "-QR.png";
      a.click();
    }
  }
  return (
    <>
      <Form defaultValues={member} className="max-w-screen-sm animate-emerge" onSubmit={onSubmit}>
        <div className="flex items-center my-6">
          <Img
            className="bg-white border border-gray-300 rounded-full w-14"
            src={member.shopLogo}
          />
          <div className="pl-3">
            <div className="text-lg font-bold text-gray-700">{member.shopName}</div>
            <Button
              className="h-auto px-0 text-sm hover:underline"
              textPrimary
              text="Đổi hình đại diện"
              isLoading={uploadingAvatar || uploadingMemberAvatar}
              onClick={() => {
                avatarUploaderRef.current().onClick();
              }}
            />
            <AvatarUploader
              onRef={(ref) => {
                avatarUploaderRef.current = ref;
              }}
              onUploadingChange={setUploadingAvatar}
              onImageUploaded={onAvatarChange}
            />
          </div>
        </div>
        <Label text="Link cửa hàng" />
        <Link href={`${location.origin}/${member.code}`}>
          <a
            target="_blank"
            className="flex items-center pt-0.5 pb-3 pl-1 font-semibold text-primary hover:text-primary-dark underline hover:underline"
          >
            {`${location.origin}/${member.code}`}
            <i className="ml-2 text-base">
              <RiExternalLinkLine />
            </i>
          </a>
        </Link>
        <Label text="Mã QR Code cửa hàng" />
        <div className="pt-1 pb-3 pl-1">
          <QRCode
            value={`${location.origin}/${member.code}`}
            size={230}
            className=""
            id={member.name + "QR"}
          />
          <Button
            icon={<RiDownload2Line />}
            text="Tải xuống"
            className="mx-2 w-56 ml-1.5 focus:outline-white"
            onClick={() => download()}
          />
        </div>
        <Form.Title title="Thông tin cơ bản" />
        <Field
          label="Tên cửa hàng"
          name="shopName"
          validation={{ shopNameValid: (val) => validateKeyword(val) }}
        >
          <Input className="h-12" />
        </Field>
        <Field label="Danh mục cửa hàng" name="categoryId">
          <Select
            className="inline-grid h-12"
            optionsPromise={() => ShopCategoryService.getAllOptionsPromise()}
          />
        </Field>
        <Field label="Ảnh nền cửa hàng" name="shopCover">
          <ImageInput cover largeImage ratio169 inputClassName="h-12" buttonClassName="h-12" />
        </Field>
        <Form.Title title="Thông tin tài khoản" />
        <div className="flex items-end gap-2">
          <Field className="flex-1" label="Email đăng nhập" name="username" readOnly>
            <Input className="h-12" />
          </Field>
          <Button
            outline
            disabled={disabled}
            className="h-12 mb-6 bg-white"
            text={"Đổi email đăng nhập"}
            onClick={() => {
              setOpenChangeEmail(true);
            }}
          />
        </div>
        <Field label="Mã cửa hàng" name="code" readOnly>
          <Input className="h-12" />
        </Field>
        <Field
          label="Tên chủ cửa hàng"
          name="name"
          validation={{ nameValid: (val) => validateKeyword(val) }}
        >
          <Input className="h-12" />
        </Field>
        <Field label="Số điện thoại" name="phone">
          <Input className="h-12" />
        </Field>
        <Field label="Mật khẩu">
          <div className="flex items-center">
            <Button
              outline
              disabled={disabled}
              className="bg-white"
              text="Đổi mật khẩu"
              onClick={() => setOpenChangePassword(true)}
            />
          </div>
        </Field>
        <Form.Footer
          className="mt-1"
          isReverse={false}
          submitProps={{ large: true, className: "shadow", disabled }}
        />
      </Form>
      <Form
        title="Thay đổi mật khẩu"
        dialog
        defaultValues={{
          password: "",
          retypePassword: "",
        }}
        isOpen={openChangepassword}
        onClose={() => setOpenChangePassword(null)}
        onSubmit={async (data) => {
          try {
            await MemberService.updateMemberPassword(member?.id, data.password);
            setOpenChangePassword(null);
            toast.success("Thay đổi mật khẩu thành công.");
          } catch (err) {
            toast.error("Thay đổi mật khẩu thất bại. " + err.message);
          }
        }}
        validate={{
          retypePassword: (values) =>
            values.password != values.retypePassword ? "Mật khẩu nhập lại không trùng khớp" : "",
        }}
      >
        <Field required name="password" label="Mật khẩu mới">
          <Input type="password" />
        </Field>
        <Field required name="retypePassword" label="Nhập lại mật khẩu mới">
          <Input type="password" />
        </Field>
        <Form.Footer />
      </Form>
      <ChangeEmailForm
        isOpen={openChangeEmail}
        onClose={() => {
          setOpenChangeEmail(false);
        }}
      />
    </>
  );
}

function ChangeEmailForm({ ...props }: FormProps) {
  const [hasOTPSent, setHasOTPSent] = useState("");
  const { member, logoutMember } = useAuth();
  const toast = useToast();

  return (
    <Form
      dialog
      title="Đổi email"
      width={500}
      {...props}
      onSubmit={async (data) => {
        if (hasOTPSent) {
          if (!data.otp || !data.email) {
            toast.info("Vui lòng nhập OTP và mật khẩu mới");
            return;
          }
          try {
            await MemberService.updateMemberEmail(hasOTPSent, data.otp, data.email);
            toast.success("Đổi email thành công. Bạn có thể đăng nhập bằng email mới.");
            props.onClose();
            logoutMember();
          } catch (err) {
            toast.error("Đổi email thất bại. " + err.message);
          }
        } else {
          try {
            await MemberService.sendOTP(member.username);
            toast.success("Gửi OTP thành công. Xin kiểm tra hộp thư của email đã nhập.");
            setHasOTPSent(member.username);
          } catch (err) {
            toast.error("Gửi OTP thất bại. " + err.message);
          }
        }
      }}
    >
      <Field label="Email hiện tại" readOnly>
        <Input type="email" value={member.username} />
      </Field>
      {hasOTPSent && (
        <>
          <Field name="otp" label="Mã OTP">
            <Input />
          </Field>
          <Field name="email" label="Email mới">
            <Input type="email" />
          </Field>
        </>
      )}
      <Form.Footer
        submitText={hasOTPSent ? "Xác nhận đổi email" : "Nhận mã OTP qua email hiện tại"}
      />
    </Form>
  );
}
