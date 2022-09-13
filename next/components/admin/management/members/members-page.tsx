import formatDistanceToNow from "date-fns/formatDistanceToNow";
import vi from "date-fns/locale/vi";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { GiPayMoney } from "react-icons/gi";
import { HiX } from "react-icons/hi";
import {
  RiCurrencyLine,
  RiExchangeDollarLine,
  RiFileAddLine,
  RiLock2Line,
  RiLoginBoxLine,
  RiMoneyDollarBoxLine,
  RiMoneyDollarCircleLine,
  RiWallet3Line,
} from "react-icons/ri";

import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { SetMemberToken } from "../../../../lib/graphql/auth.link";
import { formatDate, parseNumber } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { AddressService } from "../../../../lib/repo/address.repo";
import { MemberGroup, MemberGroupService } from "../../../../lib/repo/member-group.repo";
import { Member, MemberService } from "../../../../lib/repo/member.repo";
import { ShopCategoryService } from "../../../../lib/repo/shop-category.repo";
import { SUBSCRIPTION_PLANS } from "../../../../lib/repo/shop-subscription.repo";
import {
  MEMBER_WALLET_TRANS_LABEL_OPTIONS,
  WALLET_TRANSACTION_TYPE_OPTIONS,
  WalletTransaction,
  WalletTransactionService,
} from "../../../../lib/repo/wallet-transaction.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button } from "../../../shared/utilities/form";
import { Field } from "../../../shared/utilities/form/field";
import { Form } from "../../../shared/utilities/form/form";
import { ImageInput } from "../../../shared/utilities/form/image-input";
import { Input } from "../../../shared/utilities/form/input";
import { Select } from "../../../shared/utilities/form/select";
import { Switch } from "../../../shared/utilities/form/switch";
import { List } from "../../../shared/utilities/list";
import { Card, StatusLabel } from "../../../shared/utilities/misc";
import { TabButtons } from "../../../shared/utilities/tab/tab-buttons";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { ExportMemberDialog } from "./components/export-member-dialog";
import { ExtendSubscriptionFormDialog } from "./components/extend-shop-subscription-dialog";
import { SubscriptionsDialog } from "./components/subscriptions-dialog";
import { WalletTransactionDialog } from "./components/wallet-transaction-dialog";

export const SUBSCRIPTION_STATUS_OPTIONS: Option[] = [
  { value: "active", label: "Đang hoạt động", color: "success" },
  { value: "warning", label: "Sắp hết hạn", color: "warning" },
  { value: "expired", label: "Đã hết hạn", color: "danger" },
];

export function MembersPage() {
  const [openChangePasswordMember, setOpenChangePasswordMember] = useState<Member>(null);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState<Member>();
  const [openWalletTransactionDialog, setOpenWalletTransactionDialog] = useState<Member>();
  const [openTopupMember, setOpenTopupMember] = useState<Member>();
  const [extendShop, setExtendShop] = useState<Member>(null);
  const [openWalletDetailsDialog, setOpenWalletDetailsDialog] = useState<Member>();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<MemberGroup>();
  const { adminPermission, member } = useAuth();
  const hasWritePermission = adminPermission("WRITE_MEMBERS");
  const hasExecutePermission = adminPermission("EXECUTE_MEMBERS");
  const [subscriptStatus, setSubscriptStatus] = useState<string>("");
  const [openExportMembers, setOpenExportMembers] = useState<boolean>(false);

  const toast = useToast();

  let today = new Date();
  const filterStatus = useMemo(() => {
    let currentDate = formatDate(today, "yyyy-MM-dd HH:mm:ss");
    switch (subscriptStatus) {
      case "active":
        // active = đang hoạt động
        return {
          $gt: currentDate,
        };
      case "warning":
        // warning = sắp hết hạn
        return {
          $gte: currentDate,
        };
      case "expired":
        // expired = đã hết hạn
        return {
          $lte: currentDate,
        };
      default:
        return;
    }
  }, [subscriptStatus]);

  return (
    <Card>
      <DataTable<Member>
        crudService={MemberService}
        filter={{
          ...{ memberGroupId: selectedTopic?.id, ["subscription.expiredAt"]: filterStatus },
        }}
      >
        <div className="flex gap-x-3">
          <DataTable.Consumer>
            {({ loadAll }) => (
              <List<MemberGroup>
                saveDisabled={!hasWritePermission}
                deleteDisabled={!hasWritePermission}
                className="w-56"
                crudService={MemberGroupService}
                selectedItem={selectedTopic}
                onSelect={(item) => setSelectedTopic(item)}
                onChange={() => {
                  loadAll(true);
                }}
                renderItem={(item, selected) => (
                  <>
                    <div
                      className={`font-semibold text-sm ${selected ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        }`}
                    >
                      {item.name || "Tất cả"}
                    </div>
                    <div className="text-xs text-gray-600">{`Lọc theo  chủ đề ${item.name || "Tất cả"
                      }`}</div>
                  </>
                )}
              >
                <List.Form>
                  <Field
                    name="name"
                    label={"Tên nhóm cửa hàng"}
                    required
                    cols={12}
                    validation={{ nameValid: (val) => validateKeyword(val) }}
                  >
                    <Input autoFocus />
                  </Field>
                </List.Form>
              </List>
            )}
          </DataTable.Consumer>
          <div className="flex-1">
            <DataTable.Header>
              <DataTable.Title />
              <DataTable.Buttons>
                <DataTable.Button
                  primary
                  text="Xuất danh sách cửa hàng"
                  onClick={() => {
                    setOpenExportMembers(true)
                  }}
                />
                <DataTable.Search />
                <DataTable.Button outline isRefreshButton refreshAfterTask />

                <DataTable.Button
                  primary
                  isCreateButton
                  disabled={!hasWritePermission}
                  icon={<AiOutlinePlus />}
                  text={""}
                />
              </DataTable.Buttons>
            </DataTable.Header>

            <DataTable.Divider />

            <DataTable.Toolbar>
              <DataTable.Filter>
                <Field name="categoryId" noError>
                  <Select
                    className="min-w-2xs"
                    placeholder="Lọc theo nhóm cửa hàng"
                    clearable
                    optionsPromise={() => ShopCategoryService.getAllOptionsPromise()}
                  />
                </Field>
                <Field name="provinceId" noError>
                  <Select
                    className="min-w-2xs"
                    placeholder="Lọc theo nhóm tỉnh thành"
                    clearable
                    optionsPromise={() =>
                      AddressService.getProvinces().then((res) =>
                        res.map((x) => ({ value: x.id, label: x.province }))
                      )
                    }
                  />
                </Field>
                <Field name="" noError>
                  <Select
                    className="min-w-2xs"
                    placeholder="Lọc theo hạn gói dịch vụ"
                    clearable
                    options={SUBSCRIPTION_STATUS_OPTIONS}
                    onChange={(value) => {
                      setSubscriptStatus(value);
                    }}
                  />
                </Field>
              </DataTable.Filter>
            </DataTable.Toolbar>

            <DataTable.Table className="mt-4">
              <DataTable.Column
                label="Cửa hàng"
                render={(item: Member) => (
                  <DataTable.CellText
                    image={item.shopLogo}
                    value={item.shopName}
                    subText={
                      <div className="flex flex-col items-start">
                        <Link href={`/${item.code}`}>
                          <a target="_blank" className="font-semibold text-primary hover:underline">
                            {item.code}
                          </a>
                        </Link>
                        {item.category && (
                          <div className="inline-block p-1 mt-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded">
                            {item.category.name}
                          </div>
                        )}
                      </div>
                    }
                  />
                )}
              />
              <DataTable.Column
                label="Người đại diện"
                render={(item: Member) => (
                  <DataTable.CellText
                    value={item.name}
                    subText={
                      <>
                        <div>{item.phone}</div>
                        <div>{item.username}</div>
                      </>
                    }
                    className="font-semibold"
                  />
                )}
              />
              <DataTable.Column
                label="Gói dịch vụ"
                render={(item: Member) => (
                  <DataTable.CellText
                    value={<></>}
                    subText={
                      <>
                        <StatusLabel
                          options={SUBSCRIPTION_PLANS}
                          value={item.subscription.plan}
                          type="text"
                          extraClassName="pl-0"
                        />
                        <div className="text-xs text-gray-600">
                          {formatDistanceToNow(new Date(item.subscription?.expiredAt), {
                            locale: vi,
                            addSuffix: true,
                          })}
                        </div>
                      </>
                    }
                  />
                )}
              />
              <DataTable.Column
                center
                orderBy="role"
                label="Trạng thái"
                render={(item: Member) => (
                  <DataTable.CellStatus
                    options={[
                      { value: true, label: "Hoạt động", color: "success" },
                      { value: false, label: "Đóng cửa", color: "slate" },
                    ]}
                    value={item.activated}
                  />
                )}
              />
              <DataTable.Column
                center
                label="Ngày tạo"
                render={(item: Member) => <DataTable.CellDate value={item.createdAt} />}
              />
              <DataTable.Column
                center
                label="Số dư ví"
                render={(item: Member) => (
                  <DataTable.CellText
                    value={
                      <>
                        <span className="font-semibold text-yellow-600">
                          {parseNumber(item.wallet.balance)}đ
                        </span>
                      </>
                    }
                  />
                )}
              />
              <DataTable.Column
                center
                label="Nhóm cửa hàng"
                render={(item: Member) => (
                  <DataTable.CellText value={item?.memberGroup?.name || "[Không có nhóm]"} />
                )}
              />
              <DataTable.Column
                right
                render={(item: Member) => (
                  <>
                    {/* <DataTable.CellButton
                  value={item}
                  icon={<RiMoneyDollarBoxLine />}
                  tooltip="Chi tiết ví tiền"
                  onClick={() => {
                    setDetailWallet(item);
                    // router.replace(`/admin`);
                  }}
                />

                <DataTable.CellButton
                  value={item}
                  icon={<RiFileAddLine />}
                  tooltip="Thanh toán dịch vụ"
                  onClick={() => {
                    setExtendShop(item);
                  }}
                />
                <DataTable.CellButton
                  value={item}
                  icon={<RiMoneyDollarCircleLine />}
                  tooltip="Lịch sử thanh toán dịch vụ"
                  onClick={() => {
                    setOpenSubscriptionDialog(item);
                  }}
                /> */}
                    <DataTable.CellButton
                      value={item}
                      moreItems={[
                        {
                          text: "Chi tiết ví tiền",
                          onClick: () => {
                            setOpenWalletDetailsDialog(item);
                          },
                          icon: <RiMoneyDollarBoxLine />,
                          iconPosition: "start",
                          iconClassName: "text-lg",
                        },
                        {
                          icon: <RiCurrencyLine />,
                          text: "Nạp tiền",
                          onClick: () => {
                            hasExecutePermission
                              ? setOpenTopupMember(item)
                              : toast.info("Bạn không có quyền thực hiện thao tác này");
                          },
                        },
                        {
                          icon: <RiExchangeDollarLine />,
                          text: "Lịch sử ví tiền",
                          onClick: () => {
                            setOpenWalletTransactionDialog(item);
                          },
                        },
                        {
                          icon: <RiFileAddLine />,
                          text: "Thanh toán dịch vụ",
                          onClick: () => {
                            hasExecutePermission
                              ? setExtendShop(item)
                              : toast.info("Bạn không có quyền thực hiện thao tác này");
                          },
                        },
                        {
                          icon: <RiMoneyDollarCircleLine />,
                          text: "Lịch sử thanh toán dịch vụ",
                          onClick: () => {
                            setOpenSubscriptionDialog(item);
                          },
                        },
                        {
                          icon: <RiLock2Line />,
                          text: "Đổi mật khẩu",
                          onClick: () => {
                            hasExecutePermission
                              ? setOpenChangePasswordMember(item)
                              : toast.info("Bạn không có quyền thực hiện thao tác này");
                          },
                        },
                      ]}
                    />
                    <DataTable.CellButton
                      value={item}
                      icon={<RiLoginBoxLine />}
                      tooltip="Quản lý"
                      onClick={async () => {
                        const open = window.open("", "_blank");
                        const token = await MemberService.getMemberToken(item.id);
                        SetMemberToken(token, open.localStorage);
                        open.location.href = `${location.origin}/shop`;
                      }}
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
            <DataTable.Pagination />
          </div>
        </div>

        <DataTable.Consumer>
          {({ formItem, loadAll, items }) => (
            <>
              <DataTable.Form
                grid
                footerProps={{
                  submitProps: { disabled: !hasWritePermission },
                }}
              >
                <Field
                  label="Email đăng nhập"
                  name="username"
                  cols={formItem?.id ? 12 : 6}
                  // readOnly={formItem?.id}
                  required
                >
                  <Input autoFocus type="email" />
                </Field>
                {!formItem?.id && (
                  <Field label="Mật khẩu" name="password" cols={6} required>
                    <Input type="password" />
                  </Field>
                )}
                <Field
                  label="Mã cửa hàng"
                  name="code"
                  cols={7}
                  required
                  validation={{ code: true }}
                  readOnly={formItem?.id}
                >
                  <Input placeholder="Chỉ gồm chữ, số và dấu gạch dưới" />
                </Field>
                <Field label="Trạng thái" name="activated" cols={5}>
                  <Switch
                    placeholder="Hoạt động"
                    value={formItem?.id ? formItem?.activated : true}
                  />
                </Field>
                <Field
                  label="Tên cửa hàng"
                  name="shopName"
                  cols={7}
                  required
                  validation={{ shopNameValid: (val) => validateKeyword(val) }}
                >
                  <Input />
                </Field>
                <Field label="Danh mục" name="categoryId" required cols={5}>
                  <Select optionsPromise={() => ShopCategoryService.getAllOptionsPromise()} />
                </Field>
                <Field label="Logo cửa hàng" name="shopLogo" cols={12}>
                  <ImageInput defaultValue="https://i.imgur.com/g9DHv7s.png" />
                </Field>
                <Field label="Nhóm cửa hàng" name="memberGroupId" cols={12}>
                  <Select optionsPromise={() => MemberGroupService.getAllOptionsPromise()} />
                </Field>
                <Field
                  label="Họ tên người đại diện"
                  name="name"
                  cols={6}
                  required
                  validation={{ nameValid: (val) => validateKeyword(val) }}
                >
                  <Input />
                </Field>
                <Field
                  label="Số điện thoại"
                  name="phone"
                  cols={6}
                  required
                  validation={{ phone: true }}
                >
                  <Input />
                </Field>
              </DataTable.Form>
              <Form
                title="Thay đổi mật khẩu cửa hàng"
                defaultValues={openChangePasswordMember}
                dialog
                isOpen={!!openChangePasswordMember}
                onClose={() => setOpenChangePasswordMember(null)}
                onSubmit={async (data) => {
                  try {
                    await MemberService.updateMemberPassword(
                      openChangePasswordMember?.id,
                      data.password
                    );
                    setOpenChangePasswordMember(null);
                    toast.success("Thay đổi mật khẩu thành công.");
                  } catch (err) {
                    toast.error("Thay đổi mật khẩu thất bại. " + err.message);
                  }
                }}
              >
                <Field readOnly label="Cửa hàng">
                  <Input value={openChangePasswordMember?.shopName} />
                </Field>
                <Field readOnly label="Email">
                  <Input value={openChangePasswordMember?.username} />
                </Field>
                <Field required name="password" label="Mật khẩu mới">
                  <Input type="password" />
                </Field>
                <Form.Footer submitText="Đổi mật khẩu" />
              </Form>
              <ExtendSubscriptionFormDialog
                isOpen={!!extendShop}
                onClose={() => {
                  setExtendShop(null);
                  loadAll();
                }}
                shopId={extendShop?.id}
                shopName={extendShop?.shopName}
              ></ExtendSubscriptionFormDialog>
              <Form
                dialog
                width={"400px"}
                title={`Nạp tiền cửa hàng`}
                // resetToDefaultAfterSubmit
                isOpen={!!openTopupMember}
                onClose={() => {
                  setOpenTopupMember(null);
                }}
                onSubmit={async (data) => {
                  try {
                    await WalletTransactionService.manualTopUpByAdmin(
                      openTopupMember?.wallet?.id,
                      data.amount
                    );
                    await loadAll(true);
                    toast.success("Nạp tiền thành công");
                    setOpenTopupMember(null);
                    if (openWalletDetailsDialog) {
                      const id = openWalletDetailsDialog.id;
                      const item = items.find((x) => x.id == id);
                      setOpenWalletDetailsDialog(null);
                      if (item) {
                        setTimeout(() => {
                          setOpenWalletDetailsDialog(item as Member);
                        });
                      }
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error("Nạp tiền thất bại. " + err.message);
                  }
                }}
              >
                <Field label="Cửa hàng" readOnly>
                  <Input value={openTopupMember?.shopName} />
                </Field>
                <Field name="amount" label="Số tiền nạp">
                  <Input number suffix={"VND"} />
                </Field>
                <Form.Footer />
              </Form>
              <WalletDetailsDialog
                isOpen={!!openWalletDetailsDialog}
                onClose={() => setOpenWalletDetailsDialog(null)}
                member={openWalletDetailsDialog}
                onTopupShop={() => {
                  setOpenTopupMember(openWalletDetailsDialog);
                }}
                executePermissionDisabled={!hasExecutePermission}
              />
            </>
          )}
        </DataTable.Consumer>
      </DataTable>
      <SubscriptionsDialog
        member={openSubscriptionDialog}
        isOpen={!!openSubscriptionDialog}
        onClose={() => setOpenSubscriptionDialog(null)}
      />
      <WalletTransactionDialog
        member={openWalletTransactionDialog}
        isOpen={!!openWalletTransactionDialog}
        onClose={() => setOpenWalletTransactionDialog(null)}
      />
      <ExportMemberDialog
        isOpen={openExportMembers}
        onClose={() => {
          setOpenExportMembers(false)
        }}
      />
    </Card>
  );
}

function WalletDetailsDialog({
  member,
  onTopupShop,
  executePermissionDisabled,
  ...props
}: { member: Member; onTopupShop: () => any; executePermissionDisabled: boolean } & DialogProps) {
  const [type, setType] = useState("in");
  const toast = useToast();
  const filter = useMemo(
    () => ({ walletId: member?.wallet.id, amount: { [type == "in" ? "$gt" : "$lte"]: 0 } }),
    [type, member]
  );
  return (
    <Dialog {...props} minWidth={700} extraHeaderClass="flex items-center justify-between">
      <Dialog.Header>
        <div className="py-3 font-semibold">
          Thông tin ví cửa hàng - <span className="text-primary">{member?.shopName}</span>
        </div>
        <i
          className="text-gray-500 cursor-pointer hover:text-gray-600"
          onClick={() => props.onClose()}
        >
          <HiX />
        </i>
      </Dialog.Header>

      <Dialog.Body>
        <div className="flex pb-3 mb-3 border-b border-gray-300">
          <div className="flex flex-col justify-center h-16 px-4 bg-white border rounded shadow-sm min-w-3xs">
            <div className="text-sm font-medium">Ví tiền</div>
            <div className="flex items-center text-lg font-semibold text-yellow-500">
              <i className="mr-2 mb-0.5">
                <RiWallet3Line />
              </i>
              {parseNumber(member?.wallet?.balance)}đ
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              large
              warning
              text={"Nạp tiền vào ví cửa hàng"}
              icon={<GiPayMoney />}
              onClick={() => {
                executePermissionDisabled
                  ? toast.info("Bạn không có quyền thực hiện thao tác này")
                  : onTopupShop();
              }}
            />
          </div>
        </div>
        <DataTable<WalletTransaction>
          crudService={WalletTransactionService}
          order={{ createdAt: -1 }}
          filter={filter}
          fetchingCondition={!!member}
        >
          <DataTable.Toolbar>
            <TabButtons
              tabClassName="px-3"
              value={type}
              onChange={setType}
              options={[
                { value: "in", label: "Tiền vào" },
                { value: "out", label: "Tiền ra" },
              ]}
            />
            <DataTable.Filter>
              <Field name="labels" noError>
                <Select
                  options={MEMBER_WALLET_TRANS_LABEL_OPTIONS}
                  clearable
                  placeholder="Nguồn tiền"
                  autosize
                />
              </Field>
            </DataTable.Filter>
            <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white " />
          </DataTable.Toolbar>
          <DataTable.Table className="mt-4 bg-white">
            <DataTable.Column
              label="Ngày giao dịch"
              width={200}
              render={(item: WalletTransaction) => <DataTable.CellDate value={item?.createdAt} />}
            />
            <DataTable.Column
              label="Mã giao dịch"
              width={200}
              render={(item: WalletTransaction) => <DataTable.CellText value={item?.code} />}
            />
            <DataTable.Column
              label="Loại giao dịch"
              center
              width={200}
              render={(item: WalletTransaction) => (
                <DataTable.CellStatus value={item.type} options={WALLET_TRANSACTION_TYPE_OPTIONS} />
              )}
            />
            <DataTable.Column
              label="Ghi chú"
              render={(item: WalletTransaction) => <DataTable.CellText value={item?.note} />}
            />
            <DataTable.Column
              label="Số tiền"
              right
              width={200}
              render={(item: WalletTransaction) => (
                <DataTable.CellNumber
                  value={item?.amount}
                  className={`font-bold ` + (item?.amount > 0 ? "text-success" : "text-danger")}
                />
              )}
            />
          </DataTable.Table>
          <DataTable.Pagination />
        </DataTable>
      </Dialog.Body>
    </Dialog>
  );
}
