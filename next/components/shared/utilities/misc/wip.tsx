import { NotFound } from "./not-found";
import { IoHourglassOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
export function WIP() {
  const { t } = useTranslation();
  return <NotFound icon={<IoHourglassOutline />} text={t("Tính năng đang được hoàn thiện.")} />;
}
