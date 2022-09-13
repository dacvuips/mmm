import format from "date-fns/format";
import { RiCalendarEventLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import { formatDate } from "../../../lib/helpers/parser";
import { useAuth } from "../../../lib/providers/auth-provider";
import {
  ShopVoucher,
  ShopVoucherService,
  SHOP_VOUCHER_TYPES,
} from "../../../lib/repo/shop-voucher.repo";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Field } from "../../shared/utilities/form/field";
import { Select } from "../../shared/utilities/form/select";
import { Switch } from "../../shared/utilities/form/switch";
import { DataTable } from "../../shared/utilities/table/data-table";
import { VoucherForm } from "./components/voucher-form";

export function VouchersPage(props: ReactProps) {
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_VOUCHERS");
  return (
    <>
      <DataTable<ShopVoucher>
        crudService={ShopVoucherService}
        order={{ createdAt: -1 }}
        fragment={ShopVoucherService.fullFragment}
      >
        <DataTable.Header>
          <ShopPageTitle title="Khuyến mãi" subtitle="Danh sách các mã khuyến mãi" />
          <DataTable.Buttons>
            <DataTable.Button
              outline
              isRefreshButton
              refreshAfterTask
              className="w-12 h-12 bg-white"
            />
            <DataTable.Button primary isCreateButton className="h-12" disabled={!hasWritePermission} />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search className="h-12" />
          <DataTable.Filter>
            <Field name="type" noError>
              <Select
                className="h-12 inline-grid"
                autosize
                clearable
                placeholder="Tất cả loại"
                options={SHOP_VOUCHER_TYPES}
              />
            </Field>
            <Field name="isActive" noError>
              <Select
                className="h-12 inline-grid"
                autosize
                clearable
                placeholder="Tất cả loại khuyến mãi"
                options={[
                  {
                    value: true,
                    label: "Kích hoạt",
                  },
                  {
                    value: false,
                    label: "Không kích hoạt",
                  },
                ]}
              />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Consumer>
          {({ changeRowData, formItem }) => (
            <>
              <DataTable.Table className="mt-4 bg-white">
                <DataTable.Column
                  label="Mã khuyến mãi"
                  className="max-w-xs"
                  render={(item: ShopVoucher) => (
                    <DataTable.CellText
                      image={item.image}
                      className="font-semibold"
                      value={item.code}
                      subText={item.description}
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
                    <DataTable.CellText
                      className="flex justify-center"
                      value={
                        <Switch
                          readOnly={!hasWritePermission}
                          dependent
                          value={item.isActive}
                          onChange={async () => {
                            try {
                              const res = await ShopVoucherService.update({
                                id: item.id,
                                data: { isActive: !item.isActive },
                              });
                              changeRowData(item, "isActive", res.isActive);
                            } catch (err) {
                              changeRowData(item, "isActive", item.isActive);
                            }
                          }}
                        />
                      }
                    />
                  )}
                />
                <DataTable.Column
                  right
                  render={(item: ShopVoucher) => (
                    <>
                      <DataTable.CellButton value={item} isUpdateButton />
                      <DataTable.CellButton hoverDanger value={item} isDeleteButton disabled={!hasWritePermission} />
                    </>
                  )}
                />
              </DataTable.Table>
              <VoucherForm voucher={formItem} />
            </>
          )}
        </DataTable.Consumer>
        <DataTable.Pagination />
      </DataTable>
    </>
  );
}
