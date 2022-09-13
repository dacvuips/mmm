import { useState } from "react";
import { FaCommentDots, FaHandPointer, FaMousePointer, FaShare, FaThumbsUp } from "react-icons/fa";
import { RiBillLine, RiMoneyDollarCircleLine, RiPhoneLine, RiUser5Line } from "react-icons/ri";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import {
  Collaborator,
  CollaboratorService,
  COLLABORATOR_STATUS,
} from "../../../../lib/repo/collaborator.repo";
import { MemberService } from "../../../../lib/repo/member.repo";
import { OrdersDialog } from "../../../shared/shop-layout/orders-dialog";
import { Field } from "../../../shared/utilities/form/field";
import { Select } from "../../../shared/utilities/form/select";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { CollaboratorCommissionDialog } from "../../../shop/collaborators/components/collaborator-commission-dialog";
import { CollaboratorCustomerDialog } from "../../../shop/collaborators/components/collaborator-customer-dialog";
import { ExportCollaboratorsDialog } from "./components/export-collaborators-dialog";

export function CollaboratorsPage(props) {
  const [openCollaboratorCustomers, setOpenCollaboratorCustomers] = useState<string>("");
  const [openCollaboratorOrders, setOpenCollaboratorOrders] = useState<string>("");
  const [openCollaboratorCommissions, setOpenCollaboratorCommissions] = useState("");
  const [openExportCollaborator, setOpenExportCollaborator] = useState(false);
  const { adminPermission } = useAuth();
  const hasExecutePermission = adminPermission("EXECUTE_COLLABORATORS");
  return (
    <Card>
      <DataTable<Collaborator>
        crudService={CollaboratorService}
        order={{ createdAt: -1 }}
        fragment={`${CollaboratorService.adminShortFragment}`}
      >
        <DataTable.Header>
          <DataTable.Title />
          <DataTable.Buttons>
            <DataTable.Button outline isRefreshButton refreshAfterTask />
            <DataTable.Button
              primary
              text="Xuất danh sách cộng tác viên"
              onClick={() => setOpenExportCollaborator(true)}
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
                        value: data.id,
                        label: data.shopName,
                        image: data.shopLogo,
                      }),
                    }
                  )
                }
              />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>
        <DataTable.Table className="mt-4" disableDbClick={true}>
          <DataTable.Column
            label="Mã CTV"
            center
            render={(item: Collaborator) => (
              <DataTable.CellText
                value={item.code}
                className="font-semibold"
                subTextOptions={COLLABORATOR_STATUS}
                subText={item.status}
              />
            )}
          />
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
            label="Cửa hàng"
            render={(item: Collaborator) => (
              <DataTable.CellText
                value={item.member?.shopName}
                subText={item.member?.code}
                image={item.member?.shopLogo}
              />
            )}
          />
          <DataTable.Column
            label="Thống kê đơn hàng"
            render={(item: Collaborator) => (
              <DataTable.CellText
                value={
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center whitespace-nowrap" data-tooltip="Lượt bấm">
                      <i className="mr-1 text-slate">
                        <FaMousePointer />
                      </i>
                      <span className="font-semibold">{parseNumber(item.clickCount)}</span>
                    </div>
                    <div className="flex items-center whitespace-nowrap" data-tooltip="Lượt thích">
                      <i className="mr-1 text-slate">
                        <FaThumbsUp />
                      </i>
                      <span className="font-semibold">{parseNumber(item.likeCount)}</span>
                    </div>
                    <div
                      className="flex items-center whitespace-nowrap"
                      data-tooltip="Lượt chia sẻ"
                    >
                      <i className="mr-1 text-slate">
                        <FaShare />
                      </i>
                      <span className="font-semibold">{parseNumber(item.shareCount)}</span>
                    </div>
                    <div
                      className="flex items-center whitespace-nowrap"
                      data-tooltip="Lượt bình luận"
                    >
                      <i className="mr-1 text-slate">
                        <FaCommentDots />
                      </i>
                      <span className="font-semibold">{parseNumber(item.commentCount)}</span>
                    </div>
                    <div
                      className="flex items-center whitespace-nowrap"
                      data-tooltip="Lượt tương tác"
                    >
                      <i className="mr-1 text-slate">
                        <FaHandPointer />
                      </i>
                      <span className="font-semibold">{parseNumber(item.engagementCount)}</span>
                    </div>
                  </div>
                }
              />
            )}
          />
          <DataTable.Column
            right
            render={(item: Collaborator) => (
              <>
                <DataTable.CellButton
                  value={item}
                  icon={<RiMoneyDollarCircleLine />}
                  tooltip="Lịch sử hoa hồng"
                  onClick={() => {
                    setOpenCollaboratorCommissions(item.id);
                  }}
                />
                <DataTable.CellButton
                  value={item}
                  icon={<RiUser5Line />}
                  tooltip="Khách hàng giới thiệu"
                  onClick={() => {
                    setOpenCollaboratorCustomers(item.id);
                  }}
                />
                <DataTable.CellButton
                  value={item}
                  icon={<RiBillLine />}
                  tooltip="Đơn hàng giới thiệu"
                  onClick={() => {
                    setOpenCollaboratorOrders(item.id);
                  }}
                />
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />
        <DataTable.Consumer>
          {({ filter }) => (
            <ExportCollaboratorsDialog
              isOpen={openExportCollaborator}
              onClose={() => {
                setOpenExportCollaborator(false);
              }}
              memberId={filter.memberId}
            />
          )}
        </DataTable.Consumer>
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
    </Card>
  );
}
