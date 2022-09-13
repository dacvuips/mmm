import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FaTicketAlt } from "react-icons/fa";
import { useOnScreen } from "../../../lib/hooks/useOnScreen";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useToast } from "../../../lib/providers/toast-provider";
import { CustomerVoucher, CustomerVoucherService } from "../../../lib/repo/customer-voucher.repo";
import { Customer } from "../../../lib/repo/customer.repo";
import { ShopVoucher, ShopVoucherService } from "../../../lib/repo/shop-voucher.repo";
import { NotFound, Spinner } from "../../shared/utilities/misc";
import { Button, Form, Input } from "../utilities/form";
import { TabButtons, TabButtonsRounded } from "../utilities/tab/tab-buttons";
import { VoucherDetailsDialog } from "./voucher-details-dialog";
import { VoucherItem } from "./voucher-item";
import {
  VoucherContext,
  VoucherProvider,
  VOUCHER_TYPES,
  VOUCHER_TYPES_DESKTOP,
} from "./voucher-provider";

interface Props extends ReactProps {
  isListMode?: boolean;
  onApply?: (voucher: ShopVoucher) => any;
  checkCustomer?: Customer;
}
export function VoucherList({ isListMode = false, onApply, ...props }: Props) {
  const [selectedVoucher, setSelectedVoucher] = useState<ShopVoucher>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (router.query.promotionCode) {
      ShopVoucherService.getShopVoucherByCode(router.query.promotionCode as string)
        .then(setSelectedVoucher)
        .catch(console.error);
    }
  }, [router.query.promotionCode]);

  return (
    <VoucherProvider>
      <VoucherContext.Consumer>
        {({ voucherType, setVoucherType, shopVoucherCrud, customerVoucherCrud }) => (
          <div className=" v-scrollbar">
            {/* <TabButtons options={VOUCHER_TYPES} onChange={setVoucherType} value={voucherType} /> */}
            <TabButtonsRounded
              options={props.checkCustomer != null ? VOUCHER_TYPES : VOUCHER_TYPES_DESKTOP}
              onChange={setVoucherType}
              value={voucherType}
              className="my-3"
            />
            {!isListMode && (
              <Form className="flex w-full mt-4 rounded-md border-group">
                <Input
                  className="h-12"
                  inputClassName="w-0"
                  placeholder="Nhập mã khuyến mãi ở đây"
                  value={voucherCode}
                  onChange={setVoucherCode}
                />
                <Button
                  submit
                  className="h-12 font-medium whitespace-nowrap"
                  primary
                  text="Áp dụng"
                  onClick={async () => {
                    if (!voucherCode) {
                      toast.info("Xin nhập mã khuyến mãi");
                      return;
                    }
                    try {
                      const customerRes = await CustomerVoucherService.getAll({
                        query: {
                          limit: 1,
                          filter: { code: voucherCode, status: "STILL_ALIVE" },
                        },
                        fragment: CustomerVoucherService.fullFragment,
                      });
                      if (customerRes.data.length) {
                        onApply(customerRes.data[0].voucher);
                        setVoucherCode("");
                      } else {
                        const voucher = await ShopVoucherService.getShopVoucherByCode(voucherCode);
                        // const shopRes = await ShopVoucherService.getAll({
                        //   query: {
                        //     limit: 1,
                        //     filter: { code: voucherCode, isActive: true },
                        //   },
                        //   fragment: ShopVoucherService.fullFragment,
                        // });
                        if (voucher) {
                          onApply(voucher);
                          setVoucherCode("");
                        } else {
                          toast.error("Không tìm thấy khuyến mãi có mã này");
                        }
                      }
                    } catch (err) {
                      toast.error("Có lỗi khi áp dụng mã. Xin thử lại sau.");
                    }
                  }}
                />
              </Form>
            )}
            {voucherType == "SHOP" ? (
              <>
                {shopVoucherCrud.items ? (
                  <>
                    {shopVoucherCrud.items.length ? (
                      <div className="flex flex-col gap-3 my-3 overflow-x-hidden">
                        {shopVoucherCrud.items
                          .filter((item) => {
                            if (item.applyISODayOfWeek?.length === 0) {
                              return item;
                            }
                            return item.applyISODayOfWeek?.find((day) => {
                              // write minute 1 because data return from server is with 1 = sunday 7 = saturday [WIP]
                              let currentDay = parseInt(JSON.stringify(DAYS_OF_WEEK[new Date().getDay() - 1]?.key))
                              return day === currentDay;
                              // return day === new Date().getDay();
                            });
                          })
                          .map((item: ShopVoucher, index) => (
                            <VoucherItem
                              key={item.id}
                              voucher={item}
                              onShowDetails={() => setSelectedVoucher(item)}
                              {...(isListMode
                                ? {}
                                : {
                                  onApply: () => onApply(item),
                                })}
                            />
                          ))}
                        {shopVoucherCrud.loading ? (
                          <div className="font-semibold text-center loading-ellipsis text-primary">
                            Đang tải thêm
                          </div>
                        ) : (
                          <>
                            {shopVoucherCrud.items.length < shopVoucherCrud.pagination.total && (
                              <LoadingObserver onLoadMore={() => shopVoucherCrud.loadMore()} />
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <NotFound text="Không có mã khuyến mãi của cửa hàng" icon={<FaTicketAlt />} />
                    )}
                  </>
                ) : (
                  <Spinner />
                )}
              </>
            ) : (
              <>
                {customerVoucherCrud.items ? (
                  <>
                    {customerVoucherCrud.items.length ? (
                      <div className="flex flex-col gap-3 my-3 overflow-x-hidden">
                        {customerVoucherCrud.items.map((item: CustomerVoucher, index) => (
                          <VoucherItem
                            key={item.id}
                            voucher={item.voucher}
                            onShowDetails={() => setSelectedVoucher(item.voucher)}
                            onApply={() => onApply(item.voucher)}
                          />
                        ))}
                        {customerVoucherCrud.loading ? (
                          <div className="font-semibold text-center loading-ellipsis text-primary">
                            Đang tải thêm
                          </div>
                        ) : (
                          <>
                            {customerVoucherCrud.items.length <
                              customerVoucherCrud.pagination.total && (
                                <LoadingObserver onLoadMore={() => customerVoucherCrud.loadMore()} />
                              )}
                          </>
                        )}
                      </div>
                    ) : (
                      <NotFound text="Bạn không có mã khuyến mãi nào" icon={<FaTicketAlt />} />
                    )}
                  </>
                ) : (
                  <Spinner />
                )}
              </>
            )}
            <VoucherDetailsDialog
              voucher={selectedVoucher}
              isOpen={selectedVoucher ? true : false}
              onClose={() => {
                const url = new URL(location.href);
                url.searchParams.delete("promotionCode");
                router.replace(url.toString(), null, { shallow: true });
                setSelectedVoucher(null);
              }}
            />
          </div>
        )}
      </VoucherContext.Consumer>
    </VoucherProvider>
  );
}

function LoadingObserver({ onLoadMore }: { onLoadMore: () => any }) {
  const ref = useRef();
  const onScreen = useOnScreen(ref, "-10px");
  useEffect(() => {
    if (onScreen) {
      onLoadMore();
    }
  }, [onScreen]);
  return <div ref={ref}></div>;
}
export const DAYS_OF_WEEK = [
  { key: 2, value: "Monday" },
  { key: 3, value: "Tuesday" },
  { key: 4, value: "Wednesday" },
  { key: 5, value: "Thursday" },
  { key: 6, value: "Friday" },
  { key: 7, value: "Saturday" },
  { key: 1, value: "sunday" },
];
