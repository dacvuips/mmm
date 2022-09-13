import QRCode from "qrcode.react";
import React, { useState } from "react";
import { RiHome3Line, RiLock2Line, RiMailLine, RiPhoneLine } from "react-icons/ri";

import { validateKeyword } from "../../../lib/constants/validate-keyword";
import { useCopy } from "../../../lib/hooks/useCopy";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { ShopBranchService } from "../../../lib/repo/shop-branch.repo";
import { Staff, STAFF_SCOPES, StaffService } from "../../../lib/repo/staff.repo";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Dialog, DialogProps } from "../../shared/utilities/dialog/dialog";
import { Button } from "../../shared/utilities/form";
import { Field } from "../../shared/utilities/form/field";
import { Form } from "../../shared/utilities/form/form";
import { ImageInput } from "../../shared/utilities/form/image-input";
import { Input } from "../../shared/utilities/form/input";
import { Select } from "../../shared/utilities/form/select";
import { DataTable } from "../../shared/utilities/table/data-table";

export function StaffsPage(props: ReactProps) {
  const [openUpdateStaffPassword, setOpenUpdateStaffPassword] = useState<Staff>(null);
  const { member, staffPermission } = useAuth();
  const toast = useToast();
  const hasWritePermission = staffPermission("WRITE_STAFFS");
  const [linkQrDialog, setLinkQrDialog] = useState("");

  const appStoreLink =
    "https://apps.apple.com/vn/app/som-kinh-doanh-tinh-g%E1%BB%8Dn/id1577028537?l=vi";
  const chPlayLink = "https://play.google.com/store/apps/details?id=mcom.app.shop3m";

  return (
    <>
      <DataTable<Staff> crudService={StaffService} order={{ createdAt: -1 }}>
        <DataTable.Header>
          <ShopPageTitle title="Nhân viên" subtitle="Nhân viên hệ thống" />
          <DataTable.Buttons>
            <DataTable.Button
              outline
              isRefreshButton
              refreshAfterTask
              className="w-12 h-12 bg-white"
            />
            <DataTable.Button
              primary
              isCreateButton
              className="h-12"
              disabled={!hasWritePermission}
            />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search className="h-12" />
          <DataTable.Filter></DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4 bg-white">
          <DataTable.Column
            label="Nhân viên"
            render={(item: Staff) => <DataTable.CellText avatar={item.avatar} value={item.name} />}
          />
          <DataTable.Column
            label="Tên đăng nhập"
            render={(item: Staff) => (
              <DataTable.CellText
                value={item.username}
                className="font-semibold"
                subText={item.scopes
                  .map((x) => STAFF_SCOPES.find((y) => y.value == x)?.label)
                  .filter(Boolean)
                  .join(", ")}
              />
            )}
          />
          <DataTable.Column
            label="Liên hệ"
            render={(item: Staff) => (
              <DataTable.CellText
                value={
                  <>
                    {item.email && (
                      <div className="flex">
                        <i className="mt-1 mr-1 text-lg">
                          <RiMailLine />
                        </i>
                        {item.email}
                      </div>
                    )}
                    {item.phone && (
                      <div className="flex">
                        <i className="mt-1 mr-1 text-lg">
                          <RiPhoneLine />
                        </i>
                        {item.phone}
                      </div>
                    )}
                    {item.address && (
                      <div className="flex">
                        <i className="mt-1 mr-1 text-lg">
                          <RiHome3Line />
                        </i>
                        {item.address}
                      </div>
                    )}
                  </>
                }
              />
            )}
          />
          <DataTable.Column
            center
            label="Trực thuộc"
            render={(item: Staff) => (
              <DataTable.CellText value={item.branch?.name || "Cửa hàng đã bị xóa"} />
            )}
          />
          <DataTable.Column
            right
            render={(item: Staff) => (
              <>
                <DataTable.CellButton
                  value={item}
                  icon={<RiLock2Line />}
                  tooltip="Đổi mật khẩu"
                  onClick={() => {
                    setOpenUpdateStaffPassword(item);
                  }}
                  disabled={!hasWritePermission}
                />
                <DataTable.CellButton value={item} isUpdateButton />
                <DataTable.CellButton
                  hoverDanger
                  value={item}
                  isDeleteButton
                  disabled={!hasWritePermission}
                />
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Form
          width={700}
          extraDialogClass="bg-transparent"
          extraHeaderClass="bg-gray-100 text-xl py-3 justify-center rounded-t-xl border-gray-300 pl-16"
          extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
          footerProps={{
            className: "justify-center",
            submitProps: { className: "h-14 w-64", disabled: !hasWritePermission },
            cancelText: "",
          }}
          grid
        >
          <DataTable.Consumer>
            {({ formItem }) => (
              <>
                <Field
                  name="username"
                  label="Tên đăng nhập"
                  cols={formItem?.id ? 12 : 6}
                  required
                  validation={{ usernameValid: (val) => validateKeyword(val) }}
                >
                  <Input />
                </Field>
                {!formItem?.id && (
                  <Field name="password" label="Mật khẩu" cols={6} required>
                    <Input type="password" />
                  </Field>
                )}
                <Field
                  name="name"
                  label="Tên nhân viên"
                  cols={12}
                  required
                  validation={{ nameValid: (val) => validateKeyword(val) }}
                >
                  <Input />
                </Field>

                <Field name="branchId" label="Cửa hàng trực thuộc" cols={12} required>
                  <Select optionsPromise={() => ShopBranchService.getAllOptionsPromise()} />
                </Field>
                <Field label="Mã cửa hàng" cols={12} readOnly>
                  <Input value={member.code} />
                </Field>
                <Field name="phone" label="Số điện thoại" cols={6}>
                  <Input />
                </Field>
                <Field name="email" label="Email" cols={6}>
                  <Input />
                </Field>
                <Field name="address" label="Địa chỉ" cols={6}>
                  <Input />
                </Field>
                <Field name="avatar" label="Avatar" cols={12}>
                  <ImageInput avatar />
                </Field>
                <Field name="scopes" label="Quyền hạn" cols={12} required>
                  <Select multi options={STAFF_SCOPES} />
                </Field>
              </>
            )}
          </DataTable.Consumer>
        </DataTable.Form>
        <DataTable.Pagination />
        <DataTable.Divider />
        <div>
          <div className="flex items-center gap-4 my-4">
            <div
              onClick={() => {
                setLinkQrDialog(appStoreLink);
              }}
              className="cursor-pointer"
            >
              <img src="/assets/img/appstore.png" className="object-contain mb-3 w-44"></img>
            </div>
            <div
              onClick={() => {
                setLinkQrDialog(chPlayLink);
              }}
              className="cursor-pointer"
            >
              <img src="/assets/img/googleplay.png" className="object-contain mb-3 w-44"></img>
            </div>
          </div>
          <div className="flex items-center gap-3"></div>
        </div>
      </DataTable>
      <QrDetailDialog
        isOpen={!!linkQrDialog}
        onClose={() => {
          setLinkQrDialog("");
        }}
        linkQr={linkQrDialog}
      />
      <Form
        dialog
        width={350}
        title="Đổi mật khẩu nhân viên"
        isOpen={!!openUpdateStaffPassword}
        onClose={() => setOpenUpdateStaffPassword(null)}
        onSubmit={async (data) => {
          await StaffService.updateStaffPassword(openUpdateStaffPassword.id, data.password)
            .then((res) => {
              toast.success("Đổi mật khẩu nhân viên thành công");
              setOpenUpdateStaffPassword(null);
            })
            .catch((err) => {
              toast.error("Đổi mật khẩu nhân viên thất bại. " + err.message);
            });
        }}
      >
        <Field label="Tên nhân viên" readOnly>
          <Input value={openUpdateStaffPassword?.name} />
        </Field>
        <Field name="password" label="Mật khẩu mới" required>
          <Input type="password" />
        </Field>
        <Field
          name="retypePassword"
          label="Nhập lại mật khẩu mới"
          required
          validation={{
            password: (value, data) =>
              value != data.password ? "Mật khẩu nhập lại không đúng" : "",
          }}
        >
          <Input type="password" />
        </Field>
        <Form.Footer submitText="Đổi mật khẩu" />
      </Form>
    </>
  );
}

function QrDetailDialog({ linkQr, ...props }: { linkQr: string } & DialogProps) {
  const copy = useCopy();
  return (
    <Dialog
      {...props}
      title="QR Code"
      maxWidth={350}
      extraHeaderClass="bg-gray-100"
      extraBodyClass="px-6 bg-gray-100 rounded-b-xl"
    >
      <Dialog.Body>
        <div className="flex flex-col items-center justify-center gap-4 my-4">
          <QRCode value={linkQr} size={200} />
          <Button
            text={linkQr}
            onClick={() => {
              copy(linkQr);
            }}
            className="text-sm font-medium text-ellipsis-2"
            tooltip="Copy link"
          />
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
