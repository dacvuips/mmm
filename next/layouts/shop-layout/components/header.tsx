import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { FaHeadphonesAlt, FaRegCalendarCheck, FaRegComments } from "react-icons/fa";
import { HiCheck } from "react-icons/hi";
import {
  RiBillLine,
  RiNotification2Line,
  RiNotification3Line,
  RiStore2Line,
  RiWallet3Line,
} from "react-icons/ri";
import { useChatContext } from "../../../components/shared/chat/chat-provider";
import { Button } from "../../../components/shared/utilities/form";
import { Img, Spinner } from "../../../components/shared/utilities/misc";
import { Popover } from "../../../components/shared/utilities/popover/popover";
import { SetMemberToken } from "../../../lib/graphql/auth.link";
import { parseNumber } from "../../../lib/helpers/parser";
import { useAuth } from "../../../lib/providers/auth-provider";
import { MemberService } from "../../../lib/repo/member.repo";
import { NotificationService } from "../../../lib/repo/notification.repo";
import { STAFF_SCOPES } from "../../../lib/repo/staff.repo";
import { useShopLayoutContext } from "../providers/shop-layout-provider";
import { NotificationList } from "./notification-list";

interface PropsType extends ReactProps { }
export function Header({ ...props }: PropsType) {
  const notificationRef = useRef();
  const { staff, member, logoutMember } = useAuth();
  const { unseenThreadCount } = useChatContext();
  const { notificationCount, loadNotificationCount, ticketCount } = useShopLayoutContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isChatPage = router.pathname.startsWith("/shop/chat");
  const isTicketPage = router.pathname.startsWith("/shop/ticket");
  console.log("ticket", ticketCount);

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center w-full p-2 bg-white shadow h-18">
        <Img className="w-12 border border-gray-200 rounded-full" src={member.shopLogo} />
        <div className="pl-2">
          <div className="mt-1 font-semibold text-gray-700">{member.shopName}</div>
          <Button
            className="h-auto px-0 text-sm font-medium underline hover:underline"
            textPrimary
            targetBlank
            icon={<RiStore2Line />}
            iconClassName="pb-0.5"
            text="Xem cửa hàng của tôi"
            href={location.origin + "/" + member.code}
          />
        </div>
        <div className="flex items-center gap-0.5 ml-auto">
          <Button
            icon={<RiBillLine />}
            iconClassName="text-xl"
            tooltip="Order tại quầy"
            href={`/shop/pos`}
            targetBlank
            className={`h-14 hover:bg-gray-100`}
          />
          <Button
            icon={<FaRegComments />}
            iconClassName="text-xl"
            tooltip="Live Chat"
            href="/shop/chat"
            className={`h-14 ${isChatPage ? "" : "hover:bg-gray-100"}`}
            primary={isChatPage}
          >
            {unseenThreadCount > 0 && (
              <div className="absolute w-auto h-4 px-1 font-bold text-white rounded-full animate-emerge left-8 bottom-2 bg-accent min-w-4 flex-center text-[10px]">
                {unseenThreadCount}
              </div>
            )}
          </Button>
          <Button
            icon={<FaHeadphonesAlt />}
            iconClassName="text-xl"
            tooltip="Hỗ trợ"
            href="/shop/ticket"
            className={`h-14 ${isTicketPage ? "" : "hover:bg-gray-100"}`}
            primary={isTicketPage}
          >
            {ticketCount > 0 && (
              <div className="absolute w-auto h-4 px-1 font-bold text-white rounded-full animate-emerge left-8 bottom-2 bg-accent min-w-4 flex-center text-[10px]">
                {ticketCount}
              </div>
            )}

          </Button>
          <Button
            icon={<RiNotification3Line />}
            iconClassName="text-xl"
            tooltip="Thông báo"
            className={`h-14 hover:bg-gray-100`}
            innerRef={notificationRef}
          >
            {notificationCount > 0 && (
              <div className="absolute w-auto h-4 px-1 font-bold text-white rounded-full animate-emerge left-8 bottom-2 bg-accent min-w-4 flex-center text-[10px]">
                {notificationCount}
              </div>
            )}
          </Button>
          <a
            href="/shop/wallet"
            className="px-3 py-2 transition-all border border-transparent rounded cursor-pointer bg-gray-50 hover:border-yellow-500 whitespace-nowrap min-w-28"
          >
            <div className="text-xs font-medium">Ví tiền</div>
            <div className="flex items-center text-yellow-500">
              <i className="mr-1">
                <RiWallet3Line />
              </i>
              <div className="text-sm font-semibold">{parseNumber(member.wallet.balance)}đ</div>
            </div>
          </a>
        </div>
        <Popover reference={notificationRef} trigger="click" placement="bottom-end" noPadding>
          <div className="flex items-center justify-between pt-3 pb-2 pl-3 bg-gray-100 border-b">
            <div className="font-bold uppercase">Thông báo</div>
            <Button
              className="h-auto text-sm"
              iconClassName="mb-0.5"
              icon={<HiCheck />}
              text="Đã đọc hết"
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
          {loading ? (
            <Spinner
              style={{
                height: 450,
              }}
              className="py-0"
            />
          ) : (
            <NotificationList
              onClose={() => (notificationRef.current as any)?._tippy.hide()}
              onRead={() => {
                loadNotificationCount();
              }}
            />
          )}
        </Popover>
        {member && (
          <Button
            className="h-12 px-6 ml-3 border-l border-gray-200 rounded-none"
            text={
              <div>
                <div className="text-xs font-normal">
                  {staff?.name || member?.name}{" "}
                  {staff
                    ? `[${staff.scopes
                      .map((x) => STAFF_SCOPES.find((y) => y.value == x)?.label)
                      .filter(Boolean)
                      .join(", ")}]`
                    : "[Chủ shop]"}
                </div>
                <div className="text-sm mt-0.5">Đăng xuất</div>
              </div>
            }
            hoverDanger
            onClick={logoutMember}
          />
        )}
      </div>
    </>
  );
}
