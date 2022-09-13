import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AddressService } from "../../../../lib/repo/address.repo";
import { Field, Select } from "../form";

interface Props extends ReactProps {
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  provinceLabel?: string;
  districtLabel?: string;
  wardLabel?: string;
  provinceRequired?: boolean;
  districtRequired?: boolean;
  wardRequired?: boolean;
  provinceLabelName?: string;
  districtLabelName?: string;
  wardLabelName?: string;
  cols?: Cols;
}

export function AddressFields({
  provinceName = "provinceId",
  districtName = "districtId",
  wardName = "wardId",
  provinceLabel = "Tỉnh/Thành",
  districtLabel = "Quận/Huyện",
  wardLabel = "Phường/Xã",
  provinceRequired = false,
  districtRequired = false,
  wardRequired = false,
  provinceLabelName = "",
  districtLabelName = "",
  wardLabelName = "",
  cols = 12,
}: Props) {
  const { setValue, register } = useFormContext();
  const [districtOptions, setDistrictOptions] = useState<Option[]>();
  const [wardOptions, setWardOptions] = useState<Option[]>();

  const provinceId = useWatch({ name: provinceName });
  const districtId = useWatch({ name: districtName });
  useEffect(() => {
    if (provinceId) {
      AddressService.getDistricts(provinceId).then((res) =>
        setDistrictOptions(res.map((x) => ({ value: x.id, label: x.district })))
      );
    } else {
      setDistrictOptions([]);
    }
    setWardOptions([]);
  }, [provinceId]);

  useEffect(() => {
    if (districtId) {
      AddressService.getWards(districtId).then((res) =>
        setWardOptions(res.map((x) => ({ value: x.id, label: x.ward })))
      );
    }
  }, [districtId]);

  if (provinceLabelName) register(provinceLabelName);
  if (districtLabelName) register(districtLabelName);
  if (wardLabelName) register(wardLabelName);

  return (
    <>
      <Field name={provinceName} label={provinceLabel} cols={cols} required={provinceRequired}>
        <Select
          optionsPromise={() =>
            AddressService.getProvinces().then((res) =>
              res.map((x) => ({ value: x.id, label: x.province }))
            )
          }
          onChange={(val, extraVal) => {
            setValue(districtName, "");
            setValue(wardName, "");
            if (provinceLabelName) setValue(provinceLabelName, extraVal?.label);
            if (districtLabelName) setValue(districtLabelName, "");
            if (wardLabelName) setValue(wardLabelName, "");
          }}
        />
      </Field>
      <Field name={districtName} label={districtLabel} cols={cols} required={districtRequired}>
        <Select
          clearable
          readOnly={!provinceId}
          options={districtOptions}
          onChange={(val, extraVal) => {
            setValue(wardName, "");
            if (districtLabelName) setValue(districtLabelName, extraVal?.label);
            if (wardLabelName) setValue(wardLabelName, "");
          }}
        />
      </Field>
      <Field name={wardName} label={wardLabel} cols={cols} required={wardRequired}>
        <Select
          clearable
          readOnly={!districtId}
          options={wardOptions}
          onChange={(val, extraVal) => {
            if (wardLabelName) setValue(wardLabelName, extraVal?.label);
          }}
        />
      </Field>
    </>
  );
}
