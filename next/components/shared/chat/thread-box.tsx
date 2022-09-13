import { FaInbox } from "react-icons/fa";
import { MessageBox } from "../../shared/chat/message-box";
import { MessageInput } from "../../shared/chat/message-input";
import { MessageProvider } from "../../shared/chat/message-provider";
import { NotFound } from "../../shared/utilities/misc";
import { useThreadContext } from "./thread-provider";
import { ThreadInfo } from "./thread-info";
import { useAuth } from "../../../lib/providers/auth-provider";

export function ThreadBox({ height }: { height: number | string }) {
  const { selectedThread, senderId, senderRole, receiverRole } = useThreadContext();
  const { user, staff, staffPermission, adminPermission } = useAuth();
  const hasExecutePermission = staffPermission("EXECUTE_CLIENT_CHAT");
  const hasExecutePermissionAdmin = adminPermission("EXECUTE_CHAT");

  if (selectedThread === undefined)
    return <NotFound className="py-40" text="Hãy chọn một hộp thư" icon={<FaInbox />} />;
  return (
    <>
      {selectedThread ? (
        <MessageProvider
          threadId={selectedThread.id}
          senderId={senderId}
          senderRole={senderRole}
          receiverRole={receiverRole}
        >
          <div className="flex-1 h-full">
            <MessageBox height={height} />
            <MessageInput executeDisabled={user ? !hasExecutePermissionAdmin : staff ? !hasExecutePermission : false} />
          </div>
          <ThreadInfo executeDisabled={user ? !hasExecutePermissionAdmin : staff ? !hasExecutePermission : false} />
        </MessageProvider>
      ) : (
        <></>
      )}
    </>
  );
}
