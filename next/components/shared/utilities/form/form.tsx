import { cloneDeep } from "lodash";
import { createContext, Fragment, useContext, useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button, ButtonProps, FormResolverFunction, resolver } from ".";
import { useMemoCompare } from "../../../../lib/hooks/useMemoCompare";
import { Dialog, DialogProps } from "../dialog/dialog";

export interface FormProps<T = any> extends Partial<DialogProps> {
  grid?: boolean;
  dialog?: boolean;
  defaultValues?: T;
  allowResetDefaultValues?: boolean;
  resetToDefaultAfterSubmit?: boolean;
  validate?: { [key: string]: FormResolverFunction };
  onSubmit?: (values: T) => any | Promise<any>;
  onError?: (errors: { [key: string]: { message: string } }) => any;
  onChange?: (values: T) => any;
  onReset?: () => any;
}
export function Form<T = any>({
  onChange,
  grid = false,
  dialog = false,
  className = "",
  style = {},
  ...props
}: FormProps<T>) {
  const defaultValues = props.allowResetDefaultValues
    ? useMemo(() => props.defaultValues, [props.defaultValues])
    : useMemoCompare(props.defaultValues);

  const methods = useForm({
    defaultValues: cloneDeep(defaultValues) as any,
    resolver,
  });
  const ref = useRef<HTMLFormElement>();

  const resetDefaultValues = (values?: any) => {
    methods.clearErrors();
    methods.reset(cloneDeep(values || defaultValues), {
      keepErrors: false,
      keepDirty: false,
      keepValues: !!values,
      keepDefaultValues: false,
    });
  };

  useEffect(() => {
    if (dialog && props.isOpen) {
      resetDefaultValues();
    }
  }, [props.isOpen]);

  useEffect(() => {
    resetDefaultValues();
  }, [defaultValues]);

  const values = useWatch({ control: methods.control }) as T;
  useEffect(() => {
    if (onChange) onChange(values);
  }, [values]);

  const onSubmit = async (values) => {
    if (props.onSubmit) await props.onSubmit(values);
    if (props.resetToDefaultAfterSubmit) {
      resetDefaultValues();
    } else {
      resetDefaultValues(values);
    }
  };

  const onError = (err) => {
    if (props.onError) props.onError(err);
    setTimeout(() => {
      ref.current
        .querySelector(".form-error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  let Wrapper: any = Fragment;
  let Body: any = Fragment;
  if (dialog) {
    Wrapper = Dialog;
    Body = Dialog.Body;
  }

  return (
    <Wrapper {...(dialog ? props : {})}>
      <Body>
        <FormPropsProvider title={props.title} dialog={dialog} onClose={props.onClose}>
          <FormProvider {...methods}>
            <form
              ref={ref}
              className={`${grid ? "grid grid-cols-12 gap-x-5" : ""} ${className}`}
              style={style}
              onSubmit={onSubmit ? methods.handleSubmit(onSubmit, onError) : null}
              onReset={() => {
                resetDefaultValues();
                if (props.onReset) props.onReset();
              }}
            >
              {props.children}
            </form>
          </FormProvider>
        </FormPropsProvider>
      </Body>
    </Wrapper>
  );
}

export const FormPropsContext = createContext<
  Partial<{
    title: string;
    dialog: boolean;
    onClose: () => any;
  }>
>({});
export function FormPropsProvider({
  title,
  dialog,
  onClose,
  ...props
}: {
  title: string;
  dialog: boolean;
  onClose: () => any;
} & ReactProps) {
  return (
    <FormPropsContext.Provider value={{ title, dialog, onClose }}>
      {props.children}
    </FormPropsContext.Provider>
  );
}

export interface FooterProps extends ReactProps {
  onSubmit?: () => any;
  onCancel?: () => any;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  preventDefaultSubmit?: boolean;
  preventDefaultReset?: boolean;
  submitProps?: ButtonProps;
  cancelProps?: ButtonProps;
  isReverse?: boolean;
}
export function FormFooter({
  preventDefaultSubmit = false,
  preventDefaultReset = false,
  submitProps = {},
  cancelProps = {},
  isReverse = true,
  className = "",
  ...props
}: FooterProps) {
  const { formState } = useFormContext() || { formState: { isSubmitting: false } };
  const { isSubmitting } = formState;
  const { dialog, onClose, title } = useContext(FormPropsContext);
  const { t } = useTranslation();
  const cancelText = useMemo(
    () => (props.cancelText === undefined ? (dialog ? t("Đóng") : t("Reset")) : props.cancelText),
    [props.cancelText]
  );

  return (
    <div
      className={`col-span-full w-full pt-1 flex items-center gap-1 ${
        isReverse ? "flex-row-reverse space-x-reverse" : ""
      } ${className}`}
    >
      <Button
        text={props.submitText || title || t("Lưu thay đổi")}
        primary
        submit={!preventDefaultSubmit}
        isLoading={props.isLoading || isSubmitting}
        onClick={props.onSubmit}
        {...submitProps}
      />
      {cancelText && (
        <Button
          text={cancelText}
          reset={!preventDefaultReset}
          disabled={isSubmitting}
          onClick={props.onCancel || (dialog ? onClose : undefined)}
          {...cancelProps}
        />
      )}
      {props.children}
    </div>
  );
}

FormFooter.displayName = "FormFooter";
Form.Footer = FormFooter;

interface TitleProps extends ReactProps {
  title: string;
}
function Title({ title, className = "", style = {} }: TitleProps) {
  return (
    <div
      className={`pt-1 pb-2 text-gray-600 font-medium text-lg uppercase col-span-full ${className}`}
      style={style}
    >
      {title}
    </div>
  );
}
Title.displayName = "FormTitle";
Form.Title = Title;
