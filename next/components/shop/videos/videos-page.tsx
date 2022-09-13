import { useState } from "react";
import { validateKeyword } from "../../../lib/constants/validate-keyword";
import { useAuth } from "../../../lib/providers/auth-provider";
import { ShopVideo, ShopVideoService } from "../../../lib/repo/video.repo";
import { OrdersDialog } from "../../shared/shop-layout/orders-dialog";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Field } from "../../shared/utilities/form/field";
import { Input } from "../../shared/utilities/form/input";
import { Switch } from "../../shared/utilities/form/switch";
import { Textarea } from "../../shared/utilities/form/textarea";
import { DataTable } from "../../shared/utilities/table/data-table";

export function ShopVideosPage(props: ReactProps) {
  const [openOrders, setOpenOrders] = useState<string>("");
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_VIDEOS");

  return (
    <>
      <DataTable<ShopVideo> crudService={ShopVideoService} order={{ priority: -1 }}>
        <DataTable.Header>
          <ShopPageTitle title="Videos" subtitle="Quản lý danh sách video" />
          <DataTable.Buttons>
            <DataTable.Button
              outline
              isRefreshButton
              refreshAfterTask
              className="w-12 h-12 bg-white"
            />
            <DataTable.Button
              primary
              isCreateButton
              className="h-12"
              disabled={!hasWritePermission}
            />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search className="h-12" />
          <DataTable.Filter></DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Consumer>
          {({ changeRowData, formItem }) => (
            <>
              <DataTable.Table className="mt-4 bg-white">
                <DataTable.Column
                  label="Video"
                  render={(item: ShopVideo) => (
                    <DataTable.CellText
                      value={
                        <a
                          target="_blank"
                          href={item.link}
                          className="underline hover:underline hover:text-primary"
                        >
                          {item.name}
                        </a>
                      }
                      className="font-medium"
                    />
                  )}
                />
                <DataTable.Column
                  center
                  label="Ưu tiên"
                  render={(item: ShopVideo) => <DataTable.CellText value={item.priority} />}
                />

                <DataTable.Column
                  center
                  label="Kích hoạt"
                  render={(item: ShopVideo) => (
                    <DataTable.CellText
                      className="flex justify-center"
                      value={
                        <Switch
                          readOnly={!hasWritePermission}
                          dependent
                          value={item.active}
                          onChange={async () => {
                            try {
                              const res = await ShopVideoService.update({
                                id: item.id,
                                data: { active: !item.active },
                              });
                              changeRowData(item, "active", res.active);
                            } catch (err) {
                              changeRowData(item, "active", item.active);
                            }
                          }}
                        />
                      }
                    />
                  )}
                />
                <DataTable.Column
                  right
                  render={(item: ShopVideo) => (
                    <>
                      <DataTable.CellButton value={item} isUpdateButton />
                      <DataTable.CellButton
                        value={item}
                        isDeleteButton
                        disabled={!hasWritePermission}
                      />
                    </>
                  )}
                />
              </DataTable.Table>
            </>
          )}
        </DataTable.Consumer>
        <DataTable.Form
          extraDialogClass="bg-transparent"
          extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
          extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
          footerProps={{
            className: "justify-center",
            submitProps: { className: "h-14 w-64", disabled: !hasWritePermission },
            cancelText: "",
          }}
          grid
        >
          <Field
            name="name"
            label="Tên video"
            cols={12}
            required
            validation={{ nameValid: (val) => validateKeyword(val) }}
          >
            <Input />
          </Field>
          <Field name="link" label="Link youtube" cols={12} required>
            <Input type="url" />
          </Field>
          <Field name="priority" label="Ưu tiên" cols={8}>
            <Input type="number" />
          </Field>
          <Field name="active" label=" " cols={4} className="flex">
            <Switch placeholder="Kích hoạt" />
          </Field>
          <Field
            name="description"
            label="Mô tả"
            cols={12}
            validation={{ descValid: (val) => validateKeyword(val) }}
          >
            <Textarea />
          </Field>
        </DataTable.Form>
        <DataTable.Pagination />
      </DataTable>
      <OrdersDialog
        mode="driver"
        isOpen={!!openOrders}
        onClose={() => setOpenOrders("")}
        filter={openOrders ? { driverId: openOrders } : null}
      />
    </>
  );
}
