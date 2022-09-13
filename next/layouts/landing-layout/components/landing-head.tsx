import Head from "next/head";
import React from "react";
export function LandingHead() {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, maximum-scale=1.0, user-scalable=0"
        />
        <link rel="icon" type="image/png" href={"/favicon.ico"} />
        <link href="/assets/fonts/Lato Bold.ttf" rel="preload" as="font" crossOrigin="" />
        <link href="/assets/fonts/Lato Light.ttf" rel="preload" as="font" crossOrigin="" />
        <link href="/assets/fonts/Lato Medium.ttf" rel="preload" as="font" crossOrigin="" />
        <link href="/assets/fonts/Lato Regular.ttf" rel="preload" as="font" crossOrigin="" />
        <link href="/assets/fonts/Lato Semibold.ttf" rel="preload" as="font" crossOrigin="" />
        <link rel="stylesheet" href={`/api/setting/theme/"DEFAULT"}`}></link>
      </Head>
    </>
  );
}
