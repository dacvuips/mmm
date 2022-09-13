import { DialogProps, Dialog } from "../utilities/dialog/dialog";
import QRCode from "qrcode.react";
import { Button } from "../utilities/form/button";
import React from "react";
import { RiDownload2Line } from "react-icons/ri";

export function QRDialog({ link, name, ...props }: DialogProps & { name: string; link: string }) {
  function download() {
    let canvas: any = document.getElementById(name + "QR");
    if (canvas) {
      let a = document.createElement("a");
      a.href = canvas.toDataURL();
      a.download = name + "-QR.png";
      a.click();
    }
  }
  return (
    <Dialog {...props} slideFromBottom="none">
      <div className="flex flex-col items-center w-full p-3 relative">
        {link && <QRCode value={link} size={300} id={name + "QR"} />}
        <Button
          primary
          className="h-12 absolute -bottom-16 shadow-lg"
          icon={<RiDownload2Line />}
          text="Download"
          onClick={() => download()}
        />
      </div>
    </Dialog>
  );
}
