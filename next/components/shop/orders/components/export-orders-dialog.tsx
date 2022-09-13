import endOfMonth from "date-fns/endOfMonth";
import startOfMonth from "date-fns/startOfMonth";
import { useState } from "react";
import { saveFile } from "../../../../lib/helpers/file";
import { formatDate } from "../../../../lib/helpers/parser";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  OrderService,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PICKUP_METHODS,
} from "../../../../lib/repo/order.repo";
import { ShopBranchService } from "../../../../lib/repo/shop-branch.repo";
import { DialogProps } from "../../../shared/utilities/dialog/dialog";
import { DatePicker } from "../../../shared/utilities/form/date";
import { Field } from "../../../shared/utilities/form/field";
import { Form } from "../../../shared/utilities/form/form";
import { Select } from "../../../shared/utilities/form/select";

interface PropsType extends DialogProps {
  shopBranchId: string;
  pickupMethod: string;
  paymentMethod: string;
  status: string;
}
export function ExportOrderDialog({ ...props }: PropsType) {
  const toast = useToast();
  const [branchFullData, setBranchFullData] = useState<Option>();

  const onSubmit = async (data) => {
    const { fromDate, toDate, shopBranchId, pickupMethod, paymentMethod, status } = data;

    const filter = {
      ...(shopBranchId ? { shopBranchId } : {}),
      ...(pickupMethod ? { pickupMethod } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(status ? { status } : {}),
    };
    try {
      await saveFile(
        () =>
          OrderService.exportExcel(
            formatDate(fromDate, "yyyy/MM/dd"),
            formatDate(toDate, "yyyy/MM/dd"),
            filter
          ),
        "excel",
        `DON_HANG_TU_${formatDate(fromDate, "dd-MM-yyyy")}_DEN_${formatDate(toDate, "dd-MM-yyyy")}${
          branchFullData?.value
            ? `_CHI_NHANH_${(branchFullData?.label as string).toUpperCase().replaceAll(" ", "_")}`
            : ""
        }.xlsx`,
        {
          onError: (message) => toast.error("Xuất thất bại", message),
        }
      );
    } catch (err) {
      toast.error("Xuất thất bại");
    }
  };

  return (
    <Form
      dialog
      title="Xuất danh sách đơn hàng"
      isOpen={props.isOpen}
      onClose={props.onClose}
      defaultValues={{
        ...props,
      }}
      onSubmit={onSubmit}
      grid
      width="600px"
    >
      <Field name="fromDate" label="Từ ngày" required cols={6}>
        <DatePicker clearable={false} startOfDay defaultValue={startOfMonth(new Date())} />
      </Field>
      <Field name="toDate" label="Đến ngày" required cols={6}>
        <DatePicker clearable={false} endOfDay defaultValue={endOfMonth(new Date())} />
      </Field>
      <Field name="shopBranchId" label="Cửa hàng" cols={6}>
        <Select
          className="h-12"
          clearable
          placeholder="Tất cả cửa hàng"
          onChange={(_, branchFullData) => {
            setBranchFullData(branchFullData);
          }}
          optionsPromise={() => ShopBranchService.getAllOptionsPromise()}
        />
      </Field>
      <Field name="pickupMethod" label="Hình thức lấy hàng" cols={6}>
        <Select
          className="h-12"
          clearable
          placeholder="Tất cả hình thức lấy hàng"
          options={PICKUP_METHODS}
        />
      </Field>
      <Field name="paymentMethod" label="Hình thức thanh toán" cols={6}>
        <Select
          className="h-12"
          clearable
          placeholder="Tất cả hình thức thanh toán"
          options={PAYMENT_METHODS}
        />
      </Field>
      <Field name="status" label="Trạng thái" cols={6}>
        <Select className="h-12" clearable placeholder="Tất cả trạng thái" options={ORDER_STATUS} />
      </Field>
      <Form.Footer />
    </Form>
  );
}
