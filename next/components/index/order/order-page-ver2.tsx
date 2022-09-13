import { Billed } from "./component/billed-ver2";
import { OrderProvider, useOrderContext } from "./providers/order-provider";
import { Spinner, NotFound } from "../../shared/utilities/misc";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { useCart } from "../../../lib/providers/cart-provider";
import { ORDER_STATUS } from "../../../lib/repo/order.repo";
import { useEffect, useState } from "react";
import { Button } from "../../shared/utilities/form/button";
import { FaChevronLeft } from "react-icons/fa";
import { useScreen } from "../../../lib/hooks/useScreen";

export function OrderPage() {
  const { shopCode } = useShopContext();
  const screenLg = useScreen("lg");
  return (
    <OrderProvider>
      <div
        className={`${
          screenLg ? "main-container" : "w-full"
        } relative  min-h-screen py-4 text-gray-600 bg-gray-50`}
      >
        {/* <div className="flex items-center w-full py-1">
          <Button
            icon={<FaChevronLeft />}
            iconClassName="text-xl text-gray-400"
            className="w-10 pl-0"
            tooltip={"Trang chủ"}
            href={`/${shopCode}`}
          />
          <h2 className="flex-1 text-lg font-semibold text-center">Lịch sử đặt hàng</h2>
          <div className="w-10"></div>
        </div> */}
        <ListOrder />
      </div>
    </OrderProvider>
  );
}

function ListOrder() {
  const { items, limit, setLimit, pagination, loadAll } = useOrderContext();
  const { reOrder } = useCart();
  const [loading, setLoading] = useState(false);
  const [curPos, setCurPos] = useState(null);
  function menuScrollEvent() {
    let scrollCheckInterval = null;
    let billeds = document.getElementsByClassName("billed");
    if (billeds && billeds.length > 0) {
      const { y } = billeds[0].getBoundingClientRect();
      if (!curPos || y < curPos) {
        setCurPos(y);
        setLimit(limit + 5);
        clearInterval(scrollCheckInterval);
      }
    }
  }
  async function load(limit) {
    setLoading(true);
    await loadAll({ limit: limit });
    setLoading(false);
  }
  useEffect(() => {
    load(limit);
  }, [limit]);
  useEffect(() => {
    if (loading) {
      document.removeEventListener("scroll", menuScrollEvent);
    } else {
      document.addEventListener("scroll", menuScrollEvent, {
        passive: true,
      });
    }
    return () => {
      document.removeEventListener("scroll", menuScrollEvent);
    };
  }, [loading]);
  if (!items) return <Spinner />;
  if (items.length == 0) return <NotFound text="Chưa có đơn hàng nào" />;
  return (
    <div className="">
      {items.map((order, index) => (
        <Billed
          className="billed"
          order={order}
          key={index}
          status={ORDER_STATUS.find((stus) => stus.value === order.status)}
          reOrder={(items, infoPay) => reOrder(items, infoPay)}
        />
      ))}
      {loading && items && limit < pagination.total && (
        <Button
          text="Đang tải..."
          large
          asyncLoading={loading}
          className="btnLoading"
          onClick={() => {}}
        />
      )}
      {/* <Pagination /> */}
    </div>
  );
}
