import copy from "copy-to-clipboard";
import { useToast } from "../providers/toast-provider";
export function useCopy() {
  const toast = useToast();

  return (text: string) => {
    copy(text);
    toast.success("Copy link thành công");
  };
}
