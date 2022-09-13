import endOfMonth from "date-fns/endOfMonth";
import startOfMonth from "date-fns/startOfMonth";
import { useState } from "react";
import { saveFile } from "../../../../../lib/helpers/file";
import { formatDate } from "../../../../../lib/helpers/parser";
import { useToast } from "../../../../../lib/providers/toast-provider";
import { MemberService } from "../../../../../lib/repo/member.repo";
import { OrderService } from "../../../../../lib/repo/order.repo";
import { DialogProps } from "../../../../shared/utilities/dialog/dialog";
import { DatePicker } from "../../../../shared/utilities/form/date";
import { Field } from "../../../../shared/utilities/form/field";
import { Form } from "../../../../shared/utilities/form/form";
import { Select } from "../../../../shared/utilities/form/select";

interface PropsType extends DialogProps {
  memberId: string;
}
export function ExportOrderDialog({ memberId, ...props }: PropsType) {
  const toast = useToast();
  const [memberFullData, setMemberFullData] = useState<Option>();

  const onSubmit = async (data) => {
    const { fromDate, toDate, memberId } = data;
    try {
      await saveFile(
        () =>
          OrderService.exportExcelAdmin(
            formatDate(fromDate, "yyyy/MM/dd"),
            formatDate(toDate, "yyyy/MM/dd"),
            memberId
          ),
        "excel",
        `DON_HANG_TU_${formatDate(fromDate, "dd-MM-yyyy")}_DEN_${formatDate(toDate, "dd-MM-yyyy")}${memberFullData
          ? `_CUA_HANG_${(memberFullData.label as string).toUpperCase().replaceAll(" ", "_")}`
          : ""
        }`,
        {
          onError: (message) => toast.error("Xuất thất bại", message),
        }
      );
    } catch (err) { }
  };

  return (
    <Form
      dialog
      title="Xuất danh sách đơn hàng"
      isOpen={props.isOpen}
      onClose={props.onClose}
      defaultValues={{
        memberId,
      }}
      onSubmit={onSubmit}
      grid
      width="600px"
    >
      <Field name="memberId" label="Cửa hàng" cols={12}>
        <Select
          placeholder="Lọc theo cửa hàng"
          hasImage
          clearable
          onChange={(member, memberFullData) => {
            setMemberFullData(memberFullData);
          }}
          autocompletePromise={({ id, search }) =>
            MemberService.getAllAutocompletePromise(
              { id, search },
              {
                fragment: "id shopName shopLogo",
                parseOption: (data) => ({
                  value: data.id,
                  label: data.shopName,
                  image: data.shopLogo,
                }),
              }
            )
          }
        />
      </Field>
      <Field name="fromDate" label="Từ ngày" required cols={6}>
        <DatePicker startOfDay defaultValue={startOfMonth(new Date())} clearable={false} />
      </Field>
      <Field name="toDate" label="Đến ngày" required cols={6}>
        <DatePicker endOfDay defaultValue={endOfMonth(new Date())} clearable={false} />
      </Field>
      <Form.Footer />
    </Form>
  );
}
