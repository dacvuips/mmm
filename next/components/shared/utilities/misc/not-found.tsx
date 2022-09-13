import { useTranslation } from "next-i18next";

interface PropsType extends ReactProps {
  icon?: JSX.Element;
  color?: string;
  text?: string;
}
export function NotFound({ icon, text, className = "", color = "text-gray-500", ...props }: PropsType) {
  const { t } = useTranslation();
  return (
    <div className={`flex-col w-full py-12 font-semibold text-center flex-center col-span-full ${color} ${className}`}>
      {icon && <i className="mb-2 text-2xl">{icon}</i>}
      <span>{text || t("Không tìm thấy")}</span>
      {props.children}
    </div>
  );
}
