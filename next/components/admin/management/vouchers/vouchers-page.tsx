import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { RiCalendarEventLine, RiEyeLine } from "react-icons/ri";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { formatDate } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { MemberService } from "../../../../lib/repo/member.repo";
import {
  ShopVoucherGroup,
  ShopVoucherGroupService,
} from "../../../../lib/repo/shop-voucher-group.repo";
import {
  ShopVoucher,
  ShopVoucherService,
  SHOP_VOUCHER_TYPES,
} from "../../../../lib/repo/shop-voucher.repo";
import { Field, Form, Input, Select } from "../../../shared/utilities/form";
import { List } from "../../../shared/utilities/list";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { ExportVouchersDialog } from "./components/export-vouchers-dialog";

export function VouchersPage(props) {
  const [openExportVoucher, setOpenExportVoucher] = useState(false);
  const [selectedVoucherGroup, setSelectedVoucherGroup] = useState<ShopVoucherGroup>();
  const toast = useToast();
  const { adminPermission } = useAuth();
  const hasWritePermission = adminPermission("WRITE_VOUCHERS");
  const hasExecutePermission = adminPermission("EXECUTE_VOUCHERS");
  return (
    <Card>
      <DataTable<ShopVoucher>
        crudService={ShopVoucherService}
        order={{ createdAt: -1 }}
        fragment={`${ShopVoucherService.shortFragment} 
          member { id shopName shopLogo } 
        `}
        filter={{ shopVoucherGroupId: selectedVoucherGroup?.id }}
      >
        <div className="flex gap-x-3">
          <DataTable.Consumer>
            {({ loadAll }) => (
              <List<ShopVoucherGroup>
                saveDisabled={!hasWritePermission}
                deleteDisabled={!hasWritePermission}
                className="w-56"
                crudService={ShopVoucherGroupService}
                selectedItem={selectedVoucherGroup}
                onSelect={(item) => setSelectedVoucherGroup(item)}
                onChange={() => {
                  loadAll(true);
                }}
                renderItem={(item, selected) => (
                  <>
                    <div
                      className={`font-semibold text-sm ${selected ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        }`}
                    >
                      {item.name || "Tất cả"}
                    </div>
                  </>
                )}
              >
                <List.Form>
                  <Field
                    name="name"
                    label={"Tên nhóm voucher"}
                    required
                    cols={6}
                    validation={{ nameValid: (val) => validateKeyword(val) }}
                  >
                    <Input autoFocus />
                  </Field>
                  <Field name="priority" label="Ưu tiên" required cols={6}>
                    <Input number placeholder="Vui lòng nhập số" />
                  </Field>
                </List.Form>
              </List>
            )}
          </DataTable.Consumer>
          <div className="flex-1">
            <DataTable.Header>
              <DataTable.Title />
              <DataTable.Buttons>
                <DataTable.Button outline isRefreshButton refreshAfterTask />
                <DataTable.Button
                  primary
                  text="Xuất danh sách coupon"
                  onClick={() => setOpenExportVoucher(true)}
                  disabled={!hasExecutePermission}
                />
              </DataTable.Buttons>
            </DataTable.Header>

            <DataTable.Divider />

            <DataTable.Toolbar>
              <DataTable.Search />
              <DataTable.Filter>
                <Field name="memberId" noError>
                  <Select
                    className="min-w-2xs"
                    placeholder="Lọc theo cửa hàng"
                    hasImage
                    clearable
                    autocompletePromise={({ id, search }) =>
                      MemberService.getAllAutocompletePromise(
                        { id, search },
                        {
                          fragment: "id shopName shopLogo",
                          parseOption: (data) => ({
                            value: data?.id,
                            label: data?.shopName,
                            image: data?.shopLogo,
                          }),
                        }
                      )
                    }
                  />
                </Field>
              </DataTable.Filter>
            </DataTable.Toolbar>

            <DataTable.Table className="mt-4 bg-white">
              <DataTable.Column
                label="Mã khuyến mãi"
                className="max-w-xs"
                render={(item: ShopVoucher) => (
                  <DataTable.CellText
                    image={item?.image}
                    className="font-semibold"
                    value={item?.code}
                    subText={item?.description}
                  />
                )}
              />
              <DataTable.Column
                label="Cửa hàng"
                render={(item: ShopVoucher) => (
                  <DataTable.CellText
                    value={item?.member?.shopName}
                    subText={item?.member?.code}
                    image={item?.member?.shopLogo}
                  />
                )}
              />
              <DataTable.Column
                center
                label="Loại"
                render={(item: ShopVoucher) => (
                  <DataTable.CellStatus value={item.type} options={SHOP_VOUCHER_TYPES} />
                )}
              />
              <DataTable.Column
                center
                label="Nhóm khuyến mãi"
                render={(item: ShopVoucher) => (
                  <DataTable.CellText value={item?.shopVoucherGroup?.name} />
                )}
              />
              <DataTable.Column
                center
                label="Ngày hoạt động"
                render={(item: ShopVoucher) => (
                  <DataTable.CellText
                    className="text-sm text-gray-500"
                    value={
                      <>
                        {item.startDate && (
                          <div className="flex">
                            <i className="mt-1 mr-1">
                              <RiCalendarEventLine />
                            </i>
                            Từ ngày {formatDate(item.startDate, "dd-MM-yyyy")}
                          </div>
                        )}
                        {item.endDate && (
                          <div className="flex">
                            <i className="mt-1 mr-1">
                              <RiCalendarEventLine />
                            </i>
                            Đến ngày {formatDate(item.endDate, "dd-MM-yyyy")}
                          </div>
                        )}
                      </>
                    }
                  />
                )}
              />
              <DataTable.Column
                center
                label="Kích hoạt"
                render={(item: ShopVoucher) => (
                  <DataTable.CellBoolean className="flex justify-center" value={item.isActive} />
                )}
              />
              <DataTable.Column
                right
                render={(item: ShopVoucher) => (
                  <>
                    <DataTable.CellButton value={item} icon={<AiOutlineEdit />} isUpdateButton />
                  </>
                )}
              />
            </DataTable.Table>
            <DataTable.Pagination />
          </div>
        </div>
        <DataTable.Consumer>
          {({ formItem, setFormItem, loadAll }) => (
            <Form
              dialog
              defaultValues={formItem}
              grid
              width={500}
              isOpen={formItem ? true : false}
              onClose={() => setFormItem(null)}
              title="Cập nhập nhóm khuyến mãi cửa hàng"
              onSubmit={async (values) => {
                const { id } = formItem;
                await ShopVoucherService.updateShopVoucherAdmin(id, values.shopVoucherGroupId).then(
                  (res) => {
                    setFormItem(null);
                    toast.success("Cập nhập thành công");
                    loadAll();
                  }
                );
              }}
            >
              <Field label="Mã khuyến mãi" name="code" cols={12} readOnly>
                <Input />
              </Field>

              {/* <Field label="Cửa hàng" name="" cols={6} required readOnly>
                <Input />
              </Field> */}

              <Field label="loại" name="type" cols={6} required readOnly>
                <Select options={SHOP_VOUCHER_TYPES} />
              </Field>
              <Field label="Nhóm voucher" name="shopVoucherGroupId" cols={6}>
                <Select optionsPromise={() => ShopVoucherGroupService.getAllOptionsPromise()} />
              </Field>
              <Form.Footer
                submitProps={{
                  disabled: !hasExecutePermission,
                }}
              />
            </Form>
          )}
        </DataTable.Consumer>
        <DataTable.Consumer>
          {({ filter }) => (
            <ExportVouchersDialog
              isOpen={openExportVoucher}
              onClose={() => {
                setOpenExportVoucher(false);
              }}
              memberId={filter.memberId}
            />
          )}
        </DataTable.Consumer>
      </DataTable>
    </Card>
  );
}
