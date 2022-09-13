import getConfig from "next/config";
import { Button } from "../../../components/shared/utilities/form";
import { useScreen } from "../../../lib/hooks/useScreen";

const { publicRuntimeConfig } = getConfig();
export function Footer({ className = "" }) {
  const screen2xl = useScreen("xxl");
  return (
    <>
      <footer
        className={`w-full p-2 text-sm flex justify-center items-center border-t border-gray-200 mt-auto ${className}`}
      >
        {screen2xl ? (
          <>{`3M v${publicRuntimeConfig.version} © ${new Date().getFullYear()}`}</>
        ) : (
          <Button
            text={"3M"}
            tooltip={`3M v${publicRuntimeConfig.version} © ${new Date().getFullYear()}`}
            className="flex-center"
          />
        )}
      </footer>
    </>
  );
}
