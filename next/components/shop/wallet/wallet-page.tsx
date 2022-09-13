import { useMemo, useState } from "react";
import { BiReceipt } from "react-icons/bi";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { RiWallet3Line } from "react-icons/ri";

import { parseNumber } from "../../../lib/helpers/parser";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import {
  MEMBER_WALLET_TRANS_LABEL_OPTIONS,
  WALLET_TRANSACTION_TYPE_OPTIONS,
  WalletTransaction,
  WalletTransactionService,
} from "../../../lib/repo/wallet-transaction.repo";
import {
  WITHDRAW_REQUEST_STATUS,
  WithdrawRequest,
  WithdrawRequestService,
} from "../../../lib/repo/withdraw-request.repo";
import { Dialog, DialogProps } from "../../shared/utilities/dialog/dialog";
import { Button, Form, FormProps, Select } from "../../shared/utilities/form";
import { Field } from "../../shared/utilities/form/field";
import { Input } from "../../shared/utilities/form/input";
import { TabButtons } from "../../shared/utilities/tab/tab-buttons";
import { DataTable } from "../../shared/utilities/table/data-table";
import { TopUpWalletFormDialog } from "./components/top-up-wallet-form-dialog";

export function WalletPage(props: ReactProps) {
  const [type, setType] = useState("in");
  const { member, staffPermission } = useAuth();
  const [openWithdrawRequest, setOpenWithdrawRequest] = useState(false);
  const [openWithdrawRequestHistory, setOpenWithdrawRequestHistory] = useState(false);
  const [openWalletFormDialog, setOpenWalletFormDialog] = useState(false);

  const hasExecutePermission = staffPermission("EXECUTE_WALLET");
  const filter = useMemo(
    () => ({ walletId: member.wallet.id, amount: { [type == "in" ? "$gt" : "$lte"]: 0 } }),
    [type]
  );
  const toast = useToast();

  return (
    <>
      <div className="flex pb-3 mb-3 border-b border-gray-300">
        <div className="flex flex-col justify-center h-16 px-4 bg-white border rounded shadow-sm min-w-3xs">
          <div className="text-sm font-medium">Ví tiền</div>
          <div className="flex items-center text-lg font-semibold text-yellow-500">
            <i className="mr-2 mb-0.5">
              <RiWallet3Line />
            </i>
            {parseNumber(member.wallet.balance)}đ
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            large
            outline
            className="bg-white"
            text={"Lịch sử lệnh rút tiền"}
            icon={<BiReceipt />}
            onClick={() => setOpenWithdrawRequestHistory(true)}
          />
          <Button
            large
            warning
            text={"Nạp tiền"}
            icon={<GiPayMoney />}
            onClick={() => {
              if (!hasExecutePermission) {
                toast.info("Bạn không có quyền thực hiện chức năng này");
              } else {
                setOpenWalletFormDialog(true);
              }
            }}
          />
          <Button
            large
            primary
            text={"Tạo lệnh rút tiền"}
            icon={<GiReceiveMoney />}
            onClick={() => {
              if (!hasExecutePermission) {
                toast.info("Bạn không có quyền thực hiện chức năng này");
              } else {
                setOpenWithdrawRequest(true)
              }
            }}
          />
        </div>
      </div>
      <DataTable<WalletTransaction>
        crudService={WalletTransactionService}
        order={{ createdAt: -1 }}
        filter={filter}
      >
        <DataTable.Toolbar>
          <TabButtons
            tabClassName="px-3"
            value={type}
            onChange={setType}
            options={[
              { value: "in", label: "Tiền vào" },
              { value: "out", label: "Tiền ra" },
            ]}
          />
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
          <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white " />
        </DataTable.Toolbar>
        <DataTable.Table className="mt-4 bg-white">
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
      <WithdrawRequesForm
        isOpen={openWithdrawRequest}
        onClose={() => setOpenWithdrawRequest(false)}
      />
      <WithdrawRequestDialog
        isOpen={openWithdrawRequestHistory}
        onClose={() => setOpenWithdrawRequestHistory(false)}
      />
      <TopUpWalletFormDialog
        isOpen={openWalletFormDialog}
        onClose={() => setOpenWalletFormDialog(false)}
      />
    </>
  );
}

function WithdrawRequesForm({ ...props }: FormProps) {
  const { member } = useAuth();
  const toast = useToast();

  return (
    <Form
      dialog
      title="Yêu cầu rút tiền"
      width={450}
      {...props}
      onSubmit={async (data) => {
        await WithdrawRequestService.create({ data, toast });
        props.onClose();
      }}
    >
      <Field label="Số dư trong ví" readOnly>
        <Input number value={member.wallet.balance} suffix="VND" />
      </Field>
      <Field
        name="value"
        label="Số tiền yêu cầu rút"
        validation={{
          checkValue: (value) => {
            if (value > member.wallet.balance) {
              return "Không thể rút nhiều hơn số dư trong ví";
            }
            return "";
          },
        }}
      >
        <Input number suffix="VND" />
      </Field>
      <Form.Footer />
    </Form>
  );
}

function WithdrawRequestDialog({ ...props }: DialogProps) {
  return (
    <Dialog width={800} title="Lịch sử yêu cầu rút tiền" {...props}>
      <Dialog.Body>
        <DataTable<WithdrawRequest> crudService={WithdrawRequestService} order={{ createdAt: -1 }}>
          <DataTable.Header>
            <div>
              <DataTable.Filter>
                <Field name="status" noError>
                  <Select
                    className="inline-grid w-56 h-12"
                    placeholder="Tất cả trạng thái"
                    clearable
                    options={WITHDRAW_REQUEST_STATUS}
                  />
                </Field>
              </DataTable.Filter>
            </div>
            <DataTable.Buttons>
              <DataTable.Button
                outline
                isRefreshButton
                refreshAfterTask
                className="w-12 h-12 bg-white"
              />
            </DataTable.Buttons>
          </DataTable.Header>
          <DataTable.Table className="mt-4">
            <DataTable.Column
              label="Ngày tạo"
              width={160}
              render={(item: WithdrawRequest) => (
                <DataTable.CellDate format="dd-MM-yyyy HH:mm" value={item.createdAt} />
              )}
            />
            <DataTable.Column
              label="Trạng thái"
              center
              width={140}
              render={(item: WithdrawRequest) => (
                <DataTable.CellStatus value={item.status} options={WITHDRAW_REQUEST_STATUS} />
              )}
            />
            <DataTable.Column
              label="Lý do từ chối (nếu có)"
              render={(item: WithdrawRequest) => (
                <DataTable.CellText value={item.rejectedReason} className="text-danger" />
              )}
            />
            <DataTable.Column
              label="Số tiền yêu cầu rút"
              right
              render={(item: WithdrawRequest) => (
                <DataTable.CellNumber value={item.value} currency className="font-semibold" />
              )}
            />
          </DataTable.Table>
          <DataTable.Pagination />
        </DataTable>
      </Dialog.Body>
    </Dialog>
  );
}
