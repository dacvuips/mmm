import { useToast } from "../../../../../lib/providers/toast-provider";
import {
  ShopSubscriptionService,
  SUBSCRIPTION_PLANS,
} from "../../../../../lib/repo/shop-subscription.repo";
import { Field, Form, FormProps, Input, Select } from "../../../../shared/utilities/form";

export function ExtendSubscriptionFormDialog({
  shopId,
  shopName,
  ...props
}: FormProps & { shopId: string; shopName: string }) {
  const toast = useToast();
  return (
    <Form
      {...props}
      title="Thanh toán dịch vụ"
      dialog
      width={600}
      grid
      onSubmit={async (data) => {
        try {
          await ShopSubscriptionService.extendSubscription(
            shopId,
            data.plan,
            data.months,
            data.days
          );
          toast.success("Thanh toán dịch vụ thành công. Dữ liệu đang dược cập nhật");
          props.onClose();
        } catch (err) {
          toast.error("Thanh toán dịch vụ thất bại. " + err.message);
        }
      }}
    >
      <Field readOnly label="Cửa hàng" cols={6}>
        <Input value={shopName} />
      </Field>
      <Field label="Gói dịch vụ" name="plan" cols={6}>
        <Select options={SUBSCRIPTION_PLANS} />
      </Field>
      <Field label="Số tháng ĐK" name="months" validation={{ min: 0 }} cols={6}>
        <Input number autoFocus suffix={"Tháng"} />
      </Field>
      <Field label="Số ngày thêm" name="days" validation={{ min: 0 }} cols={6}>
        <Input number suffix={"Ngày"} />
      </Field>
      <Form.Footer submitText="Xác nhận thanh toán" />
    </Form>
  );
}
