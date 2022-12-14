import React, { useState, useEffect } from "react";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { Button } from "../../../shared/utilities/form/button";
import { useToast } from "../../../../lib/providers/toast-provider";
import { FaChevronRight, FaRegCopy, FaShareAlt, FaChevronLeft, FaPhone } from "react-icons/fa";
import { FbIcon, TgIcon, QRIcon, IconViber } from "../../../../public/assets/svg/svg";
import { AiOutlineClose } from "react-icons/ai";
import QRCode from "qrcode.react";
import { Dialog } from "../../../shared/utilities/dialog/dialog";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { HistoryDialog } from "../history/history-dialog";
import { RecommendedDialog } from "../recommended/recommended-dialog";
import {
  CollaboratorProvider,
  CollaboratorContext,
  useCollaboratorContext,
} from "../providers/collaborator-provider";
import { Spinner, Img } from "../../../shared/utilities/misc";
import copy from "copy-to-clipboard";
import { useRouter } from "next/router";
import { parseNumber } from "../../../../lib/helpers/parser";
import { StatusLabel } from "../../../shared/utilities/misc/status-label";
import { CUSTOMER_MOMO_WALLET_STATUS } from "../../../../lib/repo/customer.repo";
import { Field, Form, FormProps, Input } from "../../../shared/utilities/form";

export function InfoPage() {
  const { shopCode, customer, shop } = useShopContext();
  const [openSubmitMoMoWallet, setOpenSubmitMoMoWallet] = useState(false);
  const router = useRouter();
  const screenLg = useScreen("lg");
  useEffect(() => {
    if (!shop.config.collaborator) {
      router.replace(`/${shopCode}`);
    }
    if (customer && !customer.isCollaborator) router.replace(`/${shopCode}/collaborator/register`);
  }, [customer, shop]);
  if (!customer) return <Spinner />;
  return (
    <CollaboratorProvider>
      <CollaboratorContext.Consumer>
        {({ collaborator }) =>
          collaborator ? (
            <div
              className={`${screenLg ? "main-container" : ""
                } relative w-full min-h-screen bg-gray-50 rounded-md shadow`}
            >
              {/* <div className="flex items-center w-full p-4 py-1">
                <Button
                  icon={<FaChevronLeft />}
                  iconClassName="text-xl text-gray-400"
                  className="w-10 pl-0"
                  tooltip={"Trang ch???"}
                  href={`/${shopCode}`}
                />
                <h2 className="flex-1 text-lg font-semibold text-center">Th??ng tin CTV</h2>
                <div className="w-10"></div>
              </div> */}
              <div className="p-4">
                <Img
                  src="/assets/img/img-ctv.png"
                  className={`${screenLg ? "w-52" : "w-1/2"} mx-auto`}
                  contain
                />

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center h-12 font-light ">
                    <span className="font-medium">C???ng t??c vi??n</span>
                    <span className="ml-auto mr-0 font-semibold">{customer.name}</span>
                  </div>
                  <div className="flex items-center h-12 font-light ">
                    <span className="font-medium">Hoa h???ng nh???n ???????c</span>
                    <span className="ml-auto mr-0 font-semibold">
                      {parseNumber(collaborator?.commissionSummary?.commission || 0, true)}
                    </span>
                  </div>
                  <div className="flex items-center h-12 font-light">
                    <span className="font-medium">Tr???ng th??i ho???t ?????ng</span>
                    <span className="ml-auto mr-0 font-semibold ">
                      {(collaborator.collaborator?.status == "PENDING" && "??ang ch??? duy???t") ||
                        (collaborator.collaborator?.status == "ACTIVE" && "??ang ho???t ?????ng") ||
                        "??ang t???m kh??a"}
                    </span>
                  </div>
                  {/* <div className="flex items-center h-12 font-light">
                    <span className="font-medium">V?? MoMo</span>
                    <span className="ml-auto mr-0 ">
                      <StatusLabel
                        type="light"
                        options={CUSTOMER_MOMO_WALLET_STATUS}
                        value={collaborator.momoWallet?.status}
                      />
                    </span>
                  </div>
                  <div className="border-b border-dashed">
                    {collaborator.momoWallet?.status != "valid" && (
                      <>
                        <Button
                          text={"G???i y??u c???u k???t n???i V?? MoMo"}
                          primary
                          className="w-full mt-1 mb-3 bg-pink hover:bg-pink-dark"
                          onClick={() => setOpenSubmitMoMoWallet(true)}
                        />
                        <SubmitMoMoWalletForm
                          isOpen={openSubmitMoMoWallet}
                          onClose={() => setOpenSubmitMoMoWallet(false)}
                        />
                      </>
                    )}
                  </div> */}
                  <Share link={collaborator?.collaborator?.shortUrl} />
                  <MenuCollaborator />
                </div>
              </div>
            </div>
          ) : (
            <Spinner />
          )
        }
      </CollaboratorContext.Consumer>
    </CollaboratorProvider>
  );
}
function Share({ link, ...props }: { link: string }) {
  const toast = useToast();
  function copyToClipboard(text) {
    copy(text);
    toast.success("???? sao ch??p", null, { position: "top-center" });
  }

  const [showQRcode, setShowQRcode] = useState(false);
  const [showShareType, setShowShareType] = useState(false);
  const screenSm = useScreen("sm");
  return (
    <div className="py-4 border-t border-dashed">
      <span className="font-medium">Link gi???i thi???u:</span>
      <div className="flex w-full mt-1 mb-4 border-b border-dashed rounded-md min-h-12">
        <span className="flex-1 my-auto text-sm font-light sm:text-base">{link}</span>
        {showShareType ? (
          <Button
            icon={<AiOutlineClose />}
            className="w-10 h-12 pl-2 pr-0 ml-auto mr-0"
            iconClassName="text-28"
            onClick={() => setShowShareType(false)}
          />
        ) : (
          <Button
            icon={<FaShareAlt />}
            className="w-10 h-12 pl-2 pr-0 ml-auto mr-0"
            iconClassName="text-28"
            onClick={() => setShowShareType(true)}
          />
        )}
      </div>
      {showShareType == true && (
        <div className="flex rounded-md border-group animate-scale-up">
          <Button
            icon={<FaRegCopy />}
            outline
            className="flex-1"
            iconClassName="text-28"
            tooltip="Sao ch??p"
            onClick={() => copyToClipboard(link)}
          />
          <Button
            href={{ pathname: "https://www.facebook.com/sharer/sharer.php", query: { u: link } }}
            className="flex-1 text-white hover:text-white"
            icon={<FbIcon />}
            iconPosition="end"
            style={{ backgroundColor: "#4267b2" }}
            iconClassName="w-6 h-6 "
            tooltip="Chia s??? l??n facebook"
          />
          <Button
            href={{ pathname: "https://telegram.me/share/url", query: { url: link } }}
            className="flex-1 text-white hover:text-white"
            icon={<TgIcon />}
            iconPosition="end"
            style={{ backgroundColor: "#37AFE2" }}
            iconClassName="w-6 h-6 "
            tooltip="Chia s??? l??n telegram"
          />
          <Button
            href={{ pathname: "viber://forward", query: { text: link } }}
            className="flex-1 text-white hover:text-white"
            icon={<IconViber />}
            iconPosition="end"
            style={{ backgroundColor: "#59267c" }}
            iconClassName="w-6 h-6 "
            tooltip="Chia s??? l??n viber"
          />
          <Button
            icon={<QRIcon />}
            outline
            className="flex-1"
            iconPosition="end"
            tooltip="Xem m?? QR"
            iconClassName="w-6 h-6"
            onClick={() => setShowQRcode(!showQRcode)}
          />
        </div>
      )}
      <Dialog isOpen={showQRcode} onClose={() => setShowQRcode(false)} slideFromBottom="none">
        <div className="flex flex-col items-center w-full p-3">
          <QRCode value={link} size={screenSm ? 300 : 230} />
        </div>
      </Dialog>
    </div>
  );
}
function MenuCollaborator() {
  const { shopCode, customer, shop } = useShopContext();
  const { collaborator } = useCollaboratorContext();
  const [showSelected, setShowSelected] = useState(0);
  const screenSm = useScreen("sm");
  const menu = [
    {
      label: "L???ch s??? hoa h???ng",
      onclick: () => setShowSelected(1),
    },
    {
      label: "Danh s??ch gi???i thi???u",
      onclick: () => setShowSelected(2),
    },
  ];
  return (
    <div className="flex flex-col px-0 lg:px-4 ">
      {menu.map((item) => (
        <Button
          key={item.label}
          text={item.label}
          onClick={item.onclick}
          icon={<FaChevronRight />}
          iconPosition="end"
          className="justify-between h-12 px-0 font-medium "
        />
      ))}
      {/* <Button
        text={"G???i ch??? shop"}
        primary
        className="mx-auto my-5 rounded-full"
        href={`tel:${shop.phone}`}
        small={!screenSm}
        icon={<FaPhone />}
      /> */}
      <HistoryDialog
        isOpen={showSelected === 1}
        onClose={() => setShowSelected(0)}
        // slideFromBottom="all"
        // mobileSizeMode
        title={`L???ch s??? hoa h???ng (${collaborator.commissionSummary.order})`}
      />
      <RecommendedDialog
        isOpen={showSelected === 2}
        onClose={() => setShowSelected(0)}
      // slideFromBottom="all"
      // mobileSizeMode
      />
    </div>
  );
}

function SubmitMoMoWalletForm({ ...props }: FormProps) {
  const { collaborator, submitCustomerMomoWallet } = useCollaboratorContext();
  const toast = useToast();

  return (
    <Form
      dialog
      slideFromBottom="all"
      defaultValues={{ name: collaborator?.name, idCard: "" }}
      mobileSizeMode
      title="G???i y??u c???u k???t n???i v?? MoMo"
      onSubmit={async (data) => {
        try {
          await submitCustomerMomoWallet(data);
          toast.success(
            "???? g???i y??u c???u k???t n???i v?? MoMo. H??? th???ng s??? duy???t y??u c???u c???a b???n n???u th??ng tin g???i ch??nh x??c."
          );
          props.onClose();
        } catch (err) {
          console.error(err.message);
          toast.error("G???i y??u c???u k???t n???i th???t b???i. " + err.message);
        }
      }}
      {...props}
    >
      <Field
        label="S??? ??i???n tho???i"
        description="*S??? ??i???n tho???i n??y c???n ph???i k???t n???i v???i m???t v?? MoMo"
      >
        <Input value={collaborator?.phone} readOnly />
      </Field>
      <Field name="name" label="H??? t??n" required>
        <Input />
      </Field>
      <Field name="idCard" label="Ch???ng minh nh??n d??n" required>
        <Input />
      </Field>
      <Form.Footer
        className="justify-center"
        cancelText=""
        submitText="????ng k?? k???t n???i V?? MoMo"
        submitProps={{ large: true }}
      />
    </Form>
  );
}
