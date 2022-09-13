import { useEffect } from "react";

let scrollTop = 0;
export function useScrollBlock(
  { rootId, condition }: { rootId?: string; condition: boolean } = {
    rootId: "",
    condition: false,
  }
) {
  useEffect(() => {
    let html = document.querySelector("html");
    let timeout;
    let count = 0;

    if (condition) {
      if (html.classList.contains("scroll-block")) return;
      const checkScroll = () => {
        if (count > 10) return;
        scrollTop = html.scrollTop;
        if (html.scrollHeight > window.innerHeight) {
          html.style.top = `-${scrollTop}px`;
          html.classList.add("scroll-block");
        } else {
          timeout = setTimeout(() => checkScroll(), 300);
        }
        count++;
      };
      checkScroll();
    } else {
      if (rootId && document.getElementById(rootId).childElementCount) return;
      clearTimeout(timeout);
      html.classList.remove("scroll-block");
      html.style.removeProperty("top");
      if (scrollTop) {
        html.scroll(0, scrollTop);
      }
    }
  }, [condition]);
}
