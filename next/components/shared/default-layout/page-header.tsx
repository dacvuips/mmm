import { FaArrowLeft } from "react-icons/fa";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { Button } from "../utilities/form";

interface Props extends ReactProps {
  title: string;
}
export function PageHeader({ title, ...props }: Props) {
  const { shopCode } = useShopContext();

  return (
    <div className="flex items-center w-full p-2 pb-0">
      <Button
        icon={<FaArrowLeft />}
        iconClassName="text-lg text-gray-500"
        className="w-10 px-0"
        tooltip={"Trang chủ"}
        href={`/${shopCode}`}
      />
      <div className="flex-1 text-lg font-semibold text-center text-gray-700">{title}</div>
      {props.children || <div className="w-10"></div>}
    </div>
  );
}
