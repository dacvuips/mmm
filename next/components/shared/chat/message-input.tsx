import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { HiPlus } from "react-icons/hi";
import { RiCloseLine } from "react-icons/ri";
import { useOnScreen } from "../../../lib/hooks/useOnScreen";
import { Button } from "../../shared/utilities/form/button";
import { Img } from "../../shared/utilities/misc";
import { AvatarUploader } from "../../shared/utilities/uploader/avatar-uploader";
import { useChatContext } from "./chat-provider";
import { useMessageContext } from "./message-provider";

export function MessageInput({ executeDisabled }: { executeDisabled?: boolean }) {
  const [text, setText] = useState<string>("");
  const [attachment, setAttachment] = useState<any>();
  const { onThreadSeen } = useChatContext();
  const { createThreadMessage, threadId, messages, senderId } = useMessageContext();

  const imgRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);
  const ref = useRef<HTMLTextAreaElement>();
  const onScreen = useOnScreen(ref);

  useEffect(() => {
    if (onScreen) {
      ref.current.style.height = "0px";
      ref.current.style.height =
        (ref.current.scrollHeight > 24 ? ref.current.scrollHeight : 24) + "px";
    }
  }, [text, onScreen]);

  const send = () => {
    if (!text.trim() && !attachment) return;
    createThreadMessage({ text: text.trim(), attachment });
    setText("");
    setAttachment(null);
  };

  return (
    <div className="sticky bottom-0 p-2 border-t border-gray-100 bg-gray-50 h-18 z-100">
      <div className="absolute left-0 right-0 mx-2 items-center flex border border-gray-200 shadow bottom-1.5 rounded-3xl bg-white">
        <div className="p-2 rounded-inherit">
          {attachment?.payload?.url ? (
            <Img
              src={attachment?.payload?.url}
              className="w-10 group rounded-2xl"
              compress={50}
              showImageOnClick
            >
              <Button
                className="absolute w-6 h-6 px-0 bg-white border border-gray-300 rounded-full -top-3 -left-3"
                icon={<RiCloseLine />}
                hoverDanger
                onClick={() => setAttachment(null)}
              ></Button>
            </Img>
          ) : (
            <Button
              disabled={executeDisabled}
              gray
              icon={<HiPlus />}
              iconClassName="text-2xl"
              className="w-10 h-10 rounded-2xl"
              onClick={() => {
                imgRef.current().onClick();
              }}
              isLoading={imageUploading}
            />
          )}
          <AvatarUploader
            onRef={(ref) => {
              imgRef.current = ref;
            }}
            onUploadingChange={setImageUploading}
            onImageUploaded={(val) => setAttachment({ type: "image", payload: { url: val } })}
          />
        </div>
        <textarea
          disabled={executeDisabled}
          rows={1}
          ref={ref}
          style={{ minHeight: 24, maxHeight: 24 * 4 }}
          placeholder="Nhập tin nhắn..."
          value={text}
          className="flex-1 h-full px-2 py-3 leading-snug border-none shadow-none outline-none resize-none no-scrollbar"
          onChange={(e) => setText(e.target.value)}
          onFocus={() => {
            const lastMessage = messages[messages.length - 1];
            const lastMessageSenderId =
              lastMessage?.sender?.memberId ||
              lastMessage?.sender?.customerId ||
              lastMessage?.sender?.userId;
            if (lastMessageSenderId != senderId) {
              onThreadSeen(threadId);
            }
          }}
          onKeyPress={(e) => {
            if (e.code == "Enter" && !e.shiftKey) {
              send();
              e.preventDefault();
            }
          }}
        />
        <div className="p-2">
          {/* <Button
            icon={<FaSyncAlt />}
            iconClassName="text-xl"
            hoverWhite
            className="w-10 h-10 rounded-2xl bg-primary-light text-primary hover:bg-primary"
            onClick={() => loadThreadMessages(true)}
          ></Button> */}
          <Button
            icon={<FiSend />}
            iconClassName="text-xl"
            hoverWhite
            className="w-10 h-10 rounded-2xl bg-primary-light text-primary hover:bg-primary"
            onClick={send}
            disabled={executeDisabled}
          ></Button>
        </div>
      </div>
    </div>
  );
}
