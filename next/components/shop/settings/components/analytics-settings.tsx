import { useState } from "react";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { Button } from "../../../shared/utilities/form/button";
import { Field } from "../../../shared/utilities/form/field";
import { Form } from "../../../shared/utilities/form/form";
import { Input } from "../../../shared/utilities/form/input";

export function AnalyticsSettings() {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_SETTINGS");

  const onSubmit = async (data) => {
    await updateShopConfig({ analyticConfig: data });
  };

  return (
    <Form
      grid
      defaultValues={shopConfig.analyticConfig}
      className="max-w-screen-sm animate-emerge"
      onSubmit={onSubmit}
    >
      <Form.Title className="pt-2" title="Cấu hình phân tích" />
      <Field label="Google Analytics" name="googleAnalytic" cols={12}>
        <Input placeholder="Nhập mã của Google Analytics" />
      </Field>
      <Field label="Facebook Pixel" name="facebookPixel" cols={12}>
        <Input placeholder="Nhập mã của Facebook Pixel" />
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

const COLLABORATORS_COMMISSIONS_TYPES: Option[] = [
  { value: "ORDER", label: "Số đơn hàng" },
  { value: "ITEM", label: "Số sản phẩm" },
];

const COLLABORATORS_COMMISSIONS_UNITS: Option[] = [
  { value: "PERCENT", label: "Phần trăm (%)" },
  { value: "VND", label: "Giá cố định (VNĐ)" },
];
