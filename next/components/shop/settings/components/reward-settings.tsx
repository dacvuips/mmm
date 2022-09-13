import { useFormContext } from "react-hook-form";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { REWARD_BY } from "../../../../lib/repo/shop-config.repo";
import { Field, Form, Input, Select, Switch } from "../../../shared/utilities/form";
import { Accordion, NotFound } from "../../../shared/utilities/misc";

export function RewardSettings() {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_SETTINGS");

  const onSubmit = async (data) => {
    await updateShopConfig({
      ...data,
    });
  };

  return (
    <Form
      grid
      defaultValues={shopConfig}
      className="max-w-screen-sm animate-emerge"
      onSubmit={onSubmit}
    >
      <Form.Title className="pt-2" title="Cấu hình điểm thưởng" />
      <Field name="rewardPointConfig.active" cols={12}>
        <Switch placeholder="Bật chức năng điểm thưởng" />
      </Field>
      <Field
        label="Tính điểm thưởng theo"
        tooltip="Đơn hàng: Điểm thưởng tính dựa trên đơn hàng. Sản phẩm: Điểm thưởng tính dựa trên từng sản phẩm"
        name="rewardPointConfig.rewardBy"
        cols={6}
      >
        <Select className="h-12 inline-grid" options={REWARD_BY} />
      </Field>
      <RewardByFields />
      <Form.Footer
        className="mt-1"
        isReverse={false}
        submitProps={{ large: true, className: "shadow", disabled }}
      />
    </Form>
  );
}

function RewardByFields() {
  const { watch } = useFormContext();
  const rewardBy = watch("rewardPointConfig.rewardBy");

  return (
    <>
      <Accordion isOpen={rewardBy == "order"} className="grid grid-cols-12 col-span-12 gap-x-5">
        <Field
          label="Đơn vị tính"
          name="rewardPointConfig.rewardUnit"
          cols={6}
          tooltip="Điểm trực tiếp trên đơn hàng: VD: Bạn cài đặt là 1.000 điểm => Bạn sẽ nhận được 1.000 điểm/đơn hàng. Điểm theo giá trị của đơn hàng: VD: Bạn cài đặt 10% => Bạn sẽ nhận được 100 điểm/1.000VND"
        >
          <Select className="h-12 inline-grid" menuPosition={"fixed"} options={REWARD_UNITS} />
        </Field>
        <ValueField />
      </Accordion>
      <Accordion isOpen={rewardBy != "order"} className="grid grid-cols-12 col-span-12 gap-x-5">
        <NotFound
          text="Chỉnh sửa điểm tại cấu hình chi tiết sản phẩm (Cài đặt nâng cao)"
          className="col-span-12"
        />
      </Accordion>
    </>
  );
}

function ValueField() {
  const { watch } = useFormContext();
  const rewardUnit = watch("rewardPointConfig.rewardUnit");

  return (
    <Field label="Điểm thưởng" name="rewardPointConfig.value" cols={6}>
      <Input
        className="h-12"
        number
        suffixInputFocus={false}
        suffix={
          <div className="flex items-center h-10 px-2 text-center">
            <span>{rewardUnit == "cast" ? "Phần trăm (%)" : "Điểm cố định (điểm)"}</span>
          </div>
        }
      />
    </Field>
  );
}

const REWARD_UNITS: Option[] = [
  { value: "point", label: "Điểm trực tiếp trên đơn hàng" },
  { value: "cast", label: "Điểm theo giá trị của đơn hàng" },
];
