import {
  CustomerVoucher,
  CustomerVoucherService
} from "../../../../lib/repo/customer-voucher.repo";
import { SHOP_VOUCHER_TYPES } from "../../../../lib/repo/shop-voucher.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Field } from "../../../shared/utilities/form/field";
import { Select } from "../../../shared/utilities/form/select";
import { DataTable } from "../../../shared/utilities/table/data-table";

interface PropsType extends DialogProps {
  filter: any;
}
export function VouchersDialog({ filter, ...props }: PropsType) {
  return (
    <Dialog width="800px" {...props}>
      <Dialog.Body>
        <DataTable<CustomerVoucher>
          crudService={CustomerVoucherService}
          order={{ createdAt: -1 }}
          fragment={CustomerVoucherService.fullFragment}
          filter={filter}
          fetchingCondition={!!filter}
        >
          <DataTable.Header>
            <DataTable.Title />
            <DataTable.Buttons>
              <DataTable.Button outline isRefreshButton refreshAfterTask />
            </DataTable.Buttons>
          </DataTable.Header>

          <DataTable.Divider />

          <DataTable.Toolbar>
            <DataTable.Search />
            <DataTable.Filter>
              <Field name="type" noError>
                <Select autosize clearable placeholder="Tất cả loại" options={SHOP_VOUCHER_TYPES} />
              </Field>
            </DataTable.Filter>
          </DataTable.Toolbar>

          <DataTable.Table className="mt-4 bg-white">
            <DataTable.Column
              label="Mã khuyến mãi"
              className="max-w-xs"
              render={(item: CustomerVoucher) => (
                <DataTable.CellText
                  image={item.voucher?.image}
                  className="font-semibold"
                  value={item.voucherCode}
                  subText={item.voucher?.description}
                />
              )}
            />
            <DataTable.Column
              center
              label="Loại"
              render={(item: CustomerVoucher) => (
                <DataTable.CellStatus
                  value={item.voucher?.type || "NONE"}
                  options={[
                    ...SHOP_VOUCHER_TYPES,
                    { value: "NONE", label: "Khuyến mãi đã bị xóa", color: "slate" },
                  ]}
                />
              )}
            />
          </DataTable.Table>
          <DataTable.Pagination />
        </DataTable>
      </Dialog.Body>
    </Dialog>
  );
}
