import Link from "next/link";
import router from "next/router";
import { useRef } from "react";
import { FaHeadphonesAlt, FaRegComments } from "react-icons/fa";
import { RiLogoutBoxRLine, RiUser3Fill } from "react-icons/ri";
import { useChatContext } from "../../../components/shared/chat/chat-provider";
import { Button } from "../../../components/shared/utilities/form/button";
import { Img } from "../../../components/shared/utilities/misc";
import { Dropdown } from "../../../components/shared/utilities/popover/dropdown";
import { useAuth } from "../../../lib/providers/auth-provider";

interface PropsType extends ReactProps { }
export function Header({ ...props }: PropsType) {
  const userRef = useRef();
  const notificationRef = useRef();
  const { user, logoutUser } = useAuth();
  const { unseenThreadCount } = useChatContext();
  const isChatPage = router.pathname.startsWith("/admin/chat");
  const isTicketPage = router.pathname.startsWith("/admin/ticket");

  return (
    <>
      <div className="fixed top-0 left-0 z-50 flex items-center w-full bg-white shadow h-14">
        <Link href="/">
          <a className="flex items-center h-full px-6 py-3 text-xl font-bold uppercase text-primary">
            <img className="object-contain w-auto h-full" src="/assets/img/logo-som.png" />
            <div className="ml-4">3M Marketing</div>
          </a>
        </Link>
        <div className="flex items-center ml-auto mr-4">
          <Button
            icon={<FaRegComments />}
            iconClassName="text-xl"
            tooltip="Live Chat"
            href="/admin/chat"
            className={`h-14 rounded-none ${isChatPage ? "" : "hover:bg-gray-100"}`}
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
            href="/admin/ticket"
            className={`h-14 rounded-none ${isTicketPage ? "" : "hover:bg-gray-100"}`}
            primary={isTicketPage}
          />
          {/* <Button
            icon={<RiNotification3Line />}
            iconClassName="text-xl"
            tooltip="Thông báo"
            className="rounded-none h-14 hover:bg-gray-100"
            innerRef={notificationRef}
          /> */}
        </div>
        {/* <Popover placement="bottom" reference={notificationRef}>
          <div className="flex flex-wrap p-8 items">Thông báo</div>
        </Popover> */}
        {user && (
          <div
            className="flex items-center pl-4 pr-8 border-l border-gray-100 cursor-pointer group "
            ref={userRef}
          >
            <Img compress={80} avatar className="w-8" src={user.profilePicture} alt="avatar" />
            <div className="pl-2 whitespace-nowrap">
              <div className="mb-1 font-semibold leading-4 text-gray-700 group-hover:text-primary">
                {user.name}
              </div>
              <div className="text-sm leading-3 text-gray-600 group-hover:text-primary">
                {user.email}
              </div>
            </div>
          </div>
        )}

        <Dropdown reference={userRef}>
          {/* <Dropdown.Item
            icon={<RiUser3Fill />}
            text="Hồ sơ"
            href={{ pathname: "/admin/manager/users/" + user.id }}
          /> */}
          <Dropdown.Divider />
          <Dropdown.Item
            hoverDanger
            icon={<RiLogoutBoxRLine />}
            text="Đăng xuất"
            onClick={logoutUser}
          />
        </Dropdown>
      </div>
    </>
  );
}
