import { cloneDeep } from "lodash";
import { useMemo } from "react";
import { BaseModel } from "../../../../lib/repo/crud.repo";
import { FooterProps, Form, FormProps } from "../form";
import { useDataTable } from "./data-table";
import { useTranslation } from "react-i18next";

interface PropsType extends FormProps {
  title?: string;
  hasFooter?: boolean;
  footerProps?: FooterProps;
  validateFn?: (data: any) => any;
  beforeSubmit?: (data: any, defaultValues: any) => any;
  transformDefaultValues?: (defaultValues: any) => any;
  afterSubmit?: (data: any, defaultValues: any, item: Partial<BaseModel>) => any;
}
export function TableForm({ title, hasFooter = true, footerProps = {}, ...props }: PropsType) {
  const { itemName, formItem, setFormItem, saveItem, loadAll } = useDataTable();
  const { t } = useTranslation();

  const onSubmit = async (data) => {
    try {
      let newData = { ...data };
      if (props.validateFn && !props.validateFn(data)) {
        return true;
      }
      if (props.beforeSubmit) newData = await props.beforeSubmit(newData, defaultValues);
      const res = await saveItem(newData);
      if (props.afterSubmit) await props.afterSubmit({ ...data }, defaultValues, res);
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const defaultValues = useMemo(
    () =>
      formItem
        ? cloneDeep(
          props.transformDefaultValues ? props.transformDefaultValues(formItem) : formItem
        )
        : null,
    [formItem]
  );

  return (
    <Form
      width={550}
      defaultValues={defaultValues}
      {...props}
      title={title || `${formItem?.id ? t("Cập nhật") : t("Tạo")} ${t(itemName)}`.trim()}
      dialog
      isOpen={!!defaultValues}
      onClose={() => setFormItem(null)}
      onSubmit={onSubmit}
    >
      {props.children}
      {hasFooter && <Form.Footer {...footerProps} />}
    </Form>
  );
}
