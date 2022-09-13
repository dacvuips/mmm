import { useState } from "react";
import { FaCopy } from "react-icons/fa";
import {
  RiBillLine,
  RiHandCoinLine,
  RiMoneyDollarCircleLine,
  RiPhoneLine,
  RiUser5Line,
} from "react-icons/ri";
import { parseNumber } from "../../../lib/helpers/parser";
import {
  Collaborator,
  CollaboratorService,
  COLLABORATOR_STATUS,
} from "../../../lib/repo/collaborator.repo";
import { CUSTOMER_MOMO_WALLET_STATUS } from "../../../lib/repo/customer.repo";
import { OrdersDialog } from "../../shared/shop-layout/orders-dialog";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Field } from "../../shared/utilities/form/field";
import { Input } from "../../shared/utilities/form/input";
import { Select } from "../../shared/utilities/form/select";
import { DataTable } from "../../shared/utilities/table/data-table";
import { CollaboratorCommissionDialog } from "./components/collaborator-commission-dialog";
import { CollaboratorCustomerDialog } from "./components/collaborator-customer-dialog";
import { SpendCommissionDialog } from "./components/spend-commission-dialog";
import copy from "copy-to-clipboard";
import { useToast } from "../../../lib/providers/toast-provider";
import { useAuth } from "../../../lib/providers/auth-provider";
import { validateKeyword } from "../../../lib/constants/validate-keyword";

export function CollaboratorsPage(props: ReactProps) {
  const [openCollaboratorCustomers, setOpenCollaboratorCustomers] = useState<string>("");
  const [openCollaboratorOrders, setOpenCollaboratorOrders] = useState<string>("");
  const [openCollaboratorCommissions, setOpenCollaboratorCommissions] = useState("");
  const [openSpendCommissions, setOpenSpendCommissions] = useState<Collaborator>(null);
  const toast = useToast();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_COLLABORATORS");

  return (
    <>
      <DataTable<Collaborator>
        crudService={CollaboratorService}
        fragment={CollaboratorService.fullFragment}
        order={{ createdAt: -1 }}
      >
        <DataTable.Header>
          <ShopPageTitle
            title="Cộng tác viên"
            subtitle="Những khách hàng đăng ký làm cộng tác viên"
          />
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
            <Field name="status" noError>
              <Select
                className="inline-grid h-12"
                autosize
                clearable
                placeholder="Tất cả trạng thái"
                options={COLLABORATOR_STATUS}
              />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4 bg-white">
          <DataTable.Column
            label="Cộng tác viên"
            render={(item: Collaborator) => (
              <DataTable.CellText
                value={item.name}
                className="font-semibold"
                subTextClassName="flex"
                subText={
                  <>
                    <i className="mt-1 mr-1">
                      <RiPhoneLine />
                    </i>
                    {item.phone}
                  </>
                }
              />
            )}
          />
          <DataTable.Column
            label="Mã CTV"
            center
            render={(item: Collaborator) => (
              <DataTable.CellButton
                small
                value={item}
                text={item.code}
                icon={<FaCopy />}
                onClick={() => {
                  copy(item.shortUrl);
                  toast.success("Đã sao chép", null, { position: "top-center" });
                }}
              />
            )}
          />
          <DataTable.Column
            center
            label="Trạng thái"
            render={(item: Collaborator) => (
              <DataTable.CellStatus value={item.status} options={COLLABORATOR_STATUS} />
            )}
          />
          <DataTable.Column
            center
            label="Ví MoMo"
            render={(item: Collaborator) => (
              <DataTable.CellStatus
                type="text"
                value={item.customer?.momoWallet.status}
                options={CUSTOMER_MOMO_WALLET_STATUS}
              />
            )}
          />
          <DataTable.Column
            label="Đã chi"
            right
            render={(item: Collaborator) => (
              <DataTable.CellText
                value={parseNumber(item.commissionStats?.totalDisburse, true)}
                className="font-semibold"
              />
            )}
          />
          <DataTable.Column
            label="Còn lại"
            right
            render={(item: Collaborator) => (
              <DataTable.CellText
                value={parseNumber(item.commissionStats?.commission, true)}
                className="font-semibold"
              />
            )}
          />
          <DataTable.Column
            right
            render={(item: Collaborator) => (
              <>
                <DataTable.CellButton
                  value={item}
                  moreItems={[
                    {
                      icon: <RiHandCoinLine />,
                      text: "Chi hoa hồng",
                      onClick: () => {
                        setOpenSpendCommissions(item);
                      },

                    },
                    {
                      icon: <RiMoneyDollarCircleLine />,
                      text: "Lịch sử hoa hồng",
                      onClick: () => {
                        setOpenCollaboratorCommissions(item.customerId);
                      },
                    },
                    {
                      icon: <RiUser5Line />,
                      text: "Khách hàng giới thiệu",
                      onClick: () => {
                        setOpenCollaboratorCustomers(item.customerId);
                      },
                    },
                    {
                      icon: <RiBillLine />,
                      text: "Đơn hàng giới thiệu",
                      onClick: () => {
                        setOpenCollaboratorOrders(item.id);
                      },
                    },
                  ]}
                />
                <DataTable.CellButton value={item} isUpdateButton />
                <DataTable.CellButton hoverDanger value={item} isDeleteButton disabled={!hasWritePermission} />
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Consumer>
          {({ formItem, loadAll }) => (
            <>
              <DataTable.Form
                minWidth={700}
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
                <Field name="name" label="Tên cộng tác viên" cols={6} required validation={{ nameValid: (val) => validateKeyword(val) }} >
                  <Input />
                </Field>
                <Field name="phone" label="Số điện thoại" cols={6} required>
                  <Input />
                </Field>
                {formItem?.id && (
                  <>
                    <Field name="code" label="Mã cộng tác viên" cols={6} readOnly>
                      <Input />
                    </Field>
                    <Field name="status" label="Trạng thái" cols={6}>
                      <Select options={COLLABORATOR_STATUS} />
                    </Field>
                  </>
                )}
              </DataTable.Form>

              <SpendCommissionDialog
                collaborator={openSpendCommissions}
                isOpen={!!openSpendCommissions}
                onClose={() => setOpenSpendCommissions(null)}
                onSuccess={() => {
                  loadAll(true);
                }}
              />
            </>
          )}
        </DataTable.Consumer>
        <DataTable.Pagination />
      </DataTable>
      <CollaboratorCommissionDialog
        isOpen={!!openCollaboratorCommissions}
        onClose={() => setOpenCollaboratorCommissions("")}
        filter={openCollaboratorCommissions ? { customerId: openCollaboratorCommissions } : null}
      />
      <CollaboratorCustomerDialog
        isOpen={!!openCollaboratorCustomers}
        onClose={() => setOpenCollaboratorCustomers("")}
        collaboratorId={openCollaboratorCustomers}
      />
      <OrdersDialog
        isOpen={!!openCollaboratorOrders}
        onClose={() => setOpenCollaboratorOrders("")}
        filter={openCollaboratorOrders ? { collaboratorId: openCollaboratorOrders } : null}
      />
    </>
  );
}
