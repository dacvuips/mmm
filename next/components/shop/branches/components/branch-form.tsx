import { useState } from "react";
import { useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { RiAddFill, RiCloseFill } from "react-icons/ri";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { parseAddress } from "../../../../lib/helpers/parser";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  OperatingTime,
  OPERATING_TIME_STATUS,
  ShopBranch,
} from "../../../../lib/repo/shop-branch.repo";
import { SHOP_KM_OPTIONS } from "../../../../lib/repo/shop-config.repo";
import {
  Button,
  DatePicker,
  Field,
  Form,
  FormProps,
  Input,
  Select,
  Switch,
} from "../../../shared/utilities/form";
import { AddressFields } from "../../../shared/utilities/misc";
import { useBranchesContext } from "../providers/branches-provider";
import { BranchLocationDialog } from "./branch-location-dialog";

interface Props extends FormProps {
  openBranch: Partial<ShopBranch>;
  editDisabled: boolean;
}
export function BranchForm({ openBranch, editDisabled, ...props }: Props) {
  const toast = useToast();
  const { onCreateOrUpdateBranch } = useBranchesContext();

  return (
    <Form
      grid
      dialog
      extraDialogClass="bg-transparent"
      extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
      extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
      width={openBranch ? "1180px" : "600px"}
      defaultValues={openBranch}
      title={`${openBranch ? "Chỉnh sửa" : "Thêm"} cửa hàng`}
      {...props}
      onSubmit={async (data) => {
        if (!data.longitude || !data.latitude) {
          toast.info("Yêu cầu chọn toạ độ cửa hàng");
          return;
        }
        let newData = {} as Partial<ShopBranch>;
        const location = {
          type: "Point",
          coordinates: [data.longitude, data.latitude],
        };
        if (openBranch) {
          newData = {
            id: openBranch.id,
            ...data,
            location,
          };
          delete newData.latitude;
          delete newData.longitude;
        } else {
          const { name, address, provinceId, wardId, districtId, email, phone, coverImage } = data;
          newData = {
            name,
            address,
            provinceId,
            wardId,
            districtId,
            email,
            phone,
            coverImage,
            isOpen: true,
            location,
          };
        }
        await onCreateOrUpdateBranch(newData);
        props.onClose();
      }}
    >
      <div
        className={`${openBranch ? "col-span-6" : "col-span-12"
          } grid grid-cols-12 gap-x-5 auto-rows-min`}
      >
        <Form.Title title="Thông tin cửa hàng" />
        <Field name="name" label="Tên cửa hàng" cols={12} required validation={{
          nameValidator: (value) => validateKeyword(value)
        }}>
          <Input />
        </Field>
        <Field name="phone" label="Số điện thoại" cols={12} required>
          <Input />
        </Field>
        <LocationFields />
      </div>
      {openBranch && <BranchDetailsFields />}

      <Form.Footer
        className="justify-center"
        cancelText=""
        submitProps={{ className: "h-14 w-64", disabled: editDisabled }}
      />
    </Form>
  );
}

function LocationFields() {
  const { register, watch, setValue, getValues } = useFormContext();
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
      <AddressFields
        provinceLabelName="provinceName"
        districtLabelName="districtName"
        wardLabelName="wardName"
        provinceRequired
        districtRequired
      />
      <Field label="Địa chỉ (Số nhà, Đường)" name="address" required>
        <Input />
      </Field>
      <Field
        label="Toạ độ"
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
          value={[latitude, longitude].filter(Boolean).join(", ") || "[Chưa có toạ độ]"}
          readOnly
        />
      </Field>
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

function BranchDetailsFields() {
  const { watch } = useFormContext();
  const shipUseOneKmFee: boolean = watch("shipUseOneKmFee");

  return (
    <>
      <div className="col-span-6">
        <Form.Title title="Cấu hình phí giao hàng" />
        <Field label="Thời gian nhà hàng chuẩn bị" name="shipPreparationTime">
          <Input className="h-12" />
        </Field>
        <div className="flex">
          <Field label="Phí giao hàng dưới 1km" name="shipOneKmFee" className="flex-1">
            <Input className="h-12" number suffix="VND" readOnly={!shipUseOneKmFee} />
          </Field>

          <Field label=" " name="shipUseOneKmFee" className="flex-1 pl-5">
            <Switch placeholder="Tính phí ship dưới 1km" className="h-12 font-semibold" />
          </Field>
        </div>
        <div className="flex">
          <Field className="flex-1" label="Phí giao hàng theo" name="shipDefaultDistance">
            <Select options={SHOP_KM_OPTIONS} className="inline-grid h-12" />
          </Field>
          <span className="px-2 pt-10">-</span>
          <Field className="flex-1" label="Đồng giá" name="shipDefaultFee">
            <Input className="h-12" number suffix="VND" />
          </Field>
        </div>
        <Field label="Phí giao hàng cho mỗi km tiếp theo" name="shipNextFee">
          <Input className="h-12" number suffix="VND" />
        </Field>
        <Field label="Ghi chú giao hàng" name="shipNote">
          <Input className="h-12" />
        </Field>

        <OperatingTimeFields />
      </div>
    </>
  );
}

function OperatingTimeFields() {
  const { watch } = useFormContext();
  const { fields } = useFieldArray({ name: "operatingTimes" });

  return (
    <>
      <Form.Title title="Thời gian hoạt động" />
      {(fields as ({ id: string } & OperatingTime)[]).map((operatingTime, index) => {
        const status = watch(`operatingTimes.${index}.status`);

        return (
          <div key={operatingTime.id} className="flex mb-3">
            <div className="w-20 px-2 pt-2 font-semibold text-gray-600">
              {DATE_NAME[operatingTime.day]}
            </div>
            <div className="flex-1">
              <Field name={`operatingTimes.${index}.status`} noError>
                <Select className="w-36" options={OPERATING_TIME_STATUS} />
              </Field>
              <Field name={`operatingTimes.${index}.day`} noError className="hidden">
                <Input />
              </Field>
              {status == "TIME_FRAME" && (
                <TimeframeFields name={`operatingTimes.${index}.timeFrames`} />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

function TimeframeFields({ name }: { name: string }) {
  const { watch, register, setValue } = useFormContext();
  const { isSubmitting } = useFormState();
  register(name);

  const convertTimeToDate = (time: string) => {
    const splits = time.split(":");
    const date = new Date();
    date.setHours(Number(splits[0]));
    date.setMinutes(Number(splits[1]));
    return date;
  };

  const timeFrames: string[][] = watch(name);

  return (
    <>
      {timeFrames.map((timeFrame, timeIndex) => (
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
            className={`px-2 ${timeIndex == 0 ? "opacity-0 pointer-events-none" : ""}`}
            hoverDanger
            disabled={isSubmitting}
            icon={<RiCloseFill />}
            onClick={() => {
              if (timeIndex == 0) return;
              timeFrames.splice(timeIndex, 1);
              setValue(`${name}`, [...timeFrames]);
            }}
          />
        </div>
      ))}
      <Button
        className="px-0 my-2"
        textPrimary
        disabled={isSubmitting}
        icon={<RiAddFill />}
        text="Thêm khung giờ"
        onClick={() => {
          timeFrames.push(["07:00", "21:00"]);
          setValue(`${name}`, [...timeFrames]);
        }}
      />
    </>
  );
}

const DATE_NAME = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "C.Nhật",
};
