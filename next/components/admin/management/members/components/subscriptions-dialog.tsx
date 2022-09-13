import { RiCheckboxCircleLine, RiTimerLine } from "react-icons/ri";
import { parseNumber } from "../../../../../lib/helpers/parser";
import { Member } from "../../../../../lib/repo/member.repo";
import {
  ShopSubscription,
  ShopSubscriptionService,
  SUBSCRIPTION_PLANS,
} from "../../../../../lib/repo/shop-subscription.repo";
import { Dialog, DialogProps } from "../../../../shared/utilities/dialog/dialog";
import { DataTable } from "../../../../shared/utilities/table/data-table";

interface PropsType extends DialogProps {
  member: Member;
}
export function SubscriptionsDialog({ member, ...props }: PropsType) {
  return (
    <Dialog width="1080px" {...props}>
      <Dialog.Body>
        <DataTable<ShopSubscription>
          crudService={ShopSubscriptionService}
          order={{ createdAt: -1 }}
          filter={{ memberId: member?.id }}
          fetchingCondition={!!member}
        >
          <DataTable.Header>
            <DataTable.Title>Lịch sử đăng ký dịch vụ của {member?.shopName}</DataTable.Title>
            <DataTable.Buttons>
              <DataTable.Button outline isRefreshButton refreshAfterTask />
            </DataTable.Buttons>
          </DataTable.Header>
          {/* 
          <DataTable.Divider />

          <DataTable.Toolbar>
            <DataTable.Search className="h-12" />
            <DataTable.Filter></DataTable.Filter>
          </DataTable.Toolbar> */}

          <DataTable.Table className="mt-4">
            <DataTable.Column
              center
              label="Ngày bắt đầu"
              render={(item: ShopSubscription) => <DataTable.CellDate value={item.createdAt} />}
            />
            <DataTable.Column
              center
              label="Ngày hết hạn"
              render={(item: ShopSubscription) => <DataTable.CellDate value={item.expiredAt} />}
            />
            <DataTable.Column
              center
              label="Ngày nhắc hạn"
              render={(item: ShopSubscription) => (
                <DataTable.CellDate value={item.remindExpiredAt} />
              )}
            />
            <DataTable.Column
              center
              label="Ngày khoá"
              render={(item: ShopSubscription) => <DataTable.CellDate value={item.lockedAt} />}
            />
            <DataTable.Column
              center
              label="Ngày nhắc khoá"
              render={(item: ShopSubscription) => <DataTable.CellDate value={item.remindLockAt} />}
            />
            <DataTable.Column
              center
              label="Gói dịch vụ"
              render={(item: ShopSubscription) => (
                <DataTable.CellStatus value={item.plan} options={SUBSCRIPTION_PLANS} />
              )}
            />
            <DataTable.Column
              label="Thanh toán"
              render={(item: ShopSubscription) => (
                <DataTable.CellText
                  value={
                    <>
                      {item.fee ? (
                        <div>
                          <div className="text-gray-700">
                            Cước phí: {parseNumber(item.fee, true)}
                          </div>
                          <div
                            className={`flex items-center gap-1 ${
                              item.paymentStatus == "PENDING" ? "text-gray-600" : "text-success"
                            }`}
                          >
                            {item.paymentStatus == "PENDING" ? (
                              <>
                                <RiTimerLine />
                                <span>Chờ thanh toán</span>
                              </>
                            ) : (
                              <>
                                <RiCheckboxCircleLine />
                                <span>Đã thanh toán</span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  }
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
