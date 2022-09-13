import React, { createContext, useContext } from "react";
import { RiAlertLine, RiCheckLine, RiCloseLine, RiInformationLine } from "react-icons/ri";
import {
  Slide,
  toast as toastify,
  ToastContainer,
  ToastContent,
  ToastOptions,
} from "react-toastify";

const ToastContext = createContext<{
  default: (content: ToastContent, options?: ToastOptions | undefined) => React.ReactText;
  dark: (content: ToastContent, options?: ToastOptions | undefined) => React.ReactText;
  info: (
    content: ToastContent,
    description?: string,
    options?: ToastOptions | undefined
  ) => React.ReactText;
  success: (
    content: ToastContent,
    description?: string,
    options?: ToastOptions | undefined
  ) => React.ReactText;
  error: (
    content: ToastContent,
    description?: string,
    options?: ToastOptions | undefined
  ) => React.ReactText;
  warn: (
    content: ToastContent,
    description?: string,
    options?: ToastOptions | undefined
  ) => React.ReactText;
}>(null);

export function ToastProvider({ children }: any) {
  const defaultOptions: ToastOptions = {
    autoClose: 2500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    pauseOnFocusLoss: false,
    bodyClassName: "font-medium",
    closeButton: false,
    position: toastify.POSITION.BOTTOM_CENTER,
  };

  const icons = {
    info: <RiInformationLine />,
    success: <RiCheckLine />,
    error: <RiCloseLine />,
    warn: <RiAlertLine />,
  };

  const createToastContent = (
    type: "info" | "success" | "error" | "warn",
    content: ToastContent,
    description?: string
  ) => (
    <div className="flex items-start">
      <i className="mr-1 text-2xl">{icons[type]}</i>
      <div>
        <div className="font-semibold">{content as any}</div>
        {description && <div className="font-medium opacity-90">{description}</div>}
      </div>
    </div>
  );

  const toast = {
    default: (content: ToastContent, options?: ToastOptions) =>
      toastify(content, { ...defaultOptions, ...options }),
    dark: (content: ToastContent, options?: ToastOptions) =>
      toastify.dark(content, { ...defaultOptions, ...options }),
    info: (content: ToastContent, description?: string, options?: ToastOptions) =>
      toastify.info(createToastContent("info", content, description), {
        className: "bg-info",
        ...defaultOptions,
        ...options,
      }),
    success: (content: ToastContent, description?: string, options?: ToastOptions) =>
      toastify.success(createToastContent("success", content, description), {
        className: "bg-success",
        ...defaultOptions,
        ...options,
      }),
    error: (content: ToastContent, description?: string, options?: ToastOptions) =>
      toastify.error(createToastContent("error", content, description), {
        className: "bg-danger",
        ...defaultOptions,
        ...options,
      }),
    warn: (content: ToastContent, description?: string, options?: ToastOptions) =>
      toastify.warn(createToastContent("warn", content, description), {
        className: "bg-warn",
        ...defaultOptions,
        ...options,
      }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer newestOnTop containerId="toast-root" limit={5} transition={Slide} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
