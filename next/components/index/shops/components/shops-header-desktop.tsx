import Link from "next/link";
import React from "react";
import { Button } from "../../../shared/utilities/form";
import { Img } from "../../../shared/utilities/misc";

type Props = {};

export function ShopsHeaderDesktop({ }: Props) {
  const MENU: {
    label: string;
    onClick?: Function;
    href?: string;
  }[] = [
      // {
      //   href: "/market-place",
      //   label: "Market Place",
      // },
      {
        href: "/3MMarketing/news ", // url demo
        label: "Tin tức",
      },
    ];
  return (
    <div className="fixed top-0 left-0 right-0 bg-primary z-100">
      <div className="flex flex-row items-center justify-between h-18 main-container">
        <Link href="/">
          <a>
            <Img
              src="/assets/img/logo-som-icon.png"
              className="object-cover w-12 rounded-md"
              alt="logo"
            />
          </a>
        </Link>
        <div className="flex flex-row items-center">
          {MENU.map((item, index) => (
            <Button
              text={item.label}
              className="font-medium hover:text-primary"
              href={item.href}
              key={index}
              textWhite
            />
          ))}
          <Button
            text="Đăng ký cửa hàng"
            href="/shop/register"
            onClick={() => { }}
            className="bg-white rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
