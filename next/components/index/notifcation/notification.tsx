import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiCheck } from "react-icons/hi";
import { NotificationList } from "../../../layouts/shop-layout/components/notification-list";
import { formatDate } from "../../../lib/helpers/parser";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { NotificationService } from "../../../lib/repo/notification.repo";
import { ProductService } from "../../../lib/repo/product.repo";
import { PageHeader } from "../../shared/default-layout/page-header";
import { Button } from "../../shared/utilities/form/button";
import { Img, NotFound, Spinner } from "../../shared/utilities/misc";

export function NotificationPage() {
  const { shopCode, loadNotificationCount, notificationCount } = useShopContext();
  const [loading, setLoading] = useState(false);

  return (
    <div className={`relative min-h-screen bg-white`}>
      {/* <PageHeader title="Thông báo">
        <Button
          gray
          small
          icon={<HiCheck />}
          text={"Đã đọc hết"}
          disabled={notificationCount === 0}
          onClick={async () => {
            try {
              setLoading(true);
              await NotificationService.readAllNotification();
              await loadNotificationCount();
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
        />
      </PageHeader> */}
      <div className="flex justify-end items-end px-2 py-3">
        <Button
          gray
          small
          icon={<HiCheck />}
          text={"Đã đọc hết"}
          disabled={notificationCount === 0}
          onClick={async () => {
            try {
              setLoading(true);
              await NotificationService.readAllNotification();
              await loadNotificationCount();
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
      <div className="px-2 py-2">
        {loading ? (
          <Spinner />
        ) : (
          <NotificationList
            shopCode={shopCode}
            isPopoverMode={false}
            onClose={() => {}}
            onRead={() => {
              loadNotificationCount();
            }}
          />
        )}
      </div>
    </div>
  );
}

// function ItemNotification(props) {
//   const [color, setColor] = useState("");
//   const { shopCode, shop } = useShopContext();
//   const { readNotification } = useNotificationContext();
//   const router = useRouter();
//   useEffect(() => {
//     switch (props.item?.order?.status) {
//       case "PENDING":
//         setColor("text-warning");
//         break;
//       case "CONFIRMED":
//         setColor("text-info");
//         break;
//       case "DELIVERING":
//         setColor("text-info");
//         break;
//       case "COMPLETED":
//         setColor("text-success");
//         break;
//       case "FAILURE":
//         setColor("text-danger");
//         break;
//       case "CANCELED":
//         setColor("text-danger");
//         break;
//     }
//   }, [props.item]);
//   return (
//     <div
//       className={`border-l-8 border-primary cursor-pointer relative ${
//         !props.item.seen && "bg-gray-50"
//       } my-3`}
//       onClick={async () => {
//         readNotification(props.item.id);
//         switch (props.item.type) {
//           case "ORDER":
//             const link = `/${shopCode}/order/${props.item.order?.code}`;
//             router.push(link);
//             break;
//           case "PRODUCT":
//             const product = await ProductService.getOne({
//               id: props.item.product?.id,
//               fragment: "id code",
//             });
//             router.push(`/${shopCode}/?product=${product?.code}`);
//             break;
//           case "WEBSITE":
//             router.push(props.item.link);
//             break;
//         }
//       }}
//     >
//       <div className="flex items-center">
//         <Img src={props.item.image || shop.shopLogo} className="sm:w-20" />
//         <div className="p-4">
//           <div className="flex flex-wrap items-center">
//             <div className="font-semibold">{props.item.title}</div>
//             <div className="ml-2 text-sm text-gray-500">
//               {formatDate(props.item.createdAt, "HH:mm - dd/MM/yyy")}
//             </div>
//           </div>
//           <div className={`${color}`}>{props.item.body}</div>
//         </div>
//       </div>
//       <i className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2">
//         <FaChevronRight />
//       </i>
//     </div>
//   );
// }
