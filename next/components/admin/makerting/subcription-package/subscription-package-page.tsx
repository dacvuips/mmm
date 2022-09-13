import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { FaPlus, FaTimes } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  PackageFeature,
  SubscriptionPackage,
  SubscriptionPackageService,
} from "../../../../lib/repo/subscription-package.repo";
import {
  Button,
  Checkbox,
  Field,
  Form,
  Input,
  Label,
  Textarea,
} from "../../../shared/utilities/form";
import { Card, Spinner } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";

export function SubscriptionPackagePage() {
  const toast = useToast();

  return (
    <Card>
      <DataTable<SubscriptionPackage> crudService={SubscriptionPackageService}>
        <DataTable.Header>
          <DataTable.Title />
          <DataTable.Buttons>
            <DataTable.Button primary isCreateButton />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter></DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
          <DataTable.Column
            label="Gói dịch vụ"
            render={(item: SubscriptionPackage) => (
              <DataTable.CellText
                value={<span className="font-semibold">{item.name}</span>}
                subText={item.name}
              />
            )}
          />
          <DataTable.Column
            label="Mô tả"
            width={400}
            render={(item: SubscriptionPackage) => <DataTable.CellText value={item.desc} />}
          />
          <DataTable.Column
            label="Giá bán"
            render={(item: SubscriptionPackage) => (
              <DataTable.CellNumber value={item.sellPrice} currency />
            )}
          />
          <DataTable.Column
            label="Giá vốn"
            render={(item: SubscriptionPackage) => (
              <DataTable.CellNumber value={item.basePrice} currency />
            )}
          />
          <DataTable.Column
            label="Tháng"
            center
            render={(item: SubscriptionPackage) => <DataTable.CellText value={item.month} />}
          />
          <DataTable.Column
            label="Trạng thái"
            render={(item: SubscriptionPackage) => (
              <DataTable.CellStatus
                options={[
                  { value: false, label: "Không kích hoạt", color: "slate" },
                  { value: true, label: "Kích hoạt", color: "success" },
                ]}
                value={item.active}
              />
            )}
          />
          <DataTable.Column
            right
            render={(item: SubscriptionPackage) => (
              <>
                <DataTable.CellButton value={item} isUpdateButton />
              </>
            )}
          />
        </DataTable.Table>

        <DataTable.Form grid>
          <Field name="code" label="Mã gói dịch vụ" cols={4} required>
            <Input />
          </Field>
          <Field name="name" label="Tên gói dịch vụ" cols={8} required>
            <Input />
          </Field>
          <Field name="desc" label="Mô tả gói dịch vụ" cols={12} required>
            <Textarea />
          </Field>
          <Field name="sellPrice" label="Giá bán" cols={4} required>
            <Input number />
          </Field>
          <Field name="basePrice" label="Giá gốc" cols={4}>
            <Input number />
          </Field>
          <Field name="month" label="Số tháng" cols={4}>
            <Input number />
          </Field>
          <Field name="url" label="Đường dẫn" cols={8}>
            <Input />
          </Field>
          <Field name="active" label="Trạng thái" cols={4}>
            <Checkbox placeholder="Kích hoạt" />
          </Field>
          <Form.Title title="Danh sách tính năng" />
          <FeatureFields />
        </DataTable.Form>
        {/* <DataTable.Consumer>
          {({ loadAll }) => (
            <Form
              dialog
              width={"700px"}
              grid
              isOpen={itemUpdate !== undefined ? true : false}
              onClose={() => {
                setItemUpdate(undefined);
              }}
              onSubmit={async (data) => {
                let err = null;
                try {
                  await SubscriptionPackageService.createOrUpdate({
                    id: itemUpdate?.id,
                    data: { ...data, features },
                  });
                } catch (error) {
                  err = error;
                } finally {
                  if (err) {
                    toast.error("Lỗi tạo gói dịch vụ " + err);
                  } else {
                    toast.success((itemUpdate ? "Cập nhật" : "Tạo") + " gói dịch vụ thành công");
                    loadAll();
                    setItemUpdate(undefined);
                  }
                }
              }}
              defaultValues={itemUpdate}
              title={(itemUpdate ? "Cập nhật" : "Tạo") + " gói dịch vụ"}
            >
              <Field name="code" label="Mã gói dịch vụ" cols={6} required>
                <Input />
              </Field>
              <Field name="name" label="Tên gói dịch vụ" cols={6} required>
                <Input />
              </Field>
              <Field name="desc" label="Mô tả gói dịch vụ" cols={12} required>
                <Textarea />
              </Field>
              <Field name="sellPrice" label="Giá bán" cols={6} required>
                <Input number />
              </Field>
              <Field name="basePrice" label="Giá gốc" cols={6}>
                <Input number />
              </Field>
              <Field name="url" label="Đường dẫn" cols={6}>
                <Input />
              </Field>
              <Field name="month" label="Số tháng" cols={6}>
                <Input number />
              </Field>
              <Field name="active" label="Trạng thái gói" cols={6}>
                <Checkbox placeholder="Kích hoạt" />
              </Field>
              <div className="flex flex-col items-center col-span-12 mb-4">
                <Label text="Danh sách tính năng"></Label>
                {features ? (
                  <>
                    {features.map((item, index) => (
                      <div key={index} className="relative w-full">
                        <Field label={`Tính năng ` + (index + 1)} className="w-full ">
                          <Textarea
                            value={item.name}
                            onChange={(val) => {
                              features[index].name = val;
                              setFeatures([...features]);
                            }}
                          />
                        </Field>
                        <Button
                          icon={<RiDeleteBinLine />}
                          className="absolute top-0 right-0 w-8 h-8 px-0 rounded-full"
                          onClick={() => {
                            features.splice(index, 1);
                            setFeatures([...features]);
                          }}
                          hoverDanger
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <Spinner />
                )}

                <Button
                  text="Thêm tính năng"
                  outline
                  textPrimary
                  className="mt-4"
                  onClick={() => {
                    features.push({ name: "" });
                    setFeatures([...features]);
                  }}
                />
              </div>
              <Form.Footer />
            </Form>
          )}
        </DataTable.Consumer> */}
        <DataTable.Pagination />
      </DataTable>
    </Card>
  );
}

function FeatureFields() {
  const { fields, append, remove } = useFieldArray({ name: "features" });

  return (
    <>
      <div className="col-span-full">
        {(fields as (PackageFeature & { id: string })[]).map((feature, index) => (
          <div key={feature.id}>
            <div className="flex justify-between">
              <Label text={`Tính năng ${index + 1}`}></Label>
              <Button
                small
                hoverDanger
                text={"Xoá"}
                icon={<FaTimes />}
                onClick={() => remove(index)}
              />
            </div>
            <Field name={`features.${index}.name`} required>
              <Textarea />
            </Field>
          </div>
        ))}
        <Button
          outline
          icon={<FaPlus />}
          text="Thêm tính năng"
          onClick={() => append({ name: "" })}
        />
      </div>
    </>
  );
}
