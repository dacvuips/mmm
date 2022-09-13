import { useEffect, useState } from "react";
import { useToast } from "../../../../lib/providers/toast-provider";
import { ProductTopping, ToppingOption } from "../../../../lib/repo/product-topping.repo";
import { DialogProps } from "../../../shared/utilities/dialog/dialog";
import { DataTable } from "../../../shared/utilities/table/data-table";
import cloneDeep from "lodash/cloneDeep";
import { Field } from "../../../shared/utilities/form/field";
import { Input } from "../../../shared/utilities/form/input";
import { Switch } from "../../../shared/utilities/form/switch";
import { Label } from "../../../shared/utilities/form/label";
import { Button } from "../../../shared/utilities/form/button";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import isEqual from "lodash/isEqual";
import { useFieldArray } from "react-hook-form";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";

export function ProductToppingTableForm() {
  const toast = useToast();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_TOPPINGS");
  return (
    <DataTable.Consumer>
      {({ formItem }) => (
        <>
          <DataTable.Form
            extraDialogClass="bg-transparent"
            extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
            extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
            footerProps={{
              className: "justify-center",
              submitProps: { className: "h-14 w-64", disabled: !hasWritePermission },
              cancelText: "",
              submitText: `${formItem?.id ? "Chỉnh sửa" : "Thêm"} món`,
            }}
            grid
            validate={{
              allRequired: (data) => {
                if (data.options?.length) {
                  for (let option of data.options) {
                    if (!option.name || option.price === null) {
                      toast.info("Cần nhập đầy đủ tên và giá lựa chọn");
                      return "Bắt buộc";
                    }
                  }
                  return "";
                } else {
                  if (formItem?.id) {
                    toast.info("Cần phải tạo ít nhất một lựa chọn");
                    return "Bắt buộc";
                  }
                }
                return "";
              },
            }}
            // beforeSubmit={(data) => {
            //   const { name, min, max, required, options } = data;
            //   return formItem?.id
            //     ? {
            //       name,
            //       min,
            //       max,
            //       required,
            //       options: options
            //         .map((x) => ({ name: x.name, price: x.price })),
            //     }
            //     : { name };
            // }}
            validateFn={(data) => {
              if (data?.options?.length) {
                for (let option of data?.options) {
                  if (!option?.name || option?.name == "" || option?.price === null) {
                    toast.info("Cần nhập đầy đủ tên và giá lựa chọn");
                    return false;
                  }
                }
              }
              return true
            }}
          >
            <ProductToppingFields name="" productTopping={formItem} />
          </DataTable.Form>
        </>
      )}
    </DataTable.Consumer>
  );
}

export function ProductToppingFields({
  name = "",
  productTopping,
  hasDescription = false,
  ...props
}: DialogProps & {
  name: string;
  productTopping: ProductTopping;
  hasDescription?: boolean;
}) {
  // const [toppingOptions, setToppingOptions] = useState<ToppingOption[]>(null);
  // const [name, setName] = useState("");
  // const [min, setMin] = useState<number>(null);
  // const [max, setMax] = useState<number>(null);
  // const [required, setRequired] = useState<boolean>(false);
  // const [loadDone, setLoadDone] = useState(false);

  // useEffect(() => {
  //   if (productTopping) {
  //     setLoadDone(false);
  //     setToppingOptions(cloneDeep(productTopping.options));
  //     setName(productTopping.name);
  //     setMin(productTopping.min);
  //     setMax(productTopping.max);
  //     setRequired(productTopping.required);
  //     setLoadDone(true);
  //   }
  // }, [productTopping]);

  // useEffect(() => {
  //   if (productTopping && loadDone) {
  //     const newProductTopping = {
  //       ...productTopping,
  //       name,
  //       min,
  //       max,
  //       required,
  //       options: toppingOptions,
  //     };
  //     if (!isEqual(productTopping, newProductTopping)) onChange(newProductTopping);
  //   }
  // }, [toppingOptions, name, min, max, required]);

  // const onOptionChange = (index, option) => {
  //   if (toppingOptions) {
  //     toppingOptions[index] = option;
  //     setToppingOptions([...toppingOptions]);
  //   }
  // };

  // const onRemoveOption = (index) => {
  //   if (toppingOptions) {
  //     toppingOptions.splice(index);
  //     setToppingOptions([...toppingOptions]);
  //   }
  // };

  const { fields, append, remove } = useFieldArray({ name: `${name ? `${name}.` : ""}options` });

  return (
    <>
      <Field
        description={
          hasDescription &&
          "Đặt tên cụ thể để có thể nhận biết các mẫu topping cùng loại. Ví dụ: Size Trà sữa và Size Sữa tươi"
        }
        label="Tên topping"
        cols={12}
        name={`${name ? `${name}.` : ""}name`}
        required
        validation={{
          nameToppingValid: (val) => validateKeyword(val),
        }}
      >
        <Input />
      </Field>
      {productTopping?.id && (
        <>
          <Field
            label="Chọn tối thiểu"
            tooltip="Nhập 0 để không bắt buộc"
            cols={4}
            validation={{ min: 0 }}
            name={`${name ? `${name}.` : ""}min`}
          >
            <Input number suffix="lựa chọn" />
          </Field>
          <Field
            label="Chọn tối đa"
            tooltip="Nhập 0 để không giới hạn"
            cols={4}
            validation={{ min: 0 }}
            name={`${name ? `${name}.` : ""}max`}
          >
            <Input number suffix="lựa chọn" />
          </Field>
          <Field label=" " cols={4} name={`${name ? `${name}.` : ""}required`}>
            <Switch placeholder="Bắt buộc" />
          </Field>
          <div className="col-span-12 mb-3">
            <Label text="Danh sách lựa chọn" />
            <div className="rounded border-vertical-group">
              {(fields as ({ id: string } & ToppingOption)[])?.map((option, index) => (
                <div
                  key={option.id}
                  className={`relative flex items-center rounded border border-gray-400 group hover:border-primary focus-within:border-primary ${index == 0 ? "rounded-b-none" : "rounded-none"
                    }`}
                >
                  <Field
                    className="flex-1"
                    name={`${name ? `${name}.` : ""}options.${index}.name`}
                    noError
                  >
                    <Input
                      placeholder="Tên lựa chọn"
                      id={`option-name-${index}`}
                      className={`border-0 no-focus `}
                    />
                  </Field>
                  <Field name={`${name ? `${name}.` : ""}options.${index}.price`} noError>
                    <Input
                      placeholder="Giá tiền"
                      className="w-48 pr-3 ml-auto border-0 text-danger no-focus"
                      inputClassName="text-right font-semibold"
                      number
                      currency
                    />
                  </Field>
                  <Button
                    outline
                    unfocusable
                    className={`px-0 w-6 h-6 rounded-full absolute -right-3 bg-white opacity-0 group-hover:opacity-100`}
                    hoverDanger
                    icon={<RiCloseLine />}
                    iconClassName="text-sm"
                    onClick={() => remove(index)}
                  />
                </div>
              ))}
              <Button
                outline
                className={`w-full bg-white ${fields.length ? "rounded-t-none" : ""}`}
                icon={<RiAddLine />}
                text="Thêm lựa chọn"
                onClick={() => {
                  append({ name: "", price: 0, isDefault: false });
                  setTimeout(() => {
                    let input = document.getElementById(`option-name-${fields.length}`);
                    if (input) input.focus();
                  });
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
