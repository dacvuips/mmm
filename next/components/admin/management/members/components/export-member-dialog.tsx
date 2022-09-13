import React from "react";
import { MemberService, SERVICE_PACKAGE, STATUS_MEMBER } from "../../../../../lib/repo/member.repo";
import { Dialog, DialogProps } from "../../../../shared/utilities/dialog/dialog";
import { Checkbox, Field, Form, Select } from "../../../../shared/utilities/form";
import { saveFile } from "../../../../../lib/helpers/file";
import { useToast } from "../../../../../lib/providers/toast-provider";

type Props = {};

export function ExportMemberDialog({ ...props }: {} & DialogProps) {
  const toast = useToast();
  const onSubmit = async (data) => {
    const { status, service, all } = data;
    try {
      await saveFile(
        () => MemberService.exportMemberExcel(all, service, status),
        "excel",
        `DANH_SACH_CUA_HANG.xlsx`,
        {
          onError: (message) => toast.error("Xuất thất bại", message),
        }
      );
    } catch (err) { }
  };
  return (
    <Form grid dialog {...props} title="Xuất danh sách cửa hàng" onSubmit={onSubmit}>
      <Field name="status" label="Trạng thái cửa hàng" cols={6}>
        <Select options={STATUS_MEMBER} />
      </Field>
      <Field name="service" label="Gói dịch vụ" cols={6}>
        <Select options={SERVICE_PACKAGE} />
      </Field>
      <Field name="all" label="" cols={6}>
        <Checkbox placeholder="Xuất tất cả cửa hàng" />
      </Field>
      <Form.Footer submitText="Xuất danh sách" />
    </Form>
  );
}
