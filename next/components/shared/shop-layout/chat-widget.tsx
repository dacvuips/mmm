import { useRef } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { useChatContext } from "../chat/chat-provider";
import { MessageBox } from "../chat/message-box";
import { MessageInput } from "../chat/message-input";
import { MessageProvider, MessageProviderProps } from "../chat/message-provider";
import { Button } from "../utilities/form/button";
import { Popover } from "../utilities/popover/popover";
type ChatWidgetProps = MessageProviderProps;
export function ChatWidget(props: ChatWidgetProps) {
  const messageRef = useRef();
  const { unseenMessageCount } = useChatContext();

  return (
    <>
      <div
        data-tooltip={props.receiverRole == "MEMBER" ? "Chat với cửa hàng" : "Chat Admin"}
        className="fixed z-50 duration-300 right-4 bottom-4 animate-emerge-up"
        id="chat-widget"
        ref={messageRef}
      >
        <Button
          placement="left"
          icon={<FaRegCommentDots />}
          iconClassName="text-2xl"
          primary
          className="m-2 rounded-full shadow-md h-14 w-14 bg-brand hover:bg-brand-dark"
        >
          {unseenMessageCount > 0 && (
            <div className="absolute w-auto h-4 px-1 font-bold text-white rounded-full animate-emerge left-8 bottom-2 bg-accent min-w-4 flex-center text-[10px]">
              {unseenMessageCount}
            </div>
          )}
        </Button>
      </div>
      <Popover reference={messageRef} trigger="click" placement="top-start">
        <div style={{ margin: "-5px -9px", width: 450 }}>
          <MessageProvider
            // threadId={threadId}
            // senderId={memberId}
            // senderRole="MEMBER"
            // receiverRole="ADMIN"
            {...props}
          >
            <MessageBox height={"calc(60vh - 72px)"} />
            <MessageInput />
          </MessageProvider>
        </div>
      </Popover>
    </>
  );
}
