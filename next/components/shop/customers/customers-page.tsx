import { useState } from "react";
import {
  RiBillLine,
  RiCheckLine,
  RiFileChartLine,
  RiHome3Line,
  RiPhoneLine,
  RiTicketLine,
  RiUserLine,
} from "react-icons/ri";
import { saveFile } from "../../../lib/helpers/file";
import { parseNumber } from "../../../lib/helpers/parser";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { CustomerGroup } from "../../../lib/repo/customer-group.repo";
import { Customer, CustomerService } from "../../../lib/repo/customer.repo";
import { OrdersDialog } from "../../shared/shop-layout/orders-dialog";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Card } from "../../shared/utilities/misc";
import { DataTable } from "../../shared/utilities/table/data-table";
import { CustomerGroups } from "./components/customer-groups";
import { RewardPointLogDialog } from "./components/reward-point-log-dialog";
import { VouchersDialog } from "./components/vouchers-dialog";
import { ConditionProvider } from "./providers/condition-provider";

export function CustomersPage(props: ReactProps) {
  const [openCustomerOrder, setOpenCustomerOrder] = useState<string>("");
  const [openCustomerVouchers, setOpenCustomerVouchers] = useState<string>("");
  const [selectedCustomerGroup, setSelectedCustomerGroup] = useState<CustomerGroup>();
  const [rewardLog, setRewardLog] = useState<string>("");
  const toast = useToast();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_CUSTOMERS");
  const exportCustomerDialog = async () => {
    if (hasWritePermission) {
      try {
        await saveFile(() => CustomerService.exportExcel(), "excel", `DANH_SACH_KHACH_HANG.xlsx`, {
          onError: (message) => toast.error("Xuất thất bại", message),
        });
      } catch (err) { }
    } else {
      toast.info("Bạn không có quyền xuất danh sách khách hàng");
    }
  };

  return (
    <>
      <DataTable<Customer>
        crudService={CustomerService}
        order={{ createdAt: -1 }}
        extraParams={selectedCustomerGroup ? { groupId: selectedCustomerGroup.id } : null}
        apiName={selectedCustomerGroup ? "fetchCustomerGroup" : ""}
      >
        <DataTable.Header>
          <ShopPageTitle title="Khách hàng" subtitle="Khách hàng hệ thống" />
          <DataTable.Buttons>
            <DataTable.Button
              primary
              className="h-12"
              text="Xuất danh sách khách hàng"
              onClick={exportCustomerDialog}
            />
            <DataTable.Button
              outline
              isRefreshButton
              refreshAfterTask
              className="w-12 h-12 bg-white"
            />
            {/* <DataTable.Button primary isCreateButton className="h-12" /> */}
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <div className="flex items-start mt-4 gap-x-3">
          <DataTable.Consumer>
            {({ loadAll }) => (
              <Card className="w-72">
                <ConditionProvider>
                  <CustomerGroups
                    customerGroup={selectedCustomerGroup}
                    onCustomerGroupSelected={setSelectedCustomerGroup}
                    onCustomerGroupChange={() => {
                      setTimeout(() => {
                        loadAll(true);
                      }, 300);
                    }}
                  />
                </ConditionProvider>
              </Card>
            )}
          </DataTable.Consumer>

          <div className="flex-1">
            <DataTable.Toolbar>
              <DataTable.Search className="h-12" />
              <DataTable.Filter></DataTable.Filter>
            </DataTable.Toolbar>
            <DataTable.Table className="mt-4 bg-white">
              <DataTable.Column
                label="Khách hàng"
                render={(item: Customer) => (
                  <DataTable.CellText
                    value={
                      <div className="flex font-semibold">
                        <i className="mr-1 text-lg">
                          <RiPhoneLine />
                        </i>
                        {item.phone}
                      </div>
                    }
                    subTextClassName="flex flex-col text-sm mt-1"
                    subText={
                      <>
                        <div className="flex">
                          <i className="mt-0.5 mr-2">
                            <RiUserLine />
                          </i>
                          {item.name || "Khách vãng lai"}
                        </div>
                        {item.followerId && (
                          <span className="flex rounded-sm text-info">
                            <i className="mt-0.5 mr-2">
                              <RiCheckLine />
                            </i>{" "}
                            Zalo
                          </span>
                        )}
                      </>
                    }
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
                          <span className="font-bold">
                            {parseNumber(item.orderStats?.total)} đơn
                          </span>
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
                          <i className="mr-1 text-base">
                            <RiTicketLine />
                          </i>
                          Số voucher dùng: {item.orderStats?.voucher}
                        </div>
                        <div className="flex">
                          <i className="mr-1 text-base">
                            <RiHome3Line />
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
                    currency
                    className="font-semibold text-primary-dark"
                    value={item.rewardPointStats.total}
                  />
                )}
              />
              <DataTable.Column
                right
                label="Tổng doanh số"
                render={(item: Customer) => (
                  <DataTable.CellNumber
                    currency
                    className="font-semibold text-primary-dark"
                    value={item.orderStats?.revenue}
                  />
                )}
              />
              <DataTable.Column
                right
                render={(item: Customer) => (
                  <>
                    <DataTable.CellButton
                      value={item}
                      moreItems={[
                        {
                          icon: <RiTicketLine />,
                          text: "Danh sách mã khuyến mãi",
                          onClick: () => {
                            setOpenCustomerVouchers(item.id);
                          },
                        },
                        {
                          icon: <RiBillLine />,
                          text: "Lịch sử đơn hàng",
                          onClick: () => {
                            setOpenCustomerOrder(item.id);
                          },
                        },
                        {
                          icon: <RiFileChartLine />,
                          text: "Lịch sử điểm thưởng",
                          onClick: () => {
                            setRewardLog(item.id);
                          },
                        },
                      ]}
                    />
                  </>
                )}
              />
            </DataTable.Table>
            <DataTable.Pagination />
          </div>
        </div>
      </DataTable>
      <OrdersDialog
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
    </>
  );
}
