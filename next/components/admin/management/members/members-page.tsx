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
  { value: "active", label: "??ang ho???t ?????ng", color: "success" },
  { value: "warning", label: "S???p h???t h???n", color: "warning" },
  { value: "expired", label: "???? h???t h???n", color: "danger" },
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
        // active = ??ang ho???t ?????ng
        return {
          $gt: currentDate,
        };
      case "warning":
        // warning = s???p h???t h???n
        return {
          $gte: currentDate,
        };
      case "expired":
        // expired = ???? h???t h???n
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
                      {item.name || "T???t c???"}
                    </div>
                    <div className="text-xs text-gray-600">{`L???c theo  ch??? ????? ${item.name || "T???t c???"
                      }`}</div>
                  </>
                )}
              >
                <List.Form>
                  <Field
                    name="name"
                    label={"T??n nh??m c???a h??ng"}
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
                  text="Xu???t danh s??ch c???a h??ng"
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
                    placeholder="L???c theo nh??m c???a h??ng"
                    clearable
                    optionsPromise={() => ShopCategoryService.getAllOptionsPromise()}
                  />
                </Field>
                <Field name="provinceId" noError>
                  <Select
                    className="min-w-2xs"
                    placeholder="L???c theo nh??m t???nh th??nh"
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
                    placeholder="L???c theo h???n g??i d???ch v???"
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
                label="C???a h??ng"
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
                label="Ng?????i ?????i di???n"
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
                label="G??i d???ch v???"
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
                label="Tr???ng th??i"
                render={(item: Member) => (
                  <DataTable.CellStatus
                    options={[
                      { value: true, label: "Ho???t ?????ng", color: "success" },
                      { value: false, label: "????ng c???a", color: "slate" },
                    ]}
                    value={item.activated}
                  />
                )}
              />
              <DataTable.Column
                center
                label="Ng??y t???o"
                render={(item: Member) => <DataTable.CellDate value={item.createdAt} />}
              />
              <DataTable.Column
                center
                label="S??? d?? v??"
                render={(item: Member) => (
                  <DataTable.CellText
                    value={
                      <>
                        <span className="font-semibold text-yellow-600">
                          {parseNumber(item.wallet.balance)}??
                        </span>
                      </>
                    }
                  />
                )}
              />
              <DataTable.Column
                center
                label="Nh??m c???a h??ng"
                render={(item: Member) => (
                  <DataTable.CellText value={item?.memberGroup?.name || "[Kh??ng c?? nh??m]"} />
                )}
              />
              <DataTable.Column
                right
                render={(item: Member) => (
                  <>
                    {/* <DataTable.CellButton
                  value={item}
                  icon={<RiMoneyDollarBoxLine />}
                  tooltip="Chi ti???t v?? ti???n"
                  onClick={() => {
                    setDetailWallet(item);
                    // router.replace(`/admin`);
                  }}
                />

                <DataTable.CellButton
                  value={item}
                  icon={<RiFileAddLine />}
                  tooltip="Thanh to??n d???ch v???"
                  onClick={() => {
                    setExtendShop(item);
                  }}
                />
                <DataTable.CellButton
                  value={item}
                  icon={<RiMoneyDollarCircleLine />}
                  tooltip="L???ch s??? thanh to??n d???ch v???"
                  onClick={() => {
                    setOpenSubscriptionDialog(item);
                  }}
                /> */}
                    <DataTable.CellButton
                      value={item}
                      moreItems={[
                        {
                          text: "Chi ti???t v?? ti???n",
                          onClick: () => {
                            setOpenWalletDetailsDialog(item);
                          },
                          icon: <RiMoneyDollarBoxLine />,
                          iconPosition: "start",
                          iconClassName: "text-lg",
                        },
                        {
                          icon: <RiCurrencyLine />,
                          text: "N???p ti???n",
                          onClick: () => {
                            hasExecutePermission
                              ? setOpenTopupMember(item)
                              : toast.info("B???n kh??ng c?? quy???n th???c hi???n thao t??c n??y");
                          },
                        },
                        {
                          icon: <RiExchangeDollarLine />,
                          text: "L???ch s??? v?? ti???n",
                          onClick: () => {
                            setOpenWalletTransactionDialog(item);
                          },
                        },
                        {
                          icon: <RiFileAddLine />,
                          text: "Thanh to??n d???ch v???",
                          onClick: () => {
                            hasExecutePermission
                              ? setExtendShop(item)
                              : toast.info("B???n kh??ng c?? quy???n th???c hi???n thao t??c n??y");
                          },
                        },
                        {
                          icon: <RiMoneyDollarCircleLine />,
                          text: "L???ch s??? thanh to??n d???ch v???",
                          onClick: () => {
                            setOpenSubscriptionDialog(item);
                          },
                        },
                        {
                          icon: <RiLock2Line />,
                          text: "?????i m???t kh???u",
                          onClick: () => {
                            hasExecutePermission
                              ? setOpenChangePasswordMember(item)
                              : toast.info("B???n kh??ng c?? quy???n th???c hi???n thao t??c n??y");
                          },
                        },
                      ]}
                    />
                    <DataTable.CellButton
                      value={item}
                      icon={<RiLoginBoxLine />}
                      tooltip="Qu???n l??"
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
                  label="Email ????ng nh???p"
                  name="username"
                  cols={formItem?.id ? 12 : 6}
                  // readOnly={formItem?.id}
                  required
                >
                  <Input autoFocus type="email" />
                </Field>
                {!formItem?.id && (
                  <Field label="M???t kh???u" name="password" cols={6} required>
                    <Input type="password" />
                  </Field>
                )}
                <Field
                  label="M?? c???a h??ng"
                  name="code"
                  cols={7}
                  required
                  validation={{ code: true }}
                  readOnly={formItem?.id}
                >
                  <Input placeholder="Ch??? g???m ch???, s??? v?? d???u g???ch d?????i" />
                </Field>
                <Field label="Tr???ng th??i" name="activated" cols={5}>
                  <Switch
                    placeholder="Ho???t ?????ng"
                    value={formItem?.id ? formItem?.activated : true}
                  />
                </Field>
                <Field
                  label="T??n c???a h??ng"
                  name="shopName"
                  cols={7}
                  required
                  validation={{ shopNameValid: (val) => validateKeyword(val) }}
                >
                  <Input />
                </Field>
                <Field label="Danh m???c" name="categoryId" required cols={5}>
                  <Select optionsPromise={() => ShopCategoryService.getAllOptionsPromise()} />
                </Field>
                <Field label="Logo c???a h??ng" name="shopLogo" cols={12}>
                  <ImageInput defaultValue="https://i.imgur.com/g9DHv7s.png" />
                </Field>
                <Field label="Nh??m c???a h??ng" name="memberGroupId" cols={12}>
                  <Select optionsPromise={() => MemberGroupService.getAllOptionsPromise()} />
                </Field>
                <Field
                  label="H??? t??n ng?????i ?????i di???n"
                  name="name"
                  cols={6}
                  required
                  validation={{ nameValid: (val) => validateKeyword(val) }}
                >
                  <Input />
                </Field>
                <Field
                  label="S??? ??i???n tho???i"
                  name="phone"
                  cols={6}
                  required
                  validation={{ phone: true }}
                >
                  <Input />
                </Field>
              </DataTable.Form>
              <Form
                title="Thay ?????i m???t kh???u c???a h??ng"
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
                    toast.success("Thay ?????i m???t kh???u th??nh c??ng.");
                  } catch (err) {
                    toast.error("Thay ?????i m???t kh???u th???t b???i. " + err.message);
                  }
                }}
              >
                <Field readOnly label="C???a h??ng">
                  <Input value={openChangePasswordMember?.shopName} />
                </Field>
                <Field readOnly label="Email">
                  <Input value={openChangePasswordMember?.username} />
                </Field>
                <Field required name="password" label="M???t kh???u m???i">
                  <Input type="password" />
                </Field>
                <Form.Footer submitText="?????i m???t kh???u" />
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
                title={`N???p ti???n c???a h??ng`}
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
                    toast.success("N???p ti???n th??nh c??ng");
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
                    toast.error("N???p ti???n th???t b???i. " + err.message);
                  }
                }}
              >
                <Field label="C???a h??ng" readOnly>
                  <Input value={openTopupMember?.shopName} />
                </Field>
                <Field name="amount" label="S??? ti???n n???p">
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
          Th??ng tin v?? c???a h??ng - <span className="text-primary">{member?.shopName}</span>
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
            <div className="text-sm font-medium">V?? ti???n</div>
            <div className="flex items-center text-lg font-semibold text-yellow-500">
              <i className="mr-2 mb-0.5">
                <RiWallet3Line />
              </i>
              {parseNumber(member?.wallet?.balance)}??
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              large
              warning
              text={"N???p ti???n v??o v?? c???a h??ng"}
              icon={<GiPayMoney />}
              onClick={() => {
                executePermissionDisabled
                  ? toast.info("B???n kh??ng c?? quy???n th???c hi???n thao t??c n??y")
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
                { value: "in", label: "Ti???n v??o" },
                { value: "out", label: "Ti???n ra" },
              ]}
            />
            <DataTable.Filter>
              <Field name="labels" noError>
                <Select
                  options={MEMBER_WALLET_TRANS_LABEL_OPTIONS}
                  clearable
                  placeholder="Ngu???n ti???n"
                  autosize
                />
              </Field>
            </DataTable.Filter>
            <DataTable.Button outline isRefreshButton refreshAfterTask className="bg-white " />
          </DataTable.Toolbar>
          <DataTable.Table className="mt-4 bg-white">
            <DataTable.Column
              label="Ng??y giao d???ch"
              width={200}
              render={(item: WalletTransaction) => <DataTable.CellDate value={item?.createdAt} />}
            />
            <DataTable.Column
              label="M?? giao d???ch"
              width={200}
              render={(item: WalletTransaction) => <DataTable.CellText value={item?.code} />}
            />
            <DataTable.Column
              label="Lo???i giao d???ch"
              center
              width={200}
              render={(item: WalletTransaction) => (
                <DataTable.CellStatus value={item.type} options={WALLET_TRANSACTION_TYPE_OPTIONS} />
              )}
            />
            <DataTable.Column
              label="Ghi ch??"
              render={(item: WalletTransaction) => <DataTable.CellText value={item?.note} />}
            />
            <DataTable.Column
              label="S??? ti???n"
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
