import { parseNumber } from "../../../../../lib/helpers/parser";
import { Member } from "../../../../../lib/repo/member.repo";
import { MEMBER_WALLET_TRANS_LABEL_OPTIONS, WalletTransaction, WalletTransactionService, WALLET_TRANSACTION_TYPE_OPTIONS } from "../../../../../lib/repo/wallet-transaction.repo";
import { Dialog, DialogProps } from "../../../../shared/utilities/dialog/dialog";
import { Field, Select } from "../../../../shared/utilities/form";
import { DataTable } from "../../../../shared/utilities/table/data-table";

interface PropsType extends DialogProps {
  member: Member;
}
export function WalletTransactionDialog({ member, ...props }: PropsType) {
  return (
    <Dialog width="1080px" {...props}>
      <Dialog.Body>
        <DataTable<WalletTransaction>
          crudService={WalletTransactionService}
          order={{ createdAt: -1 }}
          filter={{ walletId: member?.wallet?.id }}
          fetchingCondition={!!member}
        >
          <DataTable.Header>
            <DataTable.Title>Lịch sử ví tiền của {member?.shopName}</DataTable.Title>
            <DataTable.Buttons>
              <DataTable.Button outline isRefreshButton refreshAfterTask />
            </DataTable.Buttons>
          </DataTable.Header>
          
          <DataTable.Divider />

          <DataTable.Toolbar>
            <DataTable.Search className="h-12" />
          <DataTable.Filter>
            <Field name="labels" noError>
              <Select
                options={MEMBER_WALLET_TRANS_LABEL_OPTIONS}
                clearable
                placeholder="Nguồn tiền"
                autosize
              />
            </Field>
          </DataTable.Filter>
          </DataTable.Toolbar>

          <DataTable.Table className="mt-4">
          <DataTable.Column
            label="Ngày giao dịch"
            width={200}
            render={(item: WalletTransaction) => <DataTable.CellDate value={item.createdAt} />}
          />
          <DataTable.Column
            label="Mã giao dịch"
            width={200}
            render={(item: WalletTransaction) => <DataTable.CellText value={item.code} />}
          />
          <DataTable.Column
            label="Loại giao dịch"
            center
            width={200}
            render={(item: WalletTransaction) => (
              <DataTable.CellStatus value={item.type} options={WALLET_TRANSACTION_TYPE_OPTIONS} />
            )}
          />
          <DataTable.Column
            label="Ghi chú"
            render={(item: WalletTransaction) => <DataTable.CellText value={item.note} />}
          />
          <DataTable.Column
            label="Số tiền"
            right
            width={200}
            render={(item: WalletTransaction) => (
              <DataTable.CellNumber
                value={item.amount}
                className={`font-bold ` + (item.amount > 0 ? "text-success" : "text-danger")}
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
