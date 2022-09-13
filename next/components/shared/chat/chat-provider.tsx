import { createContext, useContext, useEffect, useState } from "react";
import { ThreadMessage, ThreadMessageService } from "../../../lib/repo/thread-message.repo";
import { Thread, ThreadRole, ThreadService } from "../../../lib/repo/thread.repo";
export const ChatContext = createContext<
  Partial<{
    threadStream: {
      thread: Thread;
      message: ThreadMessage;
    };
    unseenMessageCount: number;
    unseenThreadCount: number;
    unseenThreads: Partial<Thread>[];
    onThreadSeen: (threadId: string) => any;
  }>
>({});
interface Props extends ReactProps {
  threadId?: string;
  senderRole: ThreadRole;
  senderId: string;
}
export function ChatProvider({ senderRole, threadId, senderId, ...props }: Props) {
  const threadStream = ThreadService.subscribeThread(!!senderId);
  // count the unseen messages with one higher-up entity
  const [unseenMessageCount, setUnseenMessageCount] = useState<number>(0);
  // count the unseen threads with multiple clients
  const [unseenThreads, setUnseenThreads] = useState<Partial<Thread>[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    if (senderId) {
      if (senderRole != "ADMIN") {
        ThreadMessageService.getAll({
          query: { limit: 0, filter: { threadId, seen: false } },
          fragment: "id",
        }).then((res) => {
          if (isSubscribed) {
            setUnseenMessageCount(res.total);
          }
        });
      }
      if (senderRole != "CUSTOMER") {
        ThreadService.getAll({
          query: {
            limit: 0,
            filter: {
              ...(senderRole == "ADMIN" ? { userId: senderId } : { memberId: senderId }),
              seen: false,
            },
          },
          fragment: "id",
        }).then((res) => {
          if (isSubscribed) {
            setUnseenThreads([...res.data]);
          }
        });
      }
    }
    return () => {
      isSubscribed = false;
    };
  }, [senderId]);

  useEffect(() => {
    if (threadStream) {
      if (threadStream.thread.id == threadId) {
        if (
          (senderRole == "MEMBER" && threadStream.message.sender.memberId != senderId) ||
          (senderRole == "CUSTOMER" && threadStream.message.sender.customerId != senderId)
        ) {
          setUnseenMessageCount(unseenMessageCount + 1);
        }
      } else {
        if (
          (senderRole == "MEMBER" && threadStream.message.sender.memberId != senderId) ||
          (senderRole == "ADMIN" && threadStream.message.sender.userId != senderId)
        ) {
          let index = unseenThreads.findIndex((x) => x.id == threadStream.thread.id);
          if (index >= 0) {
            unseenThreads.splice(index, 1);
          }
          setUnseenThreads([...unseenThreads, { ...threadStream.thread }]);
        }
      }
    }
  }, [threadStream]);

  const onThreadSeen = (seenThreadId: string) => {
    if (seenThreadId == threadId) {
      if (unseenMessageCount > 0) {
        ThreadService.markThreadSeen(threadId).then(() => {
          setUnseenMessageCount(0);
        });
      }
    } else {
      const index = unseenThreads.findIndex((x) => x.id == seenThreadId);
      if (index >= 0) {
        ThreadService.markThreadSeen(seenThreadId).then(() => {
          unseenThreads.splice(index, 1);
          setUnseenThreads([...unseenThreads]);
        });
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        threadStream,
        unseenMessageCount,
        unseenThreads,
        unseenThreadCount: unseenThreads.length,
        onThreadSeen,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => useContext(ChatContext);
