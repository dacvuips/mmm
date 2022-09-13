import { cloneDeep, isEqual } from "lodash";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { RiAddCircleLine, RiCloseCircleFill } from "react-icons/ri";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { useAlert } from "../../../../lib/providers/alert-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Setting, SettingService } from "../../../../lib/repo/setting.repo";
import { Bank, ShopConfigService } from "../../../../lib/repo/shop-config.repo";
import { SubscriptionRequest } from "../../../../lib/repo/subscription-request.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import {
  Button,
  Checkbox,
  Field,
  Form,
  Input,
  Label,
  Switch,
  Textarea,
} from "../../../shared/utilities/form";
import { NotFound } from "../../../shared/utilities/misc";

export function PaymentSettings() {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();
  const [banks, setBanks] = useState<Bank[]>();
  // const [openConnectDialog, setOpenConnectDialog] = useState(false);
  const [openBankDialog, setOpenBankDialog] = useState<Bank>(undefined);
  const [setingMomo, setSetingMomo] = useState<Setting>();
  const [openMoMoDialog, setOpenMoMoDialog] = useState(false);
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_SETTINGS");

  useEffect(() => {
    SettingService.getAll({
      query: { limit: 0, filter: { groupId: "6151504531a6340fdcfdf0a4" } },
    })
      .then((res) => {
        setSetingMomo(res.data[0]);
      })
      .catch((err) => {
        console.error(err);
        setSetingMomo(null);
      });
  }, []);
  useEffect(() => {
    if (shopConfig?.banks) {
      setBanks(cloneDeep(shopConfig.banks) || []);
    }
  }, [shopConfig]);

  const onSubmit = async (data) => {
    await updateShopConfig({
      ...data,
      banks: banks.map((x) => {
        const { __typename, ...data } = x as any;
        return data;
      }),
    });
  };

  // const disconnectCasso = () => {
  //   return alert.danger(
  //     "Huỷ kết nối Casso?",
  //     "Bạn có chắc chắn muốn huỷ kết nối tài khoản Casso này",
  //     "Huỷ kết nối",
  //     async () => {
  //       try {
  //         const res = await ShopConfigService.disconnectCasso();
  //         setShopConfig({ ...shopConfig, ...res });
  //         toast.success("Huỷ kết nối tài khoản Casso thành công");
  //       } catch (err) {
  //         console.error(err);
  //         toast.error("Huỷ kết nối thất bại. " + err.message);
  //       }
  //       return true;
  //     }
  //   );
  // };
  // const connectCasso = async (data) => {
  //   try {
  //     const res = await ShopConfigService.connectCasso(data.apiKey);
  //     setShopConfig({ ...shopConfig, ...res });
  //     toast.success("Kết nối tài khoản Casso thành công");
  //     setOpenConnectDialog(false);
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Kết nối thất bại. " + err.message);
  //   }
  //   return true;
  // };

  return (
    <>
      <Form
        grid
        defaultValues={shopConfig}
        className="max-w-screen-sm animate-emerge"
        onSubmit={onSubmit}
      >
        <Form.Title className="pt-2" title="Cấu hình thanh toán COD" />
        <Field name="codEnabled" cols={4}>
          <Switch placeholder="Ship COD" />
        </Field>
        <Form.Title title="Cấu hình thanh toán Online" />
        <Field name="momoEnabled" cols={4}>
          <Switch
            placeholder="MoMo"
            onChange={(val) => {
              if (val) {
                setOpenMoMoDialog(true);
              }
            }}
          />
        </Field>
        <AcceptMoMoDialog
          momoContent={setingMomo?.value}
          isOpen={openMoMoDialog}
          onClose={() => {
            setOpenMoMoDialog(false);
          }}
        />
        {/* <Field name="vnpayEnabled" cols={4}>
                <Switch placeholder="VNPay" />
              </Field>
              <Field name="zalopayEnabled" cols={4}>
                <Switch placeholder="ZaloPay" />
              </Field> */}
        <Form.Title title="Cấu hình thanh toán Chuyển khoản" />
        {/* <Field name="cassoEnabled" cols={12}>
                <Switch placeholder="Chuyển khoản qua Casso" />
              </Field>
              <div className="flex items-center p-2 mb-3 -mt-2 text-sm font-semibold text-gray-600 border rounded-sm border-info bg-info-light col-span-full">
                <i className="ml-1 mr-1 text-info">
                  <RiInformationLine />
                </i>
                Đăng ký tài khoản Casso tại{" "}
                <a
                  target="_blank"
                  className="ml-1 underline text-info hover:underline"
                  href="https://casso.vn/"
                >
                  https://casso.vn/
                </a>
              </div>
              <div className="flex items-center justify-between col-span-12 mb-4">
                <div>
                  <Label text="Trạng thái Casso" />
                  <span className="flex items-center ml-1 font-semibold text-gray-700">
                    <div
                      className={`w-2.5 h-2.5 mr-2 rounded-full bg-${
                        CASSO_STATUS.find((x) => x.value == shopConfig.cassoStatus)?.color
                      }`}
                    ></div>
                    <span
                      className={`text-${
                        CASSO_STATUS.find((x) => x.value == shopConfig.cassoStatus)?.color
                      }`}
                    >
                      {CASSO_STATUS.find((x) => x.value == shopConfig.cassoStatus)?.label}
                    </span>
                  </span>
                </div>
                {shopConfig.cassoStatus == "connected" ? (
                  <Button
                    outline
                    hoverDanger
                    className="bg-white rounded-full"
                    text="Huỷ kết nối Casso"
                    onClick={disconnectCasso}
                  />
                ) : (
                  <Button
                    info
                    className="rounded-full"
                    text="Kết nối tài khoản Casso"
                    onClick={() => setOpenConnectDialog(true)}
                  />
                )}
              </div>
              {shopConfig.cassoUser && (
                <div className="col-span-12 mb-6">
                  <Label text="Tài khoản Casso" />
                  <div
                    style={{ minWidth: 320 }}
                    className="flex flex-col px-4 py-3 mt-3 border rounded bg-slate-light border-slate gap-y-2"
                  >
                    <div className="flex justify-between text-gray-700">
                      <span>Doanh nghiệp </span>
                      <strong>{shopConfig.cassoUser.business.name}</strong>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Email </span>
                      <strong>{shopConfig.cassoUser.user.email}</strong>
                    </div>
                    {shopConfig.cassoUser.bankAccs.map((account) => (
                      <div
                        className="flex flex-col pt-2 mt-1 border-t border-gray-300 gap-y-1"
                        key={account.id}
                      >
                        <div className="flex justify-between text-gray-700">
                          <span>Tên tài khoản </span>
                          <strong>{account.bankAccountName}</strong>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Mã ngân hàng </span>
                          <strong>{account.bank.codeName.toUpperCase()}</strong>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Số dư </span>
                          <span className="flex items-center">
                            {showBalance ? (
                              <strong>{parseNumber(account.balance, true)}</strong>
                            ) : (
                              <strong>
                                {account.balance
                                  .toString()
                                  .split("")
                                  .map((x) => (
                                    <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mx-0.5" />
                                  ))}
                              </strong>
                            )}
                            <Button
                              iconClassName="text-xl"
                              icon={showBalance ? <RiEyeOffLine /> : <RiEyeLine />}
                              className="px-0 ml-2 h-7"
                              unfocusable
                              onClick={() => setshowBalance(!showBalance)}
                            />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
        <div className="col-span-12 mb-6">
          <Label className="mb-2" text="Danh sách tài khoản ngân hàng" />

          <div className="flex flex-col mt-1 mb-4 gap-y-2">
            {banks?.map((bank, index) => (
              <div
                key={index}
                className="w-full p-3 pt-2 bg-white border border-gray-300 rounded cursor-pointer hover:border-primary"
                onClick={() => setOpenBankDialog(bank)}
              >
                <div className="flex items-center">
                  <div className="flex flex-1 pr-2 text-gray-700">
                    <div className="grow-0 shrink-0 pr-3 text-sm leading-6 text-right w-28">
                      <div>Tên tài khoản</div>
                      <div>Số tài khoản</div>
                      <div>Tên ngân hàng</div>
                      <div>Chi nhánh</div>
                      <div>Ghi chú</div>
                    </div>
                    <div className="font-semibold leading-6">
                      <div>{bank.ownerName}</div>
                      <div>{bank.bankNumber}</div>
                      <div>{bank.bankName}</div>
                      <div>
                        {bank.branch || (
                          <span className="text-sm font-normal opacity-70">Không có</span>
                        )}
                      </div>
                      <div>
                        {bank.note || (
                          <span className="text-sm font-normal opacity-70">Không có</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      value={bank.active}
                      onChange={(active) => {
                        bank.active = active;
                        setBanks([...banks]);
                      }}
                    />
                    <Button
                      className="text-gray-400"
                      icon={<RiCloseCircleFill />}
                      iconClassName={"text-xl"}
                      hoverDanger
                      onClick={(e) => {
                        e.stopPropagation();
                        banks.splice(index, 1);
                        setBanks([...banks]);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div
              className="w-full p-3 text-gray-600 bg-white border border-gray-300 rounded cursor-pointer flex-center hover:border-primary hover:text-primary"
              onClick={() => setOpenBankDialog(null)}
            >
              <i className="text-xl">
                <RiAddCircleLine />
              </i>
              <span className="ml-1 font-semibold">Thêm tài khoản ngân hàng</span>
            </div>
          </div>
        </div>
        <Form.Footer
          className="mt-1"
          isReverse={false}
          submitProps={{ large: true, className: "shadow", disabled }}
        />
      </Form>
      {/* <Form
        dialog
        title="Kết nối tài khoản Casso"
        onSubmit={connectCasso}
        isOpen={openConnectDialog}
        onClose={() => setOpenConnectDialog(false)}
      >
        <Field name="apiKey" label="API Key tài khoản Casso" required>
          <Input placeholder="Hãy nhập API Key tại đây để kết nối" />
        </Field>
        <Form.Footer submitProps={{ info: true }} />
      </Form> */}
      <Form
        dialog
        title={`${openBankDialog ? "Cập nhật" : "Thêm"} tài khoản ngân hàng`}
        isOpen={openBankDialog !== undefined}
        onClose={() => setOpenBankDialog(undefined)}
        defaultValues={openBankDialog}
        onSubmit={(data) => {
          if (!openBankDialog) {
            setBanks([...banks, data]);
          } else {
            const index = banks.findIndex((x) => x.bankNumber == openBankDialog.bankNumber);
            banks[index] = data;
            setBanks([...banks]);
          }
          setOpenBankDialog(undefined);
        }}
      >
        <Field name="ownerName" label="Tên chủ tài khoản" required>
          <Input />
        </Field>
        <Field name="bankNumber" label="Số tài khoản" required>
          <Input />
        </Field>
        <Field name="bankName" label="Tên ngân hàng" required>
          <Input />
        </Field>
        <Field name="branch" label="Cửa hàng ngân hàng">
          <Input />
        </Field>
        <Field name="note" label="Ghi chú chuyển khoản">
          <Textarea />
        </Field>
        <Form.Footer />
      </Form>
    </>
  );
}

function AcceptMoMoDialog({ momoContent, ...props }: DialogProps & { momoContent: string }) {
  const [accept, setAccept] = useState(true);
  const { setValue } = useFormContext();

  return (
    <Dialog
      width="450px"
      title="Điều khoản sử dụng"
      {...props}
      onClose={() => {
        setValue("momoEnabled", false);
        props.onClose();
      }}
    >
      <Dialog.Body>
        <div>
          {momoContent ? (
            <div className="whitespace-pre-wrap">{momoContent}</div>
          ) : (
            <NotFound text="Nội dung điều khoản đang được soạn thảo" />
          )}
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex flex-col justify-end w-full my-4">
          <Checkbox
            placeholder="Tôi đồng ý với điều khoản"
            value={accept}
            onChange={(val) => setAccept(val)}
          />
          <Button
            text="Xác nhận"
            primary
            disabled={!accept}
            onClick={() => {
              if (accept) {
                props.onClose();
              } else {
                setValue("momoEnabled", false);
                props.onClose();
              }
            }}
          />
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
