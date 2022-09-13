import { useFormContext } from "react-hook-form";
import { FaInfoCircle } from "react-icons/fa";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { Field } from "../../../shared/utilities/form/field";
import { Form } from "../../../shared/utilities/form/form";
import { Input } from "../../../shared/utilities/form/input";
import { Switch } from "../../../shared/utilities/form/switch";

export function DeliverySettings() {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_SETTINGS");

  const onSubmit = async (data) => {
    await updateShopConfig({
      ...data,
    });
  };

  return (
    <Form defaultValues={shopConfig} className="max-w-screen-sm animate-emerge" onSubmit={onSubmit}>
      {/* <div className="pl-1 mt-4 mb-4 text-lg font-semibold text-gray-400">
        Cấu hình phí giao hàng
      </div>
      <Field label="Thời gian nhà hàng chuẩn bị" name="shipPreparationTime">
        <Input className="h-12" />
      </Field>
      <div className="flex">
        <Form.Consumer>
          {({ data }) => (
            <Field label="Phí giao hàng dưới 1km" name="shipOneKmFee" className="flex-1">
              <Input className="h-12" number suffix="VND" readOnly={!data.shipUseOneKmFee} />
            </Field>
          )}
        </Form.Consumer>

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
      </Field> */}
      <Form.Title className="pt-2" title="Cấu hình thao tác đặt hàng" />
      <Field name="orderConfig.skipCart" noError>
        <Switch className="h-12 font-semibold" placeholder="Bỏ qua giỏ hàng" />
      </Field>
      <div className="flex items-center">
        <Field name="orderConfig.allowCancel">
          <Switch
            className="h-12 font-semibold"
            placeholder="Cho phép khách hàng thao tác hủy đơn"
          />
        </Field>
        <i
          className="text-base inline-block ml-2 text-gray-500 mb-6"
          data-tooltip="Trên cửa hàng hiển thị nút hủy đơn trong đơn hàng ở trạng thái đặt thành công, khi xác nhận đơn hàng và xử lý thì không cho phép hủy đơn"
        >
          <FaInfoCircle />
        </i>
      </div>
      {/* <div className="pl-1 mt-4 mb-4 text-lg font-semibold text-gray-400">Cấu hình VNPOST</div>
      <Field label="Mã CRM VNPost" name="vnpostCode">
        <Input className="h-12" />
      </Field>
      <Field label="Tên người dùng VNPost" name="vnpostName">
        <Input className="h-12" />
      </Field>
      <Field label="Điện thoại VNPost" name="vnpostPhone">
        <Input className="h-12" />
      </Field> */}
      <div className="flex items-center text-lg font-semibold text-gray-400">
        <Form.Title className="pt-2" title="Cấu hình giao hàng Ahamove" />
        <i
          className="text-base inline-block ml-4 text-gray-500 mb-1"
          data-tooltip={`Khi bật chúc năng này thì trong ứng dụng giao hàng sẽ có lựa chọn giao bằng Ahamove
                        "Chuyển nhanh qua Ahamove" → Khi đơn hàng đặt thành công thì sẽ tạo ngay đơn hàng qua cho Ahamove`}
        >
          <FaInfoCircle />
        </i>
      </div>
      <div className="grid grid-cols-2 mb-4">
        <Field name="orderConfig.ahamoveEnabled" className="mt-auto mb-0" noError>
          <Switch className="h-12 font-semibold" placeholder="Chấp nhận giao bằng Ahamove" />
        </Field>
        <AhaMoveFields />
      </div>
      <Form.Footer
        className="mt-1"
        isReverse={false}
        submitProps={{ large: true, className: "shadow", disabled }}
      />
    </Form>
  );
}

function AhaMoveFields() {
  const { watch } = useFormContext();
  const ahamoveEnabled: boolean = watch("orderConfig.ahamoveEnabled");

  return (
    <div className={`transition-opacity ${ahamoveEnabled ? "" : "opacity-50 pointer-events-none"}`}>
      <div className="flex items-center">
        <Field name="orderConfig.ahamoveShipFee" className="mt-auto mb-0" noError>
          <Switch className="h-12 font-semibold" placeholder="Tính phí ship bằng Ahamove" />
        </Field>
        <i
          className="text-base inline-block ml-1.5 text-gray-500"
          data-tooltip="Khi bật cấu hình này thì Phí ship được tính bằng Ahamove. Ngược lại sẽ tính theo cấu hình của từng cửa hàng của bạn."
        >
          <FaInfoCircle />
        </i>
      </div>
      <Field name="orderConfig.ahamoveFastForward">
        <Switch placeholder="Chuyển nhanh qua Ahamove" className="h-12 font-semibold" />
      </Field>
      <Field
        label="Thời gian trễ"
        name="orderConfig.ahamoveFastForwardDelay"
        description={`Tính từ lúc đặt thành công đến lúc tự động chuyển cho ahamove. Mặc định là 0 phút (tương đương với "Chuyển nhanh qua ahamove").`}
      >
        <Input className="w-40" number suffix="phút"></Input>
      </Field>{" "}
    </div>
  );
}
