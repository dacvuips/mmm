import firebase from "firebase";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { BiEdit } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

import { useShopLayoutContext } from "../../../layouts/shop-layout/providers/shop-layout-provider";
import { parseAddress } from "../../../lib/helpers/parser";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { CategoryService } from "../../../lib/repo/category.repo";
import { ShopBranchService } from "../../../lib/repo/shop-branch.repo";
import { ShopCategoryService } from "../../../lib/repo/shop-category.repo";
import { STAFF_SCOPES } from "../../../lib/repo/staff.repo";
import { Label } from "../../shared/utilities/form";
import { Button } from "../../shared/utilities/form/button";
import { Field } from "../../shared/utilities/form/field";
import { Form } from "../../shared/utilities/form/form";
import { ImageInput } from "../../shared/utilities/form/image-input";
import { Input } from "../../shared/utilities/form/input";
import { Select } from "../../shared/utilities/form/select";
import { AddressFields, Img, Spinner } from "../../shared/utilities/misc";
import { BranchLocationDialog } from "../branches/components/branch-location-dialog";
import { InstructionsProvider, useInstructionsContext } from "./providers/instructions-provider";

export function InstructionPage() {
  const { handleCompleteInstruction } = useShopLayoutContext();

  {
    return (
      <InstructionsProvider onComplete={() => handleCompleteInstruction()}>
        <InstructionForm />
      </InstructionsProvider>
    );
  }
}
function InstructionForm() {
  const { handleCompleteInstruction } = useShopLayoutContext();
  const { handleSubmit, defaultValues, step } = useInstructionsContext();
  const { logoutMember } = useAuth();

  if (step < 0) return <Spinner />;
  return (
    <>
      <Form
        allowResetDefaultValues
        className="relative flex flex-col items-center w-full max-w-xl px-6 pt-2 pb-4 mx-auto my-20 text-gray-700 bg-white shadow min-h-xl"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between w-full border-b border-gray-200">
          <img src="/assets/img/logo.png" className="object-contain w-auto h-8" />
          <div className="relative py-4 text-lg font-bold text-gray-600 uppercase">
            H?????ng d???n t???o c???a h??ng
          </div>
        </div>
        <div className="flex flex-col flex-1 w-full">
          <Instructions />
          <InstructionsFooter />
        </div>
        <FormSpinner />
        <div className="absolute flex justify-between w-full -bottom-8">
          <Button
            className="h-auto text-sm underline hover:underline"
            text={"????ng nh???p b???ng t??i kho???n kh??c"}
            onClick={() => {
              logoutMember();
            }}
          />
          <Button
            className="h-auto text-sm underline hover:underline"
            text={"B??? qua b?????c thi???t l???p"}
            onClick={() => {
              handleCompleteInstruction(true);
            }}
          />
        </div>
      </Form>
    </>
  );
}

function FormSpinner() {
  const { isSubmitting } = useFormState();

  if (!isSubmitting) return null;
  return (
    <div className="absolute top-0 left-0 z-40 flex items-center w-full h-full bg-gray-100 bg-opacity-40 animate-emerge">
      <Spinner />
    </div>
  );
}

function InstructionsFooter() {
  const { step, prevStep, steps } = useInstructionsContext();

  return (
    <div className="flex items-center col-span-12 mt-4">
      <Button
        className="pl-2 uppercase"
        text="Tr??? v???"
        onClick={prevStep}
        outline
        icon={<RiArrowLeftSLine />}
        iconClassName="text-2xl mb-0.5"
        disabled={step == 0}
      ></Button>
      <div className="flex-1 font-semibold text-center">
        {step + 1} / {steps?.length} b?????c
      </div>
      <Button
        className="pr-2 uppercase shadow bg-brand hover:bg-brand-dark"
        text={step == steps?.length - 1 ? "Ho??n th??nh" : "Ti???p theo"}
        primary
        submit
        icon={<RiArrowRightSLine />}
        iconClassName="text-2xl mb-0.5"
        iconPosition="end"
      ></Button>
    </div>
  );
}

function Instructions() {
  const { watch } = useFormContext();
  const data = watch();
  const { step } = useInstructionsContext();
  // const step = 1;

  return (
    <div className="flex-1">
      {
        {
          0: <ConfigShop />,
          1: <ConfigBranch />,
          2: <ConfigNewStaff />,
          3: <ConfigNewDriver />,
          4: <ConfigNewCategory />,
          5: <ConfigNewProduct />,
          6: <VerifyPhone />,
        }[step]
      }
    </div>
  );
}

function InstructionTitle({ text }: { text: string }) {
  return (
    <div className="relative my-6 text-lg font-medium text-center text-gray-600 uppercase">
      {text}
      <div className="absolute w-24 h-1.5 transform -translate-x-1/2 bg-brand -bottom-2 left-1/2"></div>
    </div>
  );
}

function VerifyPhone() {
  const { member, verifyPhoneMember } = useAuth();
  const { nextStep } = useInstructionsContext();
  let [confirmResult, setConfirmResult] = useState(null);
  const captchaRef = useRef(null);
  const { watch } = useFormContext();
  const [submitting, setSubmitting] = useState(false);
  const otp = watch("otp");
  const toast = useToast();

  const getConfirmResult = async (phone: string) => {
    try {
      setSubmitting(true);
      let appVerifier = new firebase.auth.RecaptchaVerifier(captchaRef.current, {
        size: "invisible",
        callback: (response: any) => {},
      });
      confirmResult = await firebase
        .auth()
        .signInWithPhoneNumber(`+84${phone.substring(1, phone.length)}`, appVerifier);
      toast.info("M?? OTP ???? ???????c g???i ?????n s??? ??i???n tho???i tr??n");
    } catch (error) {
      toast.error("???? x???y ra l???i x??c th???c OTP. " + error.message);
    } finally {
      setSubmitting(false);
      setConfirmResult(confirmResult);
    }
  };
  const getTokenPhoneVerify = async (otp) => {
    try {
      setSubmitting(true);
      await confirmResult.confirm(otp).then(async (res) => {
        let idToken = await res.user.getIdToken();
        if (idToken) {
          let res = await verifyPhoneMember(idToken);
          if (res) {
            nextStep();
          }
        }
      });
    } catch (error) {
      toast.error("???? x???y ra l???i k??ch ho???t s??? ??i???n tho???i " + error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <InstructionTitle text="X??c th???c s??? ??i???n tho???i" />
      {!member.phoneVerified ? (
        <>
          <div id="recaptcha-container" ref={captchaRef}></div>
          <Field
            label="S??? ??i???n tho???i ????ng k??"
            description="B?????c n??y ????? ?????m b???o s??? ??i???n tho???i b???n d??ng ch??nh x??c"
            cols={12}
            readOnly
          >
            <Input value={member.phone} placeholder="Nh???p s??? ??i???n tho???i" />
          </Field>
          {confirmResult && (
            <Field name="otp" label="M?? OTP ???????c g???i qua tin nh???n" cols={12}>
              <Input />
            </Field>
          )}
          <div className="flex-center">
            {confirmResult ? (
              <Button
                text="X??c th???c"
                className="bg-brand hover:bg-brand-dark"
                asyncLoading={submitting}
                onClick={async () => {
                  if (otp) {
                    await getTokenPhoneVerify(otp);
                  } else {
                    toast.info("Vui l??ng nh???p m?? OTP");
                  }
                }}
                primary
              />
            ) : (
              <Button
                text="Nh???n m?? OTP"
                asyncLoading={submitting}
                className="bg-brand hover:bg-brand-dark"
                onClick={async () => {
                  await getConfirmResult(member.phone);
                }}
                primary
              />
            )}
          </div>
        </>
      ) : (
        <div className="w-full py-12 flex-center">
          <i className="pr-3 text-5xl text-success">
            <FaCheckCircle />
          </i>
          <span className="text-lg font-medium">S??? ??i???n tho???i c???a h??ng n??y ???? ???????c x??c th???c</span>
        </div>
      )}
    </>
  );
}
function ConfigShop() {
  const { setValue } = useFormContext();
  const images = [
    "https://i.imgur.com/jgxVu7m.jpg",
    "https://i.imgur.com/jLED7jA.jpg",
    "https://i.imgur.com/l52tyHN.jpg",
    "https://i.imgur.com/ANVsnXA.jpg",
    "https://i.imgur.com/M8mugJy.jpg",
    "https://i.imgur.com/R3JnPRV.jpg",
    "https://i.imgur.com/no04sRk.jpg",
    "https://i.imgur.com/dbj7PXu.png",
  ];
  return (
    <>
      <InstructionTitle text="C???u h??nh c???a h??ng" />
      <Field name="shopName" label="T??n c???a h??ng" cols={12} required>
        <Input />
      </Field>
      <Field label="Danh m???c c???a h??ng" name="categoryId" cols={12} required>
        <Select optionsPromise={() => ShopCategoryService.getAllOptionsPromise()} />
      </Field>
      <Field name="shopCover" label="???nh n???n c???a h??ng (T??? l??? 16:9)" cols={12} required>
        <ImageInput largeImage ratio169 />
      </Field>
      <Label text="???nh n???n c???a h??ng m???u" />
      <div className="grid grid-cols-4 gap-2">
        {images.map((img) => (
          <Img
            key={img}
            ratio169
            compress={200}
            src={img}
            rounded
            className="border border-gray-300 rounded cursor-pointer hover:border-brand"
            onClick={() => {
              setValue("shopCover", img);
            }}
          />
        ))}
      </div>
    </>
  );
}
function ConfigBranch() {
  const { member } = useAuth();
  const { register, watch, setValue, getValues } = useFormContext();

  const images = [
    "https://i.imgur.com/jgxVu7m.jpg",
    "https://i.imgur.com/jLED7jA.jpg",
    "https://i.imgur.com/l52tyHN.jpg",
    "https://i.imgur.com/ANVsnXA.jpg",
    "https://i.imgur.com/M8mugJy.jpg",
    "https://i.imgur.com/R3JnPRV.jpg",
    "https://i.imgur.com/no04sRk.jpg",
    "https://i.imgur.com/dbj7PXu.png",
  ];
  const [openLocation, setOpenLocation] = useState<{
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }>();

  register("latitude");
  register("longitude");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  return (
    <>
      <InstructionTitle text="C???u h??nh c???a h??ng ?????u ti??n" />
      <InstructionFillData
        title="T??? ?????ng ??i???n d??? li???u m???u"
        subtitle="C???a h??ng ch??nh - Qu???n 1, TP. HCM"
        onClick={() => {
          setValue("name", "C???a h??ng ch??nh");
          setValue("phone", member.phone);
          setValue("provinceId", "70");
          setValue("districtId", "7100");
          setValue("wardId", "71030");
          setValue("address", "11 Nguy???n ????nh Chi???u, P. ??a Kao, Qu???n 1, TP. H??? Ch?? Minh");
          setValue("latitude", 10.7892908);
          setValue("longitude", 106.7006484);
        }}
      />
      <Field name="name" label="T??n c???a h??ng" required>
        <Input />
      </Field>
      <Field name="phone" label="S??? ??i???n tho???i" required>
        <Input />
      </Field>
      <AddressFields
        provinceLabelName="provinceName"
        districtLabelName="districtName"
        wardLabelName="wardName"
        provinceRequired
        districtRequired
        wardRequired
      />
      <Field label="?????a ch??? (S??? nh??, ???????ng)" name="address" required>
        <Input />
      </Field>
      <Field
        label="To??? ?????"
        onClick={() => {
          setOpenLocation({
            address: parseAddress({
              address: getValues("address"),
              province: getValues("provinceName"),
              district: getValues("districtName"),
              ward: getValues("wardName"),
            }),
            location: {
              longitude,
              latitude,
            },
          });
        }}
      >
        <Input
          inputClassName="bg-white"
          value={[latitude, longitude].filter(Boolean).join(", ") || "[Ch??a c?? to??? ?????]"}
          readOnly
        />
      </Field>
      <Field name="email" label="Email">
        <Input type="email" />
      </Field>
      <Field
        name="coverImage"
        label="???nh b??a chi nh??nh"
        description="T??? l??? 16:9. H??? th???ng s??? d??ng ???nh c???a h??ng n???u ????? tr???ng"
      >
        <ImageInput ratio169 cover largeImage />
      </Field>
      <Label text="???nh n???n c???a h??ng m???u" />
      <div className="grid grid-cols-4 gap-2">
        {images.map((img) => (
          <Img
            key={img}
            ratio169
            compress={200}
            src={img}
            rounded
            className="border border-gray-300 rounded cursor-pointer hover:border-brand"
            onClick={() => {
              setValue("coverImage", img);
            }}
          />
        ))}
      </div>

      <BranchLocationDialog
        isOpen={!!openLocation}
        onClose={() => setOpenLocation(null)}
        address={openLocation?.address}
        location={openLocation?.location}
        onSelectLocation={({ latitude, longitude }) => {
          setValue("latitude", latitude);
          setValue("longitude", longitude);
        }}
      />
    </>
  );
}

function ConfigNewStaff() {
  const { member } = useAuth();
  const { setValue } = useFormContext();

  return (
    <>
      <InstructionTitle text="T??i kho???n nh??n vi??n" />
      <InstructionFillData
        title="T??? ?????ng ??i???n d??? li???u m???u"
        subtitle="Nh??n vi??n Nguy???n Tu???n Anh"
        onClick={() => {
          setValue("name", "Nguy???n Tu???n Anh");
          setValue("phone", member.phone);
          ShopBranchService.getAllOptionsPromise().then((res) =>
            setValue("branchId", res[0].value)
          );
          setValue("username", member.phone);
          setValue("address", "11 Nguy???n ????nh Chi???u, P. ??a Kao, Qu???n 1, TP. H??? Ch?? Minh");
          setValue("scopes", [STAFF_SCOPES[0].value]);
        }}
      />
      <Field name="name" label="T??n nh??n vi??n" required>
        <Input />
      </Field>
      <Field name="branchId" label="C???a h??ng tr???c thu???c" required>
        <Select optionsPromise={() => ShopBranchService.getAllOptionsPromise()} />
      </Field>
      <Field label="M?? c???a h??ng" readOnly>
        <Input value={member.code} />
      </Field>
      <Field name="username" label="T??n ????ng nh???p">
        <Input />
      </Field>
      <Field name="phone" label="S??? ??i???n tho???i">
        <Input />
      </Field>
      <Field name="address" label="?????a ch???">
        <Input />
      </Field>
      <Field name="avatar" label="Avatar">
        <ImageInput avatar />
      </Field>
      <Field name="scopes" label="Quy???n h???n">
        <Select multi options={STAFF_SCOPES} />
      </Field>
    </>
  );
}
function ConfigNewDriver() {
  const { member } = useAuth();
  const { setValue } = useFormContext();

  return (
    <>
      <InstructionTitle text="T??i x??? n???i b???" />
      <InstructionFillData
        title="T??? ?????ng ??i???n d??? li???u m???u"
        subtitle="T??i x??? Tr???n Minh Qu??n"
        onClick={() => {
          setValue("name", "Tr???n Minh Qu??n");
          setValue("phone", member.phone);
          setValue("licensePlates", "59-C1 3462");
        }}
      />
      <Field name="name" label="T??n t??i x???" required>
        <Input />
      </Field>
      <Field name="phone" label="S??? ??i???n tho???i" className="mr-4" required>
        <Input />
      </Field>
      <Field name="licensePlates" label="Bi???n s??? xe">
        <Input />
      </Field>
      <Field name="avatar" label="Avatar">
        <ImageInput avatar />
      </Field>
    </>
  );
}

function ConfigNewCategory() {
  const { setValue } = useFormContext();

  return (
    <>
      <InstructionTitle text="Danh m???c s???n ph???m" />
      <InstructionFillData
        title="T??? ?????ng ??i???n d??? li???u m???u"
        subtitle="Danh m???c Tr?? S???a"
        onClick={() => {
          setValue("name", "Tr?? S???a");
        }}
      />
      <Field name="name" label="T??n danh m???c" required>
        <Input />
      </Field>
      <Field name="priority" label="????? ??u ti??n">
        <Input number defaultValue={1} />
      </Field>
    </>
  );
}

function ConfigNewProduct() {
  const { setValue } = useFormContext();
  return (
    <>
      <InstructionTitle text="S???n ph???m" />
      <InstructionFillData
        title="T??? ?????ng ??i???n d??? li???u m???u"
        subtitle="S???n ph???m Tr?? S???a Tr??n Ch??u ??en"
        onClick={() => {
          setValue("name", "Tr?? S???a Tr??n Ch??u ??en");
          CategoryService.getAllOptionsPromise().then((res) => {
            if (res.length) {
              setValue("categoryId", res[0].value);
            }
          });
          setValue("basePrice", 20000);
        }}
      />
      <Field name="name" label="T??n s???n ph???m" required>
        <Input />
      </Field>
      <Field label="Danh m???c" name="categoryId" required>
        <Select optionsPromise={() => CategoryService.getAllOptionsPromise()} />
      </Field>
      <Field name="basePrice" label="Gi?? b??n" required>
        <Input number currency />
      </Field>
    </>
  );
}

function InstructionFillData({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => any;
}) {
  return (
    <div
      className="flex items-center px-3 py-2 mb-4 text-gray-700 border rounded cursor-pointer border-brand bg-brand-light hover:bg-brand hover:text-white"
      onClick={onClick}
    >
      <div className="flex-1 pr-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm">{subtitle}</div>
      </div>
      <i>
        <BiEdit />
      </i>
    </div>
  );
}
