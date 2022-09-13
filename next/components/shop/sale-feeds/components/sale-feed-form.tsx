import React, { Fragment, useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { HiPlus } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { ProductService } from "../../../../lib/repo/product.repo";
import {
  APPROVAL_STATUSES,
  SaleFeedContent,
  ShopSaleFeed,
} from "../../../../lib/repo/shop-sale-feed.repo";
import {
  Button,
  Editor,
  Field,
  FormProps,
  ImageInput,
  Input,
  Select,
  Switch,
  Textarea,
} from "../../../shared/utilities/form";
import { DataTable, useDataTable } from "../../../shared/utilities/table/data-table";

interface PropsType extends FormProps {
  saleFeed: ShopSaleFeed;
  editPermissionSaleFeed: boolean;
}
export function SaleFeedForm({ saleFeed, editPermissionSaleFeed, ...props }: PropsType) {
  return (
    <>
      <DataTable.Form
        extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
        footerProps={{
          className: "justify-center",
          submitProps: { className: "h-14 w-64", disabled: editPermissionSaleFeed },
          cancelText: "",
        }}
        width={"700px"}
        grid
        transformDefaultValues={(values) => ({
          ...values,
          contents: values.id ? values.contents : [{ content: "", images: [] }],
        })}
      >
        <Field
          name="name"
          label="Tên bài đăng bán"
          required
          cols={6}
          validation={{ nameValid: (val) => validateKeyword(val) }}
        >
          <Input />
        </Field>
        <Field name="productId" label="Hướng dẫn" required cols={6}>
          <Select
            autocompletePromise={({ id, search }) =>
              ProductService.getAllAutocompletePromise(
                { id, search },
                {
                  fragment: "id name",
                  parseOption: (data) => ({
                    value: data.id,
                    label: data.name,
                  }),
                }
              )
            }
          />
        </Field>
        <Field name="priority" label="Độ ưu tiên" cols={6}>
          <Input number />
        </Field>
        <Field name="active" label=" " cols={6} className="flex">
          <Switch placeholder="Kích hoạt" className="h-12 my-auto font-semibold" />
        </Field>
        <Field
          name="approvalStatus"
          label="Trạng thái bài đăng bán "
          cols={6}
          className="flex"
          readOnly
        >
          <Select options={APPROVAL_STATUSES} />
        </Field>
        <Field name="showOnMarketPlace" label=" " cols={6} className="flex">
          <Switch placeholder="Hiển thị trên market place" className="h-12 my-auto font-semibold" />
        </Field>
        <Field
          name="snippet"
          label="Mô tả ngắn"
          cols={12}
          validation={{ snippetValid: (val) => validateKeyword(val) }}
        >
          <Textarea></Textarea>
        </Field>
        <Field
          name="tips"
          label="Hướng dẫn"
          cols={12}
          validation={{ tipsValid: (val) => validateKeyword(val) }}
        >
          <Textarea></Textarea>
        </Field>
        <ContentFields />
      </DataTable.Form>
    </>
  );
}

function ContentFields() {
  const { fields, append, remove } = useFieldArray({ name: "contents" });
  const { formItem } = useDataTable();
  const contents = fields as ({ id: string } & SaleFeedContent)[];
  const [loadDone, setLoadDone] = useState(false);

  useEffect(() => {
    if (formItem) {
      setTimeout(() => {
        setLoadDone(true);
      }, 100);
    } else {
      setLoadDone(false);
    }
  }, [formItem]);

  if (!loadDone) return <></>;
  return (
    <div className="col-span-full">
      {contents.map((item, index) => (
        <Fragment key={item.id}>
          <div className="flex items-center pt-4 border-t border-gray-200">
            <div className="mb-1 font-bold uppercase text-primary">Nội dung {index + 1}</div>
            {index > 0 && (
              <Button
                icon={<RiDeleteBin6Line />}
                tooltip="Xóa nhóm"
                className="ml-auto mr-0 transform translate-x-3"
                hoverDanger
                onClick={() => {
                  remove(index);
                }}
              ></Button>
            )}
          </div>
          <Field
            name={`contents.${index}.content`}
            label={"Nội dung"}
            validation={{ contentValid: (val) => validateKeyword(val) }}
          >
            <Editor />
          </Field>
          <Field name={`contents.${index}.images`} label={"Danh sách ảnh"}>
            <ImageInput multi />
          </Field>
        </Fragment>
      ))}
      <div className="mb-8 flex-center">
        <Button
          outline
          icon={<HiPlus />}
          text="Thêm nội dung"
          onClick={() => append({ content: "", images: [] })}
        />
      </div>
    </div>
  );
}
