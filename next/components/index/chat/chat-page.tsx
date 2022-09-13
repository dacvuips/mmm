import { useRouter } from "next/router";
import { useEffect } from "react";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { MessageBox } from "../../shared/chat/message-box";
import { MessageInput } from "../../shared/chat/message-input";
import { MessageProvider } from "../../shared/chat/message-provider";
import { Spinner } from "../../shared/utilities/misc";

export function ChatPage({ ...props }: ReactProps) {
  const { customer, shopCode } = useShopContext();
  const router = useRouter();

  useEffect(() => {
    if (customer === null) {
      router.push(`/${shopCode}`);
    }
  }, [customer]);

  if (!customer) return <Spinner />;
  return (
    <div className="bg-white">
      <MessageProvider
        threadId={customer.thread.id}
        senderId={customer.id}
        senderRole="CUSTOMER"
        receiverRole="MEMBER"
      >
        <MessageBox height={"calc(100vh - 130px)"} />
        <MessageInput />
      </MessageProvider>
    </div>
  );
}
