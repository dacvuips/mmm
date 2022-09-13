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
                  tooltip={"Trang chủ"}
                  href={`/${shopCode}`}
                />
                <h2 className="flex-1 text-lg font-semibold text-center">Thông tin CTV</h2>
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
                    <span className="font-medium">Cộng tác viên</span>
                    <span className="ml-auto mr-0 font-semibold">{customer.name}</span>
                  </div>
                  <div className="flex items-center h-12 font-light ">
                    <span className="font-medium">Hoa hồng nhận được</span>
                    <span className="ml-auto mr-0 font-semibold">
                      {parseNumber(collaborator?.commissionSummary?.commission || 0, true)}
                    </span>
                  </div>
                  <div className="flex items-center h-12 font-light">
                    <span className="font-medium">Trạng thái hoạt động</span>
                    <span className="ml-auto mr-0 font-semibold ">
                      {(collaborator.collaborator?.status == "PENDING" && "Đang chờ duyệt") ||
                        (collaborator.collaborator?.status == "ACTIVE" && "Đang hoạt động") ||
                        "Đang tạm khóa"}
                    </span>
                  </div>
                  {/* <div className="flex items-center h-12 font-light">
                    <span className="font-medium">Ví MoMo</span>
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
                          text={"Gửi yêu cầu kết nối Ví MoMo"}
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
    toast.success("Đã sao chép", null, { position: "top-center" });
  }

  const [showQRcode, setShowQRcode] = useState(false);
  const [showShareType, setShowShareType] = useState(false);
  const screenSm = useScreen("sm");
  return (
    <div className="py-4 border-t border-dashed">
      <span className="font-medium">Link giới thiệu:</span>
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
            tooltip="Sao chép"
            onClick={() => copyToClipboard(link)}
          />
          <Button
            href={{ pathname: "https://www.facebook.com/sharer/sharer.php", query: { u: link } }}
            className="flex-1 text-white hover:text-white"
            icon={<FbIcon />}
            iconPosition="end"
            style={{ backgroundColor: "#4267b2" }}
            iconClassName="w-6 h-6 "
            tooltip="Chia sẻ lên facebook"
          />
          <Button
            href={{ pathname: "https://telegram.me/share/url", query: { url: link } }}
            className="flex-1 text-white hover:text-white"
            icon={<TgIcon />}
            iconPosition="end"
            style={{ backgroundColor: "#37AFE2" }}
            iconClassName="w-6 h-6 "
            tooltip="Chia sẻ lên telegram"
          />
          <Button
            href={{ pathname: "viber://forward", query: { text: link } }}
            className="flex-1 text-white hover:text-white"
            icon={<IconViber />}
            iconPosition="end"
            style={{ backgroundColor: "#59267c" }}
            iconClassName="w-6 h-6 "
            tooltip="Chia sẻ lên viber"
          />
          <Button
            icon={<QRIcon />}
            outline
            className="flex-1"
            iconPosition="end"
            tooltip="Xem mã QR"
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
      label: "Lịch sử hoa hồng",
      onclick: () => setShowSelected(1),
    },
    {
      label: "Danh sách giới thiệu",
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
        text={"Gọi chủ shop"}
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
        title={`Lịch sử hoa hồng (${collaborator.commissionSummary.order})`}
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
      title="Gửi yêu cầu kết nối ví MoMo"
      onSubmit={async (data) => {
        try {
          await submitCustomerMomoWallet(data);
          toast.success(
            "Đã gửi yêu cầu kết nối ví MoMo. Hệ thống sẽ duyệt yêu cầu của bạn nếu thông tin gửi chính xác."
          );
          props.onClose();
        } catch (err) {
          console.error(err.message);
          toast.error("Gửi yêu cầu kết nối thất bại. " + err.message);
        }
      }}
      {...props}
    >
      <Field
        label="Số điện thoại"
        description="*Số điện thoại này cần phải kết nối với một ví MoMo"
      >
        <Input value={collaborator?.phone} readOnly />
      </Field>
      <Field name="name" label="Họ tên" required>
        <Input />
      </Field>
      <Field name="idCard" label="Chứng minh nhân dân" required>
        <Input />
      </Field>
      <Form.Footer
        className="justify-center"
        cancelText=""
        submitText="Đăng ký kết nối Ví MoMo"
        submitProps={{ large: true }}
      />
    </Form>
  );
}
