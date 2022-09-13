import { useRef } from "react";
import { CgSpinner } from "react-icons/cg";
import { RiMore2Fill } from "react-icons/ri";
import { formatDate } from "../../../lib/helpers/parser";
import { useToggle } from "../../../lib/hooks/useToggle";
import { useToast } from "../../../lib/providers/toast-provider";
import { ThreadMessage, ThreadMessageService } from "../../../lib/repo/thread-message.repo";
import { ThreadRole } from "../../../lib/repo/thread.repo";
import { Button } from "../utilities/form";
import { Accordion, Img } from "../utilities/misc";
import { Dropdown } from "../utilities/popover/dropdown";

interface Props extends ReactProps {
  isSender: boolean;
  showDate?: boolean;
  threadMessage: ThreadMessage;
  senderRole?: ThreadRole;
  avatar?: string;
  isPlaceholder?: boolean;
  onUnsend?: () => any;
}
export function MessageItem({
  threadMessage,
  showDate,
  isSender,
  isPlaceholder,
  senderRole,
  avatar,
  onUnsend,
  ...props
}: Props) {
  const [openTime, toggleOpenTime] = useToggle(false);
  const payload = threadMessage.attachment?.payload;
  const ref = useRef();
  const toast = useToast();
  return (
    <div>
      {showDate && (
        <div className="pt-2 pb-1 text-sm font-medium text-center text-gray-600 uppercase">
          {formatDate(threadMessage.createdAt, "EEE, dd/MM/yyyy")}
        </div>
      )}
      <div
        id={threadMessage.id}
        className={`flex items-end gap-2 group ${isSender ? "flex-row-reverse" : ""}`}
      >
        <Img
          lazyload={false}
          className="w-8 mb-1"
          imageClassName="border bg-white"
          src={avatar}
          avatar
          noImage={avatar === undefined}
        >
          {avatar === undefined && isPlaceholder && (
            <i className="absolute bottom-2 right-2 text-primary animate-spin">
              <CgSpinner />
            </i>
          )}
        </Img>
        <div className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}>
          {threadMessage.isUnsend ? (
            <div className="px-3 py-2 text-gray-400 bg-white border-2 border-gray-300 rounded-full">
              Tin nhắn đã bị thu hồi
            </div>
          ) : (
            <>
              {(threadMessage.text || !payload) && (
                <div
                  className={`py-2 px-3 max-w-2xs xs:max-w-xs md:max-w-sm min-h-10 min-w-8 break-words ${
                    isSender ? "rounded-l-xl rounded-r" : "rounded-r-xl rounded-l"
                  } ${payload ? (isSender ? "rounded-br-none" : "rounded-bl-none") : ""} ${
                    isSender ? "bg-primary text-gray-50" : "bg-gray-100"
                  }`}
                  onClick={toggleOpenTime}
                >
                  <div className="font-medium leading-snug whitespace-pre-wrap">
                    {threadMessage.text}
                  </div>
                </div>
              )}
              {payload && (
                <Img
                  src={payload?.url}
                  className={`w-24 rounded-xl border ${
                    threadMessage.text ? (isSender ? "rounded-tr-none" : "rounded-tl-none") : ""
                  }`}
                  compress={100}
                  showImageOnClick
                  lazyload={false}
                  scrollContainer={`#thread-${threadMessage.threadId}`}
                />
              )}
            </>
          )}
        </div>

        {isSender && senderRole !== "CUSTOMER" && onUnsend && (
          <>
            <Button
              className="w-8 h-8 px-0 mb-1 rounded-full opacity-0 hover:bg-gray-100 group-hover:opacity-100"
              icon={<RiMore2Fill />}
              innerRef={ref}
            />
            <Dropdown reference={ref}>
              <Dropdown.Item
                text={"Thu hồi tin nhắn"}
                onClick={async () => {
                  try {
                    await ThreadMessageService.unsendMessage(threadMessage.id);
                    onUnsend();
                    toast.success("Thu hồi tin nhắn thành công");
                  } catch (err) {
                    console.error(err);
                    toast.error("Thu hồi tin nhắn thất bại. " + err.message);
                  }
                }}
              />
            </Dropdown>
          </>
        )}
      </div>
      {threadMessage.createdAt && (
        <Accordion className={`${openTime ? "animate-emerge" : ""}`} isOpen={openTime}>
          <div
            className={`text-xs text-gray-500 font-medium pt-0.5 ${
              isSender ? "pr-11 text-right" : "pl-11"
            }`}
          >
            {formatDate(threadMessage.createdAt, "dd/MM/yyyy HH:mm")}
          </div>
        </Accordion>
      )}
    </div>
  );
}
