import { useFieldArray } from "react-hook-form";
import { RiAddFill, RiCloseFill } from "react-icons/ri";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { Button, Field, Form, Input } from "../../../shared/utilities/form";

export function SuportSettings() {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_SETTINGS");

  const onSubmit = async (data) => {
    await updateShopConfig({ supportConfig: { ...data } });
  };

  return (
    <Form
      grid
      defaultValues={shopConfig.supportConfig}
      className="max-w-screen-sm animate-emerge"
      onSubmit={onSubmit}
    >
      <Form.Title className="pt-3" title="Cấu hình Trang hỗ trợ" />

      <Field label="Điện thoại hỗ trợ" name="hotline" cols={6}>
        <Input className="h-12" />
      </Field>

      <MenuFields />

      <Form.Footer
        className="mt-1"
        isReverse={false}
        submitProps={{ large: true, className: "shadow", disabled }}
      />
    </Form>
  );
}

function MenuFields() {
  const { fields, append, remove } = useFieldArray({ name: "menu" });

  return (
    <div className="col-span-12">
      {(fields as { id: string; label: string; url: string }[]).map((field, index) => (
        <div className="flex gap-2" key={field.id}>
          <Field name={`menu.${index}.label`} label="Tên hỗ trợ" className="flex-1">
            <Input className="h-12" />
          </Field>
          <Field name={`menu.${index}.url`} label="Liên kết" className="flex-1">
            <Input className="h-12" />
          </Field>
          <Button
            outline
            hoverDanger
            icon={<RiCloseFill />}
            iconClassName="text-xl"
            className="w-12 h-12 px-0 bg-white mt-7"
            onClick={() => {
              remove(index);
            }}
          />
        </div>
      ))}
      <div className="flex-center">
        <Button
          text="Thêm liên kết"
          outline
          className="bg-white"
          icon={<RiAddFill />}
          onClick={() => {
            append({ label: "", url: "" });
          }}
        />
      </div>
    </div>
  );
}
