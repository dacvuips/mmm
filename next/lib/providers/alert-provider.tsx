import { createContext, useContext, useState } from "react";
import { AlertDialog } from "../../components/shared/utilities/dialog/alert-dialog";

const AlertContext = createContext<
  Partial<{
    info: (title: string, content?: string, confirm?: string, cancel?: string) => Promise<boolean>;
    success: (
      title: string,
      content?: string,
      confirm?: string,
      cancel?: string
    ) => Promise<boolean>;
    error: (title: string, content?: string, confirm?: string, cancel?: string) => Promise<boolean>;
    warn: (
      title: string,
      content?: string,
      confirm?: string,
      confirmFn?: (() => Promise<boolean>) | (() => boolean),
      cancel?: string
    ) => Promise<boolean>;
    question: (
      title: string,
      content?: string,
      confirm?: string,
      confirmFn?: (() => Promise<boolean>) | (() => boolean),
      cancel?: string
    ) => Promise<boolean>;
    danger: (
      title: string,
      content?: string,
      confirm?: string,
      confirmFn?: (() => Promise<boolean>) | (() => boolean),
      cancel?: string
    ) => Promise<boolean>;
  }>
>(null);

let interval = null;
const intervalDelay = 100;
let confirmed = undefined;
let confirmFn = null;
export function AlertProvider({ children }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"success" | "error" | "info" | "warn" | "question" | "danger">();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [confirm, setConfirm] = useState("");
  const [cancel, setCancel] = useState("");

  const alert = {
    info: (title: string, content: string = "", confirm?: string, cancel?: string) => {
      openAlert("info", title, content, confirm, () => { }, cancel);
      return new Promise<boolean>(alertPromise);
    },
    success: (title: string, content: string = "", confirm?: string, cancel?: string) => {
      openAlert("success", title, content, confirm, () => { }, cancel);
      return new Promise<boolean>(alertPromise);
    },
    error: (title: string, content: string = "", confirm?: string, cancel?: string) => {
      openAlert("error", title, content, confirm, () => { }, cancel);
      return new Promise<boolean>(alertPromise);
    },
    warn: (
      title: string,
      content: string = "",
      confirm?: string,
      confirmFn?: (() => Promise<boolean>) | (() => boolean),
      cancel?: string
    ) => {
      openAlert("warn", title, content, confirm, confirmFn, cancel);
      return new Promise<boolean>(alertPromise);
    },
    question: (
      title: string,
      content: string = "",
      confirm?: string,
      confirmFn?: (() => Promise<boolean>) | (() => boolean),
      cancel?: string
    ) => {
      openAlert("question", title, content, confirm, confirmFn, cancel);
      return new Promise<boolean>(alertPromise);
    },
    danger: (
      title: string,
      content: string = "",
      confirm?: string,
      confirmFn?: (() => Promise<boolean>) | (() => boolean),
      cancel?: string
    ) => {
      openAlert("danger", title, content, confirm, confirmFn, cancel);
      return new Promise<boolean>(alertPromise);
    },
  };

  const alertPromise = (resolve) => {
    interval = setInterval(() => {
      if (confirmed !== undefined) {
        clearInterval(interval);
        resolve(confirmed);
        confirmed = undefined;
      }
    }, intervalDelay);
  };

  const openAlert = (
    type: any,
    title: string,
    content: string,
    confirm?: string,
    confirmFnParam?: Function,
    cancel?: string
  ) => {
    confirmFn = confirmFnParam || null;
    clearInterval(interval);
    setTitle(title);
    setContent(content);
    setConfirm(confirm);
    setCancel(cancel);
    setType(type);
    setIsOpen(true);
  };

  const onConfirm = async () => {
    confirmed = true;
    if (confirmFn) {
      let res = await confirmFn();
      if (type == "info" || type == "success" || type == "error") {
        setIsOpen(false);
      } else {
        if (res) setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const onClose = () => {
    confirmed = false;
    setIsOpen(false);
  };

  return (
    <AlertContext.Provider value={alert}>
      {children}
      <AlertDialog
        type={type}
        title={title}
        content={content}
        confirm={confirm}
        cancel={cancel}
        isOpen={isOpen}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
