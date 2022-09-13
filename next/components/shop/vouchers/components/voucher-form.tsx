import React, { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RiAddFill, RiArrowDownSLine, RiCloseFill, RiImageAddFill } from "react-icons/ri";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { useAuth } from "../../../../lib/providers/auth-provider";
import {
  ISO_DAYS_OF_WEEK,
  ShopVoucher,
  SHOP_VOUCHER_TYPES,
} from "../../../../lib/repo/shop-voucher.repo";
import {
  Button,
  Checkbox,
  DatePicker,
  Editor,
  Field,
  Form,
  FormProps,
  Input,
  Label,
  Select,
  Switch,
} from "../../../shared/utilities/form";
import { Accordion, Img } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { AvatarUploader } from "../../../shared/utilities/uploader/avatar-uploader";
import { VoucherDetailsFields } from "./voucher-details";

interface PropsType extends FormProps {
  voucher: ShopVoucher;
}
export function VoucherForm({ voucher, ...props }: PropsType) {
  const [openAppliedCondition, setOpenAppliedCondition] = useState(false);
  const { staffPermission } = useAuth();

  return (
    <>
      <DataTable.Form
        extraDialogClass="bg-transparent"
        extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
        extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
        footerProps={{
          className: "justify-center",
          submitProps: { className: "h-14 w-64", disabled: !staffPermission("WRITE_VOUCHERS") },
          cancelText: "",
        }}
        width={voucher?.id ? "1080px" : "550px"}
        grid
        beforeSubmit={(data) => ({
          ...data,
        })}
      >
        <div
          className={`${voucher?.id ? "col-span-6" : "col-span-12"
            } grid grid-cols-12 gap-x-5 auto-rows-min`}
        >
          <Form.Title title="Thông tin chung" />
          {voucher?.id && <ImageFields />}
          <Field
            name="code"
            label="Mã khuyến mãi"
            cols={6}
            required
            readOnly={!!voucher?.id}
            validation={{ codeValid: (val) => validateKeyword(val) }}
          >
            <Input />
          </Field>
          <Field name="type" label="Loại khuyến mãi" cols={6} required readOnly={!!voucher?.id}>
            <Select options={SHOP_VOUCHER_TYPES} />
          </Field>
          <Field name="description" label="Mô tả" cols={12} required>
            <Input />
          </Field>
          {voucher?.id && (
            <>
              <Field name="content" label="Nội dung voucher" cols={12}>
                <Editor maxHeight="300px" />
              </Field>
              <div
                className="flex justify-between col-span-12 mb-4 text-lg font-semibold text-gray-400 cursor-pointer hover:text-primary"
                onClick={() => {
                  setOpenAppliedCondition(!openAppliedCondition);
                }}
              >
                <Form.Title title="Điều kiện áp dụng" />
                <i
                  className={`transform flex-center transition group-hover:text-primary w-6 h-6 text-2xl origin-center ${openAppliedCondition ? "rotate-180" : ""
                    }`}
                >
                  <RiArrowDownSLine />
                </i>
              </div>
              <Accordion
                isOpen={openAppliedCondition}
                className="grid grid-cols-12 col-span-12 gap-x-5"
              >
                <Field name="startDate" label="Ngày bắt đầu" cols={6}>
                  <DatePicker startOfDay />
                </Field>
                <Field name="endDate" label="Ngày kết thúc" cols={6}>
                  <DatePicker endOfDay />
                </Field>
                <Field
                  name="applyISODayOfWeek"
                  label="Ngày trong tuần áp dụng"
                  description="Áp dụng tất cả nếu không chọn"
                  cols={12}
                >
                  <Checkbox multi options={ISO_DAYS_OF_WEEK} />
                </Field>
                <ApplyTimeOfDayField />
                <Field
                  name="issueNumber"
                  label="Số lượng phát hành"
                  description="Nhập 0 để không giới hạn số lượng"
                  cols={6}
                >
                  <Input number />
                </Field>
                <Field name="issueByDate" label=" " cols={6}>
                  <Checkbox className="mt-6" placeholder="Phát hành mỗi ngày" />
                </Field>
                <Field
                  name="useLimit"
                  label="Số lượng dùng mỗi khách"
                  description="Nhập 0 để không giới hạn số lượng"
                  cols={6}
                >
                  <Input number />
                </Field>
                <Field name="useLimitByDate" label=" " cols={6}>
                  <Checkbox className="mt-6" placeholder="Số lượng dùng theo ngày" />
                </Field>
                <Field name="isPrivate" label="" cols={6}>
                  <Checkbox placeholder="Mã riêng tư" />
                </Field>
                <Field name="isActive" label="" cols={6}>
                  <Switch placeholder="Kích hoạt" />
                </Field>
              </Accordion>
            </>
          )}
        </div>
        {voucher?.id && <VoucherDetailsFields />}
      </DataTable.Form>
    </>
  );
}

function ApplyTimeOfDayField() {
  const name = "applyTimeOfDay";
  const {
    watch,
    register,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();
  register(name);

  const convertTimeToDate = (time: string) => {
    const splits = time.split(":");
    const date = new Date();
    date.setHours(Number(splits[0]));
    date.setMinutes(Number(splits[1]));
    return date;
  };

  const timeFrames: string[][] = watch(name) || [];

  return (
    <div className="mb-3 col-span-full">
      <Label text="Khung giờ áp dụng" description="Sử dụng tất cả khung giờ nếu để trống" />
      {timeFrames?.map((timeFrame, timeIndex) => (
        <div key={timeFrame.toString() + timeIndex} className="flex items-center mt-2 gap-x-2">
          <div className="w-36">
            <DatePicker
              readOnly={isSubmitting}
              timeOnly
              timeIntervals={30}
              clearable={false}
              value={convertTimeToDate(timeFrame[0])}
              onChange={(date) => {
                const time =
                  (date as Date).getHours().toString().padStart(2, "0") +
                  ":" +
                  (date as Date).getMinutes().toString().padStart(2, "0");
                setValue(`${name}.${timeIndex}`, [time, timeFrame[1]]);
              }}
            />
          </div>
          <span>-</span>
          <div className="w-36">
            <DatePicker
              readOnly={isSubmitting}
              timeOnly
              timeIntervals={30}
              clearable={false}
              value={convertTimeToDate(timeFrame[1])}
              onChange={(date) => {
                const time =
                  (date as Date).getHours().toString().padStart(2, "0") +
                  ":" +
                  (date as Date).getMinutes().toString().padStart(2, "0");
                setValue(`${name}.${timeIndex}`, [timeFrame[0], time]);
              }}
            />
          </div>
          <Button
            className={`px-2`}
            hoverDanger
            unfocusable
            disabled={isSubmitting}
            icon={<RiCloseFill />}
            onClick={() => {
              timeFrames.splice(timeIndex, 1);
              setValue(`${name}`, [...timeFrames]);
            }}
          />
        </div>
      ))}
      <Button
        className="px-0 my-2"
        textPrimary
        unfocusable
        disabled={isSubmitting}
        icon={<RiAddFill />}
        text="Thêm khung giờ"
        onClick={() => {
          timeFrames.push(["07:00", "21:00"]);
          setValue(name, [...timeFrames]);
        }}
      />
    </div>
  );
}

function ImageFields() {
  const { watch, setValue, register } = useFormContext();
  register("image");
  const image = watch("image");
  const avatarUploaderRef = useRef<any>();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  return (
    <div className="col-span-12 mb-3">
      <Label text="Hình khuyến mãi" />
      <div className="flex">
        <div className="w-24 h-24 overflow-hidden bg-white border border-gray-300 rounded-lg flex-center">
          {image ? (
            <Img className="w-full" compress={300} lazyload={false} src={image} showImageOnClick />
          ) : (
            <i className="text-4xl text-gray-500">
              <RiImageAddFill />
            </i>
          )}
        </div>
        <div className="flex-col flex-1 p-4 ml-4 bg-white border border-gray-300 border-dashed rounded flex-center">
          <span className="text-sm">Ảnh PNG, JPEG, JPG không quá 10Mb. Tỉ lệ 1:1.</span>
          <Button
            className="px-3 text-sm h-9 hover:underline"
            textPrimary
            text="Tải ảnh lên"
            isLoading={uploadingAvatar}
            onClick={() => {
              avatarUploaderRef.current().onClick();
            }}
          />
          <AvatarUploader
            onRef={(ref) => {
              avatarUploaderRef.current = ref;
            }}
            onUploadingChange={setUploadingAvatar}
            onImageUploaded={(val) => setValue("image", val)}
          />
        </div>
      </div>
    </div>
  );
}
