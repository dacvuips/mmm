import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

export function Footer({ className, ...props }: ReactProps) {
  return (
    <footer className={`w-full ${className}`}>
      {`3M Tech © 2021  ${
        publicRuntimeConfig?.version ? "Ver" + publicRuntimeConfig?.version : ""
      }`}
    </footer>
  );
}
