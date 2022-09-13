import { cloneDeep, isEqual } from "lodash";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../lib/providers/toast-provider";
import { Customer } from "../../../lib/repo/customer.repo";
import { Member } from "../../../lib/repo/member.repo";
import { ThreadMessage, ThreadMessageService } from "../../../lib/repo/thread-message.repo";
import { Thread, ThreadRole, ThreadService } from "../../../lib/repo/thread.repo";
import { User } from "../../../lib/repo/user.repo";
import { useChatContext } from "./chat-provider";

export const MessageContext = createContext<
  Partial<{
    threadId: string;
    thread: Thread;
    senderId: string;
    senderRole: ThreadRole;
    receiverRole: ThreadRole;
    sender: User | Customer | Member;
    receiver: User | Customer | Member;
    messages: ThreadMessage[];
    placeholderMessages: ThreadMessage[];
    loadThreadMessages: (loadNew?: boolean) => Promise<any>;
    loadingOlderMessages: boolean;
    total: number;
    latestMessageId: string;
    oldestMessageId: string;
    hasLoadedMessages: boolean;
    createThreadMessage: ({ text: string, attachment: any }) => any;
    onMessagesUnsend: (id: string) => any;
  }>
>({});

export interface MessageProviderProps extends ReactProps {
  threadId: string;
  senderId: string;
  senderRole: ThreadRole;
  receiverRole: ThreadRole;
}
export function MessageProvider({
  threadId,
  senderId,
  senderRole,
  receiverRole,
  ...props
}: MessageProviderProps) {
  const { threadStream } = useChatContext();
  const [thread, setThread] = useState<Thread>();
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>();
  const [placeholderMessages, setPlaceholderMessages] = useState<ThreadMessage[]>([]);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState<string>();
  const [oldestMessageId, setOldestMessageId] = useState<string>();
  const [total, setTotal] = useState<number>(0);
  const limit = 20;
  const toast = useToast();
  const hasLoadedMessages = useMemo(() => !!threadMessages, [threadMessages]);

  useEffect(() => {
    if (threadId) {
      ThreadService.getOne({ id: threadId }).then(setThread);
      loadThreadMessages();
    }
  }, [threadId]);

  const loadThreadMessages = async (loadNew: boolean = false) => {
    const filter = { threadId };
    if (threadMessages?.length) {
      if (loadNew) {
        filter["_id"] = { $gt: threadMessages[0].id };
      } else {
        filter["_id"] = { $lt: threadMessages[threadMessages.length - 1].id };
        setLoadingOlderMessages(true);
      }
    }
    await ThreadMessageService.getAll({
      query: {
        filter,
        limit: loadNew ? 0 : limit,
        order: { _id: -1 },
      },
      cache: false,
    }).then((res) => {
      const data = cloneDeep(res.data);
      if (threadMessages) {
        if (loadNew) {
          const newData = data.filter((x) => !threadMessages.find((y) => y.id == x.id));
          if (newData.length) {
            setThreadMessages([...newData, ...threadMessages]);
            setTotal(total + newData.length);
            setLatestMessageId(newData[0].id);

            newData.forEach((data) => {
              const index = placeholderMessages.findIndex((x) =>
                isEqual(
                  { text: x.text, attachment: x.attachment || null },
                  { text: data.text, attachment: data.attachment || null }
                )
              );
              placeholderMessages.splice(index, 1);
            });
            setPlaceholderMessages([...placeholderMessages]);
          }
        } else {
          if (data.length) {
            setThreadMessages([...threadMessages, ...data]);
            setOldestMessageId(data[data.length - 1].id);
          }
        }
      } else {
        setTotal(res.total);
        setThreadMessages(data);
      }
    });
    setLoadingOlderMessages(false);
  };

  const getActor = (role: ThreadRole) => {
    switch (role) {
      case "ADMIN":
        return thread.user;
      case "MEMBER":
        return thread.member;
      case "CUSTOMER":
        return thread.customer;
    }
  };
  const sender = useMemo(() => {
    if (thread) {
      return getActor(senderRole);
    } else {
      return null;
    }
  }, [thread]);

  const receiver = useMemo(() => {
    if (thread) {
      return getActor(receiverRole);
    } else {
      return null;
    }
  }, [thread]);

  const onMessagesUnsend = (id: string) => {
    const message = threadMessages.find((x) => x.id == id);
    if (message) {
      message.isUnsend = true;
      setThreadMessages([...threadMessages]);
    }
  };

  useEffect(() => {
    if (hasLoadedMessages && threadStream && threadStream.thread?.id == threadId) {
      loadThreadMessages(true);
    }
  }, [threadStream]);

  const [sendingPlaceholderMessages, setSendingPlaceholderMessages] = useState(false);
  const createThreadMessage = ({ text, attachment }) => {
    placeholderMessages.push({ text, attachment: attachment || null, id: "" });
    setPlaceholderMessages([...placeholderMessages]);
  };

  useEffect(() => {
    if (placeholderMessages.length && !sendingPlaceholderMessages) {
      const index = placeholderMessages.findIndex((x) => !x.id);
      if (index === -1) return;

      setSendingPlaceholderMessages(true);
      const { text, attachment } = placeholderMessages[index];
      placeholderMessages[index].id = "sending";

      ThreadMessageService.create({
        data: { text, attachment, type: "general", threadId },
        clearStore: false,
      })
        .then((res) => {})
        .catch((err) => {
          toast.error("Không gửi được tin nhắn.");
        })
        .finally(() => {
          setSendingPlaceholderMessages(false);
        });
    }
  }, [placeholderMessages]);

  const messages = useMemo(() => (threadMessages ? threadMessages.slice().reverse() : null), [
    threadMessages,
  ]);

  return (
    <MessageContext.Provider
      value={{
        threadId,
        thread,
        senderId,
        senderRole,
        receiverRole,
        sender,
        receiver,
        messages,
        placeholderMessages,
        loadThreadMessages,
        loadingOlderMessages,
        total,
        latestMessageId,
        oldestMessageId,
        hasLoadedMessages,
        createThreadMessage,
        onMessagesUnsend,
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
}

export const useMessageContext = () => useContext(MessageContext);
