import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import {
  CollaboratorCommissionType,
  COLLABORATOR_COMMISSIONS_TYPES,
  COLLABORATOR_COMMISSIONS_UNITS,
} from "../../../../lib/repo/shop-config.repo";
import { Label } from "../../../shared/utilities/form";
import { Button } from "../../../shared/utilities/form/button";
import { Editor } from "../../../shared/utilities/form/editor";
import { Field } from "../../../shared/utilities/form/field";
import { Form } from "../../../shared/utilities/form/form";
import { Input } from "../../../shared/utilities/form/input";
import { Select } from "../../../shared/utilities/form/select";
import { Switch } from "../../../shared/utilities/form/switch";
import { Accordion } from "../../../shared/utilities/misc";

export function CollaboratorSettings() {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_SETTINGS");

  const onSubmit = async (data) => {
    await updateShopConfig({ ...data });
  };

  return (
    <Form
      grid
      defaultValues={shopConfig}
      className="max-w-screen-sm animate-emerge"
      onSubmit={onSubmit}
    >
      <Form.Title className="pt-2" title="Cấu hình cộng tác viên" />
      <Field name="collaborator" cols={6}>
        <Switch placeholder="Bật chức năng cộng tác viên" />
      </Field>
      <Field name="colApprove" cols={6}>
        <Switch placeholder="Yêu cầu duyệt cộng tác viên" />
      </Field>
      <Field
        label="Điều kiện trở thành CTV"
        tooltip="Số đơn tối thiểu yêu cầu để trở thành CTV"
        name="colMinOrder"
        cols={6}
      >
        <Input className="h-12" number suffix="đơn" />
      </Field>
      <div className=""></div>
      <Field
        label="Áp dụng hoa hồng trên"
        tooltip="Đơn hàng: Hoa hồng tính dựa trên đơn hàng. Sản phẩm: Hoa hồng tính dựa trên từng sản phẩm"
        name="colCommissionBy"
        cols={6}
      >
        <Select className="h-12 inline-grid" options={COLLABORATOR_COMMISSIONS_TYPES} />
      </Field>
      <CommissionValueField />
      <Field label="Điều khoản cộng tác viên" name="colTerm" cols={12}>
        <Editor />
      </Field>
      <Form.Footer
        className="mt-1"
        isReverse={false}
        submitProps={{
          large: true,
          className: "shadow",
          disabled,
        }}
      />
    </Form>
  );
}

function CommissionValueField() {
  const { watch } = useFormContext();
  const colCommissionBy: CollaboratorCommissionType = watch("colCommissionBy");

  return (
    <Accordion isOpen={colCommissionBy == "ORDER"} className="w-full col-span-6">
      <Label text="Giá trị hoa hồng trên từng đơn" />
      <div className="flex">
        <Field name="colCommissionValue" required className="flex-shrink">
          <Input className="h-12 rounded-r-none" inputClassName="w-32" number />
        </Field>
        <Field name="colCommissionUnit" className="flex-1">
          <Select
            menuPosition="fixed"
            className="h-12 inline-grid rounded-l-none"
            options={COLLABORATOR_COMMISSIONS_UNITS}
          />
        </Field>
      </div>
    </Accordion>
  );
}
