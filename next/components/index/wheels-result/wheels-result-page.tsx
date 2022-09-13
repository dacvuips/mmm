import { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { formatDate } from "../../../lib/helpers/parser";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { LuckyWheelResult } from "../../../lib/repo/lucky-wheel-result.repo";
import { Button } from "../../shared/utilities/form/button";
import { Img, NotFound, Spinner } from "../../shared/utilities/misc";
import { useWheelsResultContext, WheelsResultProvider } from "./providers/wheels-result-provider";

export function WheelsResultPage() {
  const { shopCode } = useShopContext();
  const screenLg = useScreen("lg");
  return (
    <WheelsResultProvider>
      <div className={`${screenLg ? "main-container" : ""} relative w-full min-h-screen bg-white`}>
        {/* <div className="flex items-center w-full p-4">
          <Button
            icon={<FaChevronLeft />}
            iconClassName="text-xl text-gray-400"
            className="w-10 pl-0"
            tooltip={"Trang chủ"}
            href={`/${shopCode}`}
          />
          <h2 className="flex-1 text-lg font-medium text-center">Kết quả vòng quay</h2>
          <div className="w-10"></div>
        </div> */}
        <ListWheel />
      </div>
    </WheelsResultProvider>
  );
}

function ListWheel() {
  const { items, pagination, setLimit, limit, loadAll } = useWheelsResultContext();
  const [loading, setLoading] = useState(false);
  const [curPos, setCurPos] = useState(null);
  function menuScrollEvent() {
    let scrollCheckInterval = null;
    let billeds = document.getElementsByClassName("wheel-result");
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
  if (items.length == 0) return <NotFound text="Chưa lịch sử nhận quà" />;
  return (
    <div className="flex flex-col px-4">
      {items.map((wheelrs: LuckyWheelResult, index) => (
        <WheelResult
          wheelrs={wheelrs}
          key={index}
          className={`wheel-result ${index < items.length - 1 ? "border-b" : ""}`}
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
    </div>
  );
}
function WheelResult({ wheelrs, ...props }: ReactProps & { wheelrs: LuckyWheelResult }) {
  let startDate = new Date(wheelrs.createdAt);
  let endDate = new Date(
    startDate.getTime() + (wheelrs.gift?.voucherExpiredDay || 0) * 24 * 60 * 60 * 1000
  );

  return (
    <div
      className={`py-3 flex ${!wheelrs.gift.isLose && !wheelrs.voucher ? "hidden" : ""} ${
        props.className || ""
      }`}
    >
      <Img src={wheelrs.gift.image || "https://i.imgur.com/8RlEqh6.png"} className="w-20" contain />
      <div className="flex flex-col justify-between flex-1 pl-3">
        <span className="text-lg font-medium text-ellipsis-2">{wheelrs.gift.name}</span>
        {wheelrs.voucher ? (
          <span className="text-sm">
            <span className="font-semibold">Mã khuyến mãi: </span>
            {wheelrs.voucher.code}
          </span>
        ) : (
          ""
        )}
        <span className="flex flex-wrap w-full">
          <span className="text-sm">Ngày nhận: {formatDate(startDate, "dd-MM-yyyy HH:mm")}</span>{" "}
          {wheelrs.gift?.voucherExpiredDay && (
            <span className="text-sm sm:mr-0 sm:ml-auto">
              Hết hạn: {formatDate(endDate, "dd-MM-yyyy HH:mm")}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
