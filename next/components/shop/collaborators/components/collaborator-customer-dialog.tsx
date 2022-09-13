import { RiPhoneLine, RiUserLine } from "react-icons/ri";
import { InvitedCustomer } from "../../../../lib/repo/collaborator.repo";
import { InvitedCustomerService } from "../../../../lib/repo/invited-customer.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { DataTable } from "../../../shared/utilities/table/data-table";

interface PropsType extends DialogProps {
  collaboratorId: string;
}
export function CollaboratorCustomerDialog({ collaboratorId, ...props }: PropsType) {
  return (
    <Dialog width="800px" {...props}>
      <Dialog.Body>
        <DataTable<InvitedCustomer>
          crudService={InvitedCustomerService}
          order={{ createdAt: -1 }}
          apiName="getAllInvitedCustomers"
          extraParams={{ customerId: collaboratorId }}
        >
          <DataTable.Header>
            <DataTable.Title />
            <DataTable.Buttons>
              <DataTable.Button
                outline
                isRefreshButton
                refreshAfterTask
                className="w-12 h-12 bg-white"
              />
            </DataTable.Buttons>
          </DataTable.Header>

          <DataTable.Divider />

          <DataTable.Toolbar>
            <DataTable.Search className="h-12" />
            <DataTable.Filter></DataTable.Filter>
          </DataTable.Toolbar>

          <DataTable.Table className="mt-4 bg-white">
            <DataTable.Column
              label="Khách hàng"
              render={(item: InvitedCustomer) => (
                <DataTable.CellText
                  avatar={item.avatar}
                  value={
                    <>
                      <i className="mt-0.5 mr-2">
                        <RiUserLine />
                      </i>
                      {item.name || "Khách vãng lai"}
                    </>
                  }
                  subText={
                    <div className="flex font-semibold">
                      <i className="mt-1 mr-1 text-lg">
                        <RiPhoneLine />
                      </i>
                      {item.phone}
                    </div>
                  }
                  subTextClassName="flex text-sm mt-1"
                />
              )}
            />
            <DataTable.Column
              center
              label="Đã đặt hàng"
              render={(item: InvitedCustomer) => <DataTable.CellBoolean value={item.ordered} />}
            />
            <DataTable.Column
              right
              label="Hoa hồng"
              render={(item: InvitedCustomer) => (
                <DataTable.CellNumber
                  currency
                  className="text-lg font-bold text-primary"
                  value={item.commission}
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
