import formatDistanceToNowStrict from "date-fns/formatDistanceToNow";
import vi from "date-fns/locale/vi";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { NotFound, Scrollbar, Spinner } from "../../../components/shared/utilities/misc";
import { useCrud } from "../../../lib/hooks/useCrud";
import { useOnScreen } from "../../../lib/hooks/useOnScreen";
import { Notification, NotificationService } from "../../../lib/repo/notification.repo";

export function NotificationList({
  onClose,
  isPopoverMode = true,
  shopCode = "",
  onRead,
  ...props
}: {
  onClose: () => any;
  isPopoverMode?: boolean;
  shopCode?: string;
  onRead?: () => any;
} & ReactProps) {
  const router = useRouter();
  const { items, loadMore, pagination, loading, updateItem } = useCrud(NotificationService, {
    limit: 10,
    order: { _id: -1 },
  });
  async function handleClickNotification(notification: Notification) {
    if (!notification.seen) {
      try {
        await NotificationService.readNotification(notification.id);
        updateItem({ id: notification.id, data: { seen: true } });
        onRead();
      } catch (error) {
        console.error(error);
      }
    }
    switch (notification.type) {
      case "WEBSITE": {
        window.open(notification.link, "__blank");
        break;
      }
      case "ORDER": {
        if (shopCode) {
          router.push(`/${shopCode}/order/${notification.order.code}`, null, { shallow: true });
        } else {
          router.push(`/shop/orders?id=${notification.orderId}`, null, { shallow: true });
        }
        break;
      }
      case "SUPPORT_TICKET": {
        router.push(`/shop/ticket?id=${notification.ticketId}`, null, { shallow: true });
        break;
      }
      case "PRODUCT": {
        router.push(`/shop/products?id=${notification.productId}`, null, { shallow: true });
        break;
      }
    }
    onClose();
  }

  const NotificationContent = () => {
    const ref = useRef();
    const onScreen = useOnScreen(ref, "-10px");
    useEffect(() => {
      if (onScreen && items?.length < pagination?.total) {
        loadMore();
      }
    }, [onScreen]);

    return (
      <>
        {items ? (
          items.length > 0 ? (
            <div className="flex flex-col gap-2">
              {items.map((notification) => (
                <a
                  key={notification.id}
                  className={`cursor-pointer p-2 rounded ${notification.seen ? "hover:bg-slate-light" : "bg-blue-50 hover:bg-blue-100"
                    }`}
                  href={notification.link}
                  onClick={() => handleClickNotification(notification)}
                >
                  <div
                    className={`text-base font-medium ${notification.seen ? "" : "text-blue-500"}`}
                  >
                    {notification.title}
                  </div>
                  <div className="text-sm text-gray-600">{notification.body}</div>
                  <div className="text-xs font-medium text-gray-500">
                    {formatDistanceToNowStrict(new Date(notification.createdAt), { locale: vi })}{" "}
                    trước
                  </div>
                </a>
              ))}

              {loading ? (
                <div className="pt-3 font-semibold text-center loading-ellipsis text-primary">
                  Đang tải thêm
                </div>
              ) : (
                <div className="h-2" ref={ref}></div>
              )}
            </div>
          ) : (
            <NotFound text="Không có thông báo" />
          )
        ) : (
          <Spinner />
        )}
      </>
    );
  };

  try {
    return (
      <>
        {isPopoverMode ? (
          <Scrollbar
            className="p-2 pr-3 bg-white"
            height={450}
            style={{ maxHeight: "80vh", width: 320 }}
          >
            <NotificationContent />
          </Scrollbar>
        ) : (
          <NotificationContent />
        )}
      </>
    );
  } catch (err) {
    console.error(err);
    return <NotFound text="Có lỗi xảy ra" />;
  }
}
