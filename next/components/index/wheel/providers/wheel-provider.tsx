import { createContext, useContext, useEffect, useState } from "react";
import { LuckyWheelService, Gift } from "../../../../lib/repo/lucky-wheel.repo";
import { useWheelsContext } from "../../wheels/providers/wheels-provider";
import { useToast } from "../../../../lib/providers/toast-provider";

export const WheelContext = createContext<
  Partial<{
    startWheel: Function;
    showGift: any;
    setShowGift: Function;
    playLuckyWheel: Function;
    gift: any;
    loading: boolean;
  }>
>({});
interface PropsType extends ReactProps {
  code: string;
}
export function WheelProvider({ code, ...props }: PropsType) {
  const [showGift, setShowGift] = useState(false);
  const { luckyWheel } = useWheelsContext();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  let [gift, setGift] = useState<Gift>();
  let interval = null;
  let timeOut = null;
  async function playLuckyWheel() {
    setLoading(true);
    LuckyWheelService.playLuckyWheel(luckyWheel.id)
      .then((res) => {
        gift = res.gift;
        setGift(gift);
        startWheel();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Bắt đầu vòng quay thất bại. " + err.message.replace("GraphQL error: ", ""));
        setGift(null);
        setLoading(false);
      });
  }

  async function startWheel() {
    let wheel = document.getElementById("wheel") as HTMLImageElement;
    let giftNumber = luckyWheel.gifts.length;

    let totalRounds = 0;
    let totalDegrees = 0;
    let targetDegrees = -1;

    wheel.style.transition = "none";
    wheel.style.transform = "rotate(0deg)";
    wheel.style.transition = "transform 0.3s linear";

    interval = setInterval(() => {
      if (gift && totalRounds > 6) {
        let giftIndex = luckyWheel.gifts.findIndex((x) => x.id == gift.id);

        let degrees = 360 / giftNumber;
        let minDeg = giftIndex * degrees + 5;
        let maxDeg = giftIndex * degrees + degrees - 5;
        targetDegrees = Math.floor(Math.random() * (maxDeg - minDeg) + minDeg);

        wheel.style.transition = "transform 4.5s cubic-bezier(0.39, 0.575, 0.565, 1)";
        let rounds = Math.floor(Math.random() * (12 - 9) + 9);
        totalDegrees += rounds * 360 + targetDegrees;
        clearInterval(interval);
        timeOut = setTimeout(() => {
          if (gift !== undefined) {
            setTimeout(() => {
              setLoading(false);
              setShowGift(true);
            }, 2000);
          }
        }, 3000);
      } else {
        totalDegrees += 360;
        totalRounds++;
      }
      wheel.style.transform = "rotate(" + totalDegrees + "deg)";
    }, 300);
  }

  return (
    <WheelContext.Provider
      value={{ startWheel, showGift, setShowGift, playLuckyWheel, gift, loading }}
    >
      {props.children}
    </WheelContext.Provider>
  );
}

export const useWheelContext = () => useContext(WheelContext);
