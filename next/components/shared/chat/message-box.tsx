import isSameDay from "date-fns/isSameDay";
import { useEffect, useRef, useState } from "react";
import Scrollbars from "react-custom-scrollbars";
import { CgSpinner } from "react-icons/cg";
import { FaArrowDown, FaInbox } from "react-icons/fa";
import { useOnScreen } from "../../../lib/hooks/useOnScreen";
import { Button } from "../utilities/form";
import { NotFound, Spinner } from "../utilities/misc";
import { useChatContext } from "./chat-provider";
import { MessageItem } from "./message-item";
import { useMessageContext } from "./message-provider";

interface Props extends ReactProps {
  id?: string;
  height: number | string;
}
export function MessageBox({ id, className = "", height, ...props }: Props) {
  const {
    threadId,
    messages,
    placeholderMessages,
    loadThreadMessages,
    loadingOlderMessages,
    total,
    senderId,
    sender,
    receiver,
    senderRole,
    latestMessageId,
    hasLoadedMessages,
    onMessagesUnsend,
  } = useMessageContext();
  const { onThreadSeen } = useChatContext();
  const [scrollingMode, setScrollingMode] = useState(false);
  let [scrollPosition, setScrollPosition] = useState<{
    scrollTop: number;
    scrollHeight: number;
  }>();
  const scrollbarRef = useRef<Scrollbars>();

  const scrollToBottom = (smooth?: boolean) => {
    (scrollbarRef.current as any).view.scroll({
      top: scrollbarRef.current.getScrollHeight(),
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    if (placeholderMessages.length) {
      scrollToBottom(true);
    }
  }, [placeholderMessages]);

  useEffect(() => {
    if (scrollPosition) {
      const scrollHeight = scrollbarRef.current.getScrollHeight();
      scrollbarRef.current.scrollTop(
        scrollPosition.scrollTop + scrollHeight - scrollPosition.scrollHeight
      );
      setScrollPosition(null);
    }
  }, [messages]);

  useEffect(() => {
    if (loadingOlderMessages) {
      const scrollTop = scrollbarRef.current.getScrollTop();
      const scrollHeight = scrollbarRef.current.getScrollHeight();
      setScrollPosition({
        scrollTop,
        scrollHeight,
      });
    }
  }, [loadingOlderMessages]);

  const ref = useRef();
  const onScreen = useOnScreen(ref);

  useEffect(() => {
    if (hasLoadedMessages) {
      scrollToBottom(false);
      if (onScreen) {
        onScroll();
        const lastMessage = messages[messages.length - 1];
        const lastMessageSenderId =
          lastMessage?.sender?.memberId ||
          lastMessage?.sender?.customerId ||
          lastMessage?.sender?.userId;
        if (lastMessageSenderId != senderId) {
          onThreadSeen(threadId);
        }
      }
    }
  }, [onScreen, hasLoadedMessages]);

  useEffect(() => {
    setScrollPosition(null);
  }, [threadId]);

  useEffect(() => {
    if (latestMessageId && !scrollingMode) {
      scrollToBottom(true);
    }
  }, [latestMessageId]);

  const onScroll = () => {
    const scrollTop = scrollbarRef.current.getScrollTop();
    const scrollHeight = scrollbarRef.current.getScrollHeight();
    const clientHeight = scrollbarRef.current.getClientHeight();
    setScrollingMode(scrollHeight - clientHeight - scrollTop > clientHeight);

    //load more
    if (scrollTop < 50 && messages && messages.length < total && !loadingOlderMessages) {
      loadThreadMessages();
    }

    if (loadingOlderMessages) {
      setScrollPosition({
        scrollTop,
        scrollHeight,
      });
    }
  };
  const senderAvatar = sender?.shopLogo || sender?.avatar || "";
  const receiverAvatar = receiver?.shopLogo || receiver?.avatar || "";

  return (
    <div className="relative flex flex-col items-center" ref={ref}>
      {loadingOlderMessages && (
        <div className="absolute text-sm text-gray-400 transform -translate-x-1/2 bg-white border rounded-full shadow-lg w-7 h-7 flex-center z-100 left-1/2 top-3">
          <i className="animate-spin">
            <CgSpinner />
          </i>
        </div>
      )}
      <Scrollbars
        id={`thread-${threadId}`}
        ref={scrollbarRef}
        style={{ height }}
        onScroll={onScroll}
      >
        {messages ? (
          <div className="relative flex flex-col max-w-full gap-1 p-3">
            {messages.map((item, index) => {
              const isSender =
                senderId ==
                (senderRole == "ADMIN"
                  ? item.sender.user?.id
                  : senderRole == "MEMBER"
                  ? item.sender.member?.id
                  : item.sender.customer?.id);
              const showAvatar =
                index == messages.length - 1 || messages[index + 1].sender.role != item.sender.role;
              const showDate =
                index == 0 ||
                !isSameDay(new Date(messages[index - 1].createdAt), new Date(item.createdAt));
              return (
                <MessageItem
                  key={item.id + index}
                  isSender={isSender}
                  avatar={showAvatar ? (isSender ? senderAvatar : receiverAvatar) : undefined}
                  showDate={showDate}
                  senderRole={senderRole}
                  threadMessage={item}
                  onUnsend={() => {
                    onMessagesUnsend(item.id);
                  }}
                />
              );
            })}
            {placeholderMessages.map((item, index) => {
              return <MessageItem key={index} isSender={true} isPlaceholder threadMessage={item} />;
            })}
            {!messages.length && !placeholderMessages.length && (
              <NotFound text="Chưa có tin nhắn" icon={<FaInbox />} />
            )}
          </div>
        ) : (
          <Spinner />
        )}
      </Scrollbars>
      {scrollingMode && (
        <Button
          small
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
          hoverWhite
          className="absolute rounded-full shadow bottom-3 z-100 animate-emerge-up text-gray-50"
          icon={<FaArrowDown />}
          onClick={() => {
            scrollToBottom(true);
          }}
        />
      )}
    </div>
  );
}
