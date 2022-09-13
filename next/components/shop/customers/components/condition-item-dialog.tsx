import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FaEquals,
  FaGreaterThan,
  FaGreaterThanEqual,
  FaLessThan,
  FaLessThanEqual,
  FaNotEqual,
} from "react-icons/fa";
import { CrudRepository } from "../../../../lib/repo/crud.repo";
import { Radio } from "../../../shared/utilities/form";
import { DatePicker } from "../../../shared/utilities/form/date";
import { Field } from "../../../shared/utilities/form/field";
import { Form, FormProps } from "../../../shared/utilities/form/form";
import { Input } from "../../../shared/utilities/form/input";
import { Select } from "../../../shared/utilities/form/select";
import { Switch } from "../../../shared/utilities/form/switch";
import { useConditionContext } from "../providers/condition-provider";
import { TEXT_OPTIONS } from "./condition.const";

interface PropsType extends FormProps {
  onConditionChange?: (data: any) => any;
}
export function ConditionItemDialog({ onConditionChange, ...props }: PropsType) {
  const { selectedCondition, customerGroupResources } = useConditionContext();

  const defaultValues = useMemo(() => {
    if (customerGroupResources && props.isOpen) {
      if (selectedCondition) {
        return { ...selectedCondition };
      } else {
        return {
          resource: customerGroupResources[0].id,
        };
      }
    } else {
      return {};
    }
  }, [selectedCondition, props.isOpen]);

  return (
    <Form
      {...props}
      dialog
      title={selectedCondition ? "Chỉnh sửa điều kiện" : "Thêm điều kiện"}
      width="900px"
      defaultValues={defaultValues}
      onSubmit={async (data) => {
        const { resource, value, comparison, display, resourceType, resourceOpts } = data;
        onConditionChange({
          resource,
          value,
          comparison,
          display,
          resourceType,
          resourceOpts,
        });
        props.onClose();
      }}
    >
      <ConditionTypeField defaultValues={defaultValues} />
      <Form.Footer />
    </Form>
  );
}

function ConditionTypeField({ defaultValues }) {
  const { watch, setValue, register, getValues } = useFormContext();
  const { customerGroupResources, selectedCondition } = useConditionContext();
  register("resource");
  const [loadDone, setLoadDone] = useState(false);
  const resource = watch("resource");
  const resourceType = useMemo(() => customerGroupResources.find((x) => x.id == resource)?.type, [
    resource,
  ]);

  useEffect(() => {
    setLoadDone(false);
    let value, resourceOpts, comparison;
    if (resource == selectedCondition?.resource) {
      value = defaultValues["value"];
      resourceOpts = defaultValues["resourceOpts"];
      comparison = defaultValues["comparison"];
    } else {
      switch (resourceType) {
        case "text": {
          value = "";
          resourceOpts = { type: "startsWith" };
          comparison = "$regex";
          break;
        }
        case "select": {
          value = "";
          comparison = SELECT_OPERATORS[0].value;
          break;
        }
        case "ref-multi": {
          value = [];
          comparison = SELECT_OPERATORS[0].value;
          break;
        }
        case "number": {
          value = 0;
          comparison = NUMBER_OPERATORS[0].value;
          break;
        }
        case "date": {
          value = new Date();
          resourceOpts = { periodType: "static", period: null };
          break;
        }
        case "boolean": {
          value = true;
          break;
        }
        case "address": {
          value = {
            provinceId: "",
            districtId: "",
            wardId: "",
          };
          break;
        }
      }
    }
    setValue("resourceType", resourceType);
    setValue("value", value);
    setValue("resourceOpts", resourceOpts);
    setValue("comparison", comparison);
    setTimeout(() => {
      setLoadDone(true);
    });
  }, [resource]);
  register("resourceType");
  register("resourceOpts");

  return (
    <div className="flex flex-wrap gap-x-2">
      <Field name="resource" className="w-80" label="Loại điều kiện">
        <Select options={customerGroupResources.map((x) => ({ value: x.id, label: x.name }))} />
      </Field>
      {loadDone && (
        <div className="flex flex-1 animate-emerge gap-x-2">
          {resourceType == "text" && <ConditionTextField />}
          {resourceType == "number" && <ConditionNumberField />}
          {resourceType == "select" && <ConditionSelectField />}
          {/* {resourceType == "exists" && <ConditionExistsField />} */}
          {resourceType == "boolean" && <ConditionBooleanField />}
          {resourceType == "date" && <ConditionDateField />}
          {resourceType == "ref-multi" && <ConditionRefMultiField />}
          {/* {resourceType == "address" && <ConditionAddressField />} */}
        </div>
      )}
    </div>
  );
}

function ConditionTextField() {
  return (
    <>
      <Field name="resourceOpts.type" className="w-56" label=" ">
        <Select options={TEXT_OPTIONS} />
      </Field>
      <Field name="value" className="flex-1" label={"Cụm từ"} required>
        <Input />
      </Field>
    </>
  );
}

function ConditionNumberField() {
  return (
    <>
      <Field name="comparison" className="w-56" label={"So sánh"}>
        <Select options={NUMBER_OPERATORS} />
      </Field>
      <Field name="value" className="flex-1" label={"Giá trị"}>
        <Input number />
      </Field>
    </>
  );
}

function ConditionSelectField() {
  const { watch, setValue, register } = useFormContext();
  const resource = watch("resource");
  const { customerGroupResources } = useConditionContext();
  const resourceOption = useMemo(() => customerGroupResources.find((x) => x.id == resource), [
    resource,
  ]);

  register("display");

  return (
    <>
      <Field name="comparison" className="w-56" label={"So sánh"}>
        <Select options={SELECT_OPERATORS} />
      </Field>
      <Field name="value" className="flex-1" label={"Giá trị"} required>
        <Select
          options={resourceOption?.meta.options.map((x) => ({
            value: x.id,
            label: x.name,
          }))}
          onChange={(value, extraVal) => {
            setValue("display", extraVal.label);
          }}
        />
      </Field>
    </>
  );
}

function ConditionExistsField() {
  return (
    <>
      <Field name="value" className="flex-1" label={" "}>
        <Radio
          options={[
            { value: true, label: "Tồn tại" },
            { value: false, label: "Không tồn tại" },
          ]}
        />
      </Field>
    </>
  );
}

function ConditionBooleanField() {
  return (
    <>
      <Field name="value" className="flex-1" label="Trạng thái">
        <Switch />
      </Field>
    </>
  );
}

function ConditionDateField() {
  const { watch } = useFormContext();
  const dateType = watch("resourceOpts.dateType");

  return (
    <>
      <Field className="w-52" label=" " name="resourceOpts.dateType">
        <Select options={DATE_OPTIONS} />
      </Field>
      {dateType != "range" && (
        <Field className="flex-1" name="value" label={"Giá trị"} required>
          <DatePicker />
        </Field>
      )}
      {dateType == "range" && (
        <Field className="flex-1" name="resourceOpts.range" label={"Giá trị"} required>
          <DatePicker selectsRange startOfDay endOfDay />
        </Field>
      )}
    </>
  );
}

function ConditionRefMultiField() {
  const { watch, setValue, register } = useFormContext();
  const resource: string = watch("resource");
  register("display");

  const { customerGroupResources } = useConditionContext();
  const resourceOption = useMemo(() => customerGroupResources.find((x) => x.id == resource), [
    resource,
  ]);

  return (
    <>
      <Field name="comparison" className="w-56" label={"So sánh"}>
        <Select options={SELECT_OPERATORS} />
      </Field>
      <Field className="flex-1" label={"Giá trị"} name="value" required>
        <Select
          optionsPromise={() =>
            (({}[resourceOption?.meta.ref] as CrudRepository<any>).getAllOptionsPromise({
              fragment: `${resourceOption?.meta.id} ${resourceOption?.meta.name}`,
              parseOption: (data) => ({
                value: data[resourceOption?.meta.id],
                label: data[resourceOption?.meta.name],
              }),
            }))
          }
          multi
          onChange={(value, extraVal) => {
            setValue("display", extraVal.map((x) => x.label).join(", "));
          }}
        />
      </Field>
    </>
  );
}

// function ConditionAddressField() {
//   const { watch, setValue, register } = useFormContext();
//   const wardValue: SegmentResource = watch("value.ward");
//   const districtValue: SegmentResource = watch("value.district");
//   const provinceValue: SegmentResource = watch("value.province");
//   register("display");

//   useEffect(() => {
//     setValue("display", [wardValue, districtValue, provinceValue].filter(Boolean).join(", "));
//   }, [wardValue, districtValue, provinceValue]);

//   return (
//     <div className="grid flex-1 grid-cols-12 gap-x-2">
//       <AddressFields
//         provinceName="value.provinceId"
//         districtName="value.districtId"
//         wardName="value.wardId"
//         provinceLabelName="value.province"
//         districtLabelName="value.district"
//         wardLabelName="value.ward"
//         provinceRequired={true}
//         cols={4}
//       />
//     </div>
//   );
// }

export const OPERATOR_ICONS = {
  $eq: <FaEquals />,
  $ne: <FaNotEqual />,
  $lt: <FaLessThan />,
  $lte: <FaLessThanEqual />,
  $gt: <FaGreaterThan />,
  $gte: <FaGreaterThanEqual />,
};

export const NUMBER_OPERATORS: Option[] = [
  { value: "$lt", label: "< (Nhỏ hơn)" },
  { value: "$lte", label: "≤ (Nhỏ hơn hoặc bằng)" },
  { value: "$gt", label: "> (Lớn hơn)" },
  { value: "$gte", label: "≥ (Lớn hơn hoặc bằng)" },
  { value: "$eq", label: "= (Bằng)" },
  { value: "$ne", label: "≠ (Khác)" },
];

export const SELECT_OPERATORS: Option[] = [
  { value: "$eq", label: "Là" },
  { value: "$ne", label: "Không là" },
];

export const DATE_OPTIONS: Option[] = [
  { value: "static", label: "Ngày cố định" },
  { value: "dynamic", label: "Ngày động" },
];

export const PERIOD_OPTIONS: Option[] = [
  { value: "D", label: "Ngày" },
  { value: "W", label: "Tuần" },
  { value: "M", label: "Tháng" },
];
