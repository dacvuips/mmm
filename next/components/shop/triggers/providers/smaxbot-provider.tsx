import { createContext, useContext, useEffect, useState } from "react";
import { useScript } from "../../../../lib/hooks/useScript";
import { useToast } from "../../../../lib/providers/toast-provider";
export const SmaxbotContext = createContext<{
  openSmaxbot?: (botId?: string, blockId?: string) => Promise<SmaxbotBlock>;
}>({});
export interface SmaxbotBlock {
  block_id: string;
  block_name: string;
  bot_id: string;
  bot_name: string;
  bot_picture: string;
  bot_token: string;
  page_id: number;
  page_name: string;
  page_picture: string;
}
export function SmaxbotProvider(props) {
  const status = useScript("https://smax.bot/sdk.min.js");
  const smaxBot = (window as any)?.SB;
  const toast = useToast();

  const openSmaxbot = async (botId?: string, blockId?: string) => {
    if (status == "ready") {
      const res = await new Promise<SmaxbotBlock>((resolve, reject) => {
        smaxBot.open({ botId, blockId }, (err, data) => {
          if (data) {
            resolve(data);
          } else {
            resolve(null);
          }
        });
      });
      return res;
    } else {
      toast.warn("Không thể kết nối Smaxbot. Vui lòng thử refresh lại trang và kết nối lại.");
      return null;
    }
  };
  return (
    <SmaxbotContext.Provider value={{ openSmaxbot }}>{props.children}</SmaxbotContext.Provider>
  );
}

export const useSmaxbotContext = () => useContext(SmaxbotContext);
