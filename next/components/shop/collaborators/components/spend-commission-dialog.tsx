import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  Collaborator,
  CollaboratorService,
  DISBURSE_TYPES,
} from "../../../../lib/repo/collaborator.repo";
import {
  Field,
  FileInput,
  Form,
  FormProps,
  Input,
  Radio,
  Textarea,
} from "../../../shared/utilities/form";

interface Props extends FormProps {
  collaborator: Collaborator;
  onSuccess: () => any;
}
export function SpendCommissionDialog({ collaborator, onSuccess, ...props }: Props) {
  const [defaultValues, setDefaultValues] = useState({});
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_COLLABORATORS");

  const eligibleDisburseTypes = useMemo(() => {
    let types = [...DISBURSE_TYPES];
    if (collaborator?.customer?.momoWallet?.status != "valid") {
      types.splice(
        types.findIndex((x) => x.value == "DISBURSE_COMMISSION_MOMO"),
        1
      );
    }
    return types;
  }, [collaborator]);
  const toast = useToast();

  useEffect(() => {
    setDefaultValues({});
  }, [props.isOpen]);

  return (
    <Form
      width={400}
      dialog
      defaultValues={defaultValues}
      allowResetDefaultValues
      title="Chi hoa hồng"
      {...props}
      onSubmit={async (data) => {
        try {
          const { value, type, content, attachments } = data;
          await CollaboratorService.disburseCommission({
            customerId: collaborator.customerId,
            value,
            type,
            content,
            attachments,
          });
          toast.success("Chi hoa hồng thành công");
          onSuccess();
          props.onClose();
        } catch (err) {
          console.error(err);
          toast.error("Chi hoa hồng thất bại. " + err.message);
        }
      }}
    >
      <Field label="Cộng tác viên">
        <Input value={`${collaborator?.name} [${collaborator?.code}]`} readOnly />
      </Field>
      <Field label="Hoa hồng còn lại">
        <Input number suffix={"VND"} value={collaborator?.commissionStats.commission} readOnly />
      </Field>
      <Field
        label="Hoa hồng sẽ chi"
        name="value"
        required
        validation={{
          eligible: (value) => {
            if (value > collaborator?.commissionStats.commission) {
              return "Không thể chi nhiều hơn số hoa hồng còn lại";
            } else {
              return "";
            }
          },
        }}
      >
        <Input number suffix={"VND"} />
      </Field>
      <Field label="Loại chi" name="type">
        <Radio options={eligibleDisburseTypes} cols={6} />
      </Field>
      <Field label="Nội dung chi" name="content">
        <Textarea />
      </Field>
      <Field label="Tài liệu đính kèm" name="attachments">
        <FileInput multi />
      </Field>
      <Form.Footer
        submitProps={{
          large: true,
          className: "shadow",
          disabled,
        }}

      />
    </Form>
  );
}
