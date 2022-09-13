import { useState } from "react";
import {
  RiBillLine,
  RiCheckFill,
  RiFileChartLine,
  RiPhoneLine,
  RiTicketLine,
  RiUserLine,
} from "react-icons/ri";
import { useAuth } from "../../../../lib/providers/auth-provider";

import { Customer, CustomerService } from "../../../../lib/repo/customer.repo";
import { GlobalCustomer, GlobalCustomerService } from "../../../../lib/repo/global-customer.repo";
import { OrdersDialog } from "../../../shared/shop-layout/orders-dialog";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { RewardPointLogDialog } from "../../../shop/customers/components/reward-point-log-dialog";
import { VouchersDialog } from "../../../shop/customers/components/vouchers-dialog";
import { ExportCustomersDialog } from "./components/export-customers-dialog";

export function CustomersPage(props) {
  const [openCustomerOrder, setOpenCustomerOrder] = useState<string>("");
  const [openCustomerVouchers, setOpenCustomerVouchers] = useState<string>("");
  const [rewardLog, setRewardLog] = useState<string>("");
  const [openExportCustomer, setOpenExportCustomer] = useState(false);
  const { adminPermission } = useAuth();
  const hasWritePermission = adminPermission("WRITE_CUSTOMERS");
  return (
    <Card>
      <DataTable<GlobalCustomer> crudService={GlobalCustomerService}>
        <DataTable.Header>
          <DataTable.Title />
          <DataTable.Buttons>
            <DataTable.Button outline isRefreshButton refreshAfterTask />
            <DataTable.Button
              primary
              text="Xuất danh sách khách hàng"
              onClick={() => setOpenExportCustomer(true)}
              disabled={!hasWritePermission}
            />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter>
            {/* <Field name="memberId" noError>
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
            </Field> */}
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
          <DataTable.Column
            label="Khách hàng"
            render={(item: Customer) => (
              <DataTable.CellText
                avatar={item.avatar}
                value={
                  <div className="flex font-semibold">
                    <i className="mr-1 text-lg">
                      <RiPhoneLine />
                    </i>
                    {item.phone}
                  </div>
                }
                subText={
                  <>
                    <div className="flex mt-1 text-sm">
                      <i className="mt-0.5 mr-2">
                        <RiUserLine />
                      </i>
                      {item.name || "Khách vãng lai"}
                    </div>
                    {item.isCollaborator && (
                      <div className="flex text-sm text-success">
                        <i className="mt-1 mr-2">
                          <RiCheckFill />
                        </i>
                        Là cộng tác viên
                      </div>
                    )}
                  </>
                }
              />
            )}
          />
          <DataTable.Column
            label="Mã KH"
            render={(item: GlobalCustomer) => <DataTable.CellText value={item.code} />}
          />
          <DataTable.Column
            label="Địa chỉ"
            render={(item: Customer) => <DataTable.CellText value={item.fullAddress} />}
          />
          {/* <DataTable.Column
            label="Cửa hàng"
            render={(item: Customer) => (
              <DataTable.CellText
                value={item.member?.shopName}
                subText={item.member?.code}
                image={item.member?.shopLogo}
              />
            )}
          />
          <DataTable.Column
            label="Đơn hàng"
            render={(item: Customer) => (
              <DataTable.CellText
                value={
                  <>
                    <div className="flex whitespace-nowrap">
                      <span className="w-28">Thành công:</span>
                      <span className="font-semibold text-success">
                        {parseNumber(item.orderStats?.completed)} đơn
                      </span>
                    </div>
                    <div className="flex whitespace-nowrap">
                      <span className="w-28">Đã huỷ:</span>
                      <span className="font-semibold text-danger">
                        {parseNumber(item.orderStats?.canceled)} đơn
                      </span>
                    </div>
                    <div className="flex whitespace-nowrap">
                      <span className="w-28">Tổng cộng:</span>
                      <span className="font-bold">{parseNumber(item.orderStats?.total)} đơn</span>
                    </div>
                  </>
                }
              />
            )}
          />
          <DataTable.Column
            label="Giảm giá"
            render={(item: Customer) => (
              <DataTable.CellText
                value={
                  <>
                    <div className="flex">
                      <i className="mr-1 text-lg">
                        <RiTicketLine />
                      </i>
                      Số voucher dùng: {item.orderStats?.voucher}
                    </div>
                    <div className="flex">
                      <i className="mr-1 text-lg">
                        <RiPercentLine />
                      </i>
                      Tổng giảm giá: {parseNumber(item.orderStats?.discount, true)}
                    </div>
                  </>
                }
              />
            )}
          />
          <DataTable.Column
            right
            label="Điểm thưởng"
            render={(item: Customer) => (
              <DataTable.CellNumber
                className="text-lg font-bold text-primary"
                value={item.rewardPointStats?.total}
              />
            )}
          />
          <DataTable.Column
            right
            label="Tổng doanh số"
            render={(item: Customer) => (
              <DataTable.CellNumber
                currency
                className="text-lg font-bold text-primary"
                value={item.orderStats?.revenue}
              />
            )}
          /> */}
          <DataTable.Column
            right
            render={(item: Customer) => (
              <>
                <DataTable.CellButton
                  value={item}
                  icon={<RiTicketLine />}
                  tooltip="Lịch sử khuyến mãi"
                  onClick={() => {
                    setOpenCustomerVouchers(item.id);
                  }}
                />
                <DataTable.CellButton
                  value={item}
                  icon={<RiBillLine />}
                  tooltip="Lịch sử đơn hàng"
                  onClick={() => {
                    setOpenCustomerOrder(item.id);
                  }}
                />
                <DataTable.CellButton
                  value={item}
                  icon={<RiFileChartLine />}
                  tooltip="Lịch sử điểm thưởng"
                  onClick={() => {
                    setRewardLog(item.id);
                  }}
                />
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />

        <DataTable.Consumer>
          {({ filter }) => (
            <ExportCustomersDialog
              isOpen={openExportCustomer}
              onClose={() => {
                setOpenExportCustomer(false);
              }}
              memberId={filter.memberId}
            />
          )}
        </DataTable.Consumer>
      </DataTable>
      <OrdersDialog
        mode="admin"
        isOpen={!!openCustomerOrder}
        onClose={() => setOpenCustomerOrder("")}
        filter={openCustomerOrder ? { buyerId: openCustomerOrder } : null}
      />
      <VouchersDialog
        isOpen={!!openCustomerVouchers}
        onClose={() => setOpenCustomerVouchers("")}
        filter={openCustomerVouchers ? { customerId: openCustomerVouchers } : null}
      />
      <RewardPointLogDialog
        isOpen={!!rewardLog}
        onClose={() => setRewardLog("")}
        filter={rewardLog ? { customerId: rewardLog } : null}
      />
    </Card>
  );
}
