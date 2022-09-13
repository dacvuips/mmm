import { Billed } from "./component/billed";
import { OrderProvider, useOrderContext } from "./providers/order-provider";
import { Spinner, NotFound } from "../../shared/utilities/misc";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { useCart } from "../../../lib/providers/cart-provider";
import { ORDER_STATUS } from "../../../lib/repo/order.repo";
import { useEffect, useState } from "react";
import { Button } from "../../shared/utilities/form/button";
import { BreadCrumbs } from "../../shared/utilities/misc";

export function OrderPage() {
  const { shopCode } = useShopContext();
  return (
    <OrderProvider>
      <div className="relative w-full min-h-screen bg-white">
        <BreadCrumbs
          breadcrumbs={[
            { label: "Trang chủ", href: `/${shopCode}` },
            { label: "Lịch sử đơn hàng" },
          ]}
          className="py-4 pl-4"
        />
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
  function isInViewport(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    return (
      rect.top > 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
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
    <div className="border-t-2 bg-gray-light">
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
