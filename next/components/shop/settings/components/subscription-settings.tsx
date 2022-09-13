import { useEffect, useMemo, useState } from "react";
import { AiFillCheckSquare, AiOutlineCheck, AiOutlineCheckCircle } from "react-icons/ai";
import { FiCheckSquare } from "react-icons/fi";
import { RiCheckboxBlankLine, RiCheckboxCircleLine, RiTimerLine } from "react-icons/ri";

import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { formatDate, parseNumber } from "../../../../lib/helpers/parser";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import {
  ShopSubscription,
  ShopSubscriptionService,
  SUBSCRIPTION_PAYMENT_STATUS,
  SUBSCRIPTION_PLANS,
} from "../../../../lib/repo/shop-subscription.repo";
import {
  SubscriptionRequest,
  SubscriptionRequestService,
} from "../../../../lib/repo/subscription-request.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button, Field, Form, Input, Radio } from "../../../shared/utilities/form";
import { Card, NotFound } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { TopUpWalletFormDialog } from "../../wallet/components/top-up-wallet-form-dialog";

export function SubscriptionSettings() {
  const { subscriptionStatus } = useShopLayoutContext();
  const { member, staffPermission } = useAuth();
  const [openCreateRequestDialog, setOpenCreateRequestDialog] = useState(false);
  const [openRequest, setOpenRequest] = useState<SubscriptionRequest>();
  const toast = useToast();
  const disabled = !staffPermission("WRITE_SETTINGS");

  return (
    <>
      <div className="max-w-screen-sm pb-6 border-b border-gray-300">
        <div className="pl-1 mt-4 mb-4 text-lg font-semibold text-gray-600">
          Gói dịch vụ hiện tại
        </div>
        {member.subscription && (
          <div className="grid grid-cols-2 gap-1 p-3 text-gray-700 bg-white border border-gray-400 rounded">
            <div className="flex items-center">
              <div className="w-32">Gói cước</div>
              <div
                className={`status-text text-${SUBSCRIPTION_PLANS.find((x) => x.value == member.subscription.plan)?.color
                  }`}
              >
                {SUBSCRIPTION_PLANS.find((x) => x.value == member.subscription.plan)?.label}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-32">Trạng thái</div>
              <div className={`status-label bg-${subscriptionStatus?.color}`}>
                {subscriptionStatus?.label}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-32">Cước phí</div>
              <div className="font-semibold">{parseNumber(member.subscription.fee, true)}</div>
            </div>
            <div className="flex items-center">
              <div className="w-32">Thanh toán</div>
              <div className={`font-semibold`}>
                {
                  SUBSCRIPTION_PAYMENT_STATUS.find(
                    (x) => x.value == member.subscription?.request?.payment?.status
                  )?.label
                }
              </div>
            </div>
            {member.subscription.expiredAt && (
              <div className="flex items-center">
                <div className="w-32">Ngày hết hạn</div>
                <div className="font-semibold">
                  {formatDate(member.subscription.expiredAt, "dd-MM-yyyy")}
                </div>
              </div>
            )}
            {member.subscription.lockedAt && (
              <div className="flex items-center">
                <div className="w-32">Ngày bị khoá</div>
                <div className="font-semibold">
                  {formatDate(member.subscription.lockedAt, "dd-MM-yyyy")}
                </div>
              </div>
            )}
          </div>
        )}
        <Button
          className="mt-2 bg-white"
          outline
          text="Nâng cấp gói dịch vụ"
          onClick={() => setOpenCreateRequestDialog(true)}
        />
      </div>
      <RequestDialog
        isOpen={openCreateRequestDialog}
        onClose={() => {
          setOpenCreateRequestDialog(false);
        }}
      />
      <Form
        dialog
        title="Thay đổi gói dịch vụ"
        // isOpen={openCreateRequestDialog}
        // onClose={() => setOpenCreateRequestDialog(false)}
        onSubmit={async (data) => {
          try {
            const res = await SubscriptionRequestService.create({ data });
            setOpenCreateRequestDialog(false);
            setOpenRequest(res);
            return true;
          } catch (err) {
            toast.error("Yêu cầu đăng ký gói dịch vụ thất bại");
          }
        }}
      >
        <Field name="plan" label="Chọn gói dịch vụ">
          <Radio options={SUBSCRIPTION_PLANS.filter((x) => x.value != "FREE")} />
        </Field>
        <Form.Footer className="justify-end gap-3" />
      </Form>

      <Card className="max-w-screen-lg">
        <DataTable<ShopSubscription>
          crudService={ShopSubscriptionService}
          order={{ createdAt: -1 }}
          filter={{ memberId: member?.id }}
          fetchingCondition={!!member}
        >
          <DataTable.Header>
            <DataTable.Title>Lịch sử đăng ký dịch vụ của {member?.shopName}</DataTable.Title>
            <DataTable.Buttons>
              <DataTable.Button outline isRefreshButton refreshAfterTask />
            </DataTable.Buttons>
          </DataTable.Header>

          <DataTable.Divider />

          <DataTable.Toolbar>
            <DataTable.Search className="h-12" />
            <DataTable.Filter></DataTable.Filter>
          </DataTable.Toolbar>

          <DataTable.Table className="mt-4">
            <DataTable.Column
              center
              label="Ngày bắt đầu"
              render={(item: ShopSubscription) => <DataTable.CellDate value={item.createdAt} />}
            />
            <DataTable.Column
              center
              label="Ngày hết hạn"
              render={(item: ShopSubscription) => <DataTable.CellDate value={item.expiredAt} />}
            />

            <DataTable.Column
              center
              label="Gói dịch vụ"
              render={(item: ShopSubscription) => (
                <DataTable.CellStatus value={item.plan} options={SUBSCRIPTION_PLANS} />
              )}
            />
            <DataTable.Column
              label="Thanh toán"
              render={(item: ShopSubscription) => (
                <DataTable.CellText
                  value={
                    <>
                      {item.fee ? (
                        <div>
                          <div className="text-gray-700">
                            Cước phí: {parseNumber(item.fee, true)}
                          </div>
                          <div
                            className={`flex items-center gap-1 ${item.paymentStatus == "PENDING" ? "text-gray-600" : "text-success"
                              }`}
                          >
                            {item.paymentStatus == "PENDING" ? (
                              <>
                                <RiTimerLine />
                                <span>Chờ thanh toán</span>
                              </>
                            ) : (
                              <>
                                <RiCheckboxCircleLine />
                                <span>Đã thanh toán</span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  }
                />
              )}
            />
          </DataTable.Table>
          <DataTable.Pagination />
        </DataTable>
      </Card>
    </>
  );
}

function RequestDialog(props: DialogProps) {
  const [servicePackage, setServicePackage] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [total, setTotal] = useState(0);
  const { member } = useAuth();
  const [openRequest, setOpenRequest] = useState<SubscriptionRequest>();
  const [openWalletFormDialog, setOpenWalletFormDialog] = useState(false);

  const toast = useToast();

  const handleActiveMonth = (infoPacket) => {
    setServicePackage(infoPacket);
  };

  const totalMoney = useMemo(() => {
    if (activeMonth == 0) {
      return Number(servicePackage?.activeMonth) * Number(servicePackage?.infoPacket?.price);
    } else {
      return Number(activeMonth) * Number(servicePackage?.infoPacket?.price);
    }
  }, [activeMonth, servicePackage]);

  const handleSubmitRequestForm = async (plan: any, data: any) => {
    if (activeMonth != null && activeMonth > 0) {
      if (Number(member?.wallet?.balance) < totalMoney || Number(member?.wallet?.balance) == 0) {
        toast.info("Ví của bạn không đủ để thanh toán, Vui lòng nạp tiền vào ví để tiếp tục");
        setOpenWalletFormDialog(true);
      } else {
        try {
          const res = await SubscriptionRequestService.create({
            data: { plan: plan, months: data.activeMonth },
          });
          setOpenRequest(res);
          return true;
        } catch (err) {
          toast.error("Yêu cầu đăng ký gói dịch vụ thất bại");
        }
      }
    } else {
      toast.info("Vui lòng nhập số tháng đăng ký");
    }
  };

  useEffect(() => {
    if (openRequest) {
      const timer = setTimeout(() => {
        setOpenRequest(null);
        props.onClose();
        window.location.reload();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [openRequest]);

  return (
    <>
      <Dialog
        isOpen={props.isOpen}
        onClose={props.onClose}
        width={1024}
        title="Thay đổi gói dịch vụ"
      >
        <Dialog.Body>
          <div className="grid grid-cols-3 gap-8">
            <div className="grid grid-cols-2 col-span-2 gap-5">
              {DATA_SERVICE_PACKAGE.map((item, index) => (
                <ServicePackage
                  key={index}
                  infoPacket={item}
                  handleActiveMonth={handleActiveMonth}
                />
              ))}
            </div>
            <div>
              <div className="mb-5 text-lg font-semibold">Thanh toán</div>
              <Form
                onSubmit={(data) => handleSubmitRequestForm(servicePackage?.infoPacket?.plan, data)}
                defaultValues={{ activeMonth: servicePackage?.activeMonth }}
              >
                <Field name="activeMonth" label="Nhập số tháng cho gói dịch vụ">
                  <Input
                    number
                    onChange={(value) => {
                      setActiveMonth(value);
                    }}
                  />
                </Field>
                {servicePackage ? (
                  <div className="my-4">
                    <div className="my-3">Thông tin gói được chọn đăng ký</div>
                    <div className="flex flex-row items-center justify-between">
                      <div className="font-semibold">{servicePackage?.infoPacket?.packet}</div>
                      <div className="font-semibold">
                        {parseNumber(servicePackage?.infoPacket?.price)}đ / tháng
                      </div>
                    </div>

                    <div className="text-sm text-gray-400">
                      {servicePackage?.infoPacket?.description}
                    </div>
                    <div className="flex flex-row items-center justify-between my-2">
                      <div className="font-semibold">Số tháng</div>
                      <div className="font-semibold">
                        {activeMonth == 0 ? servicePackage?.activeMonth : activeMonth}
                      </div>
                    </div>
                    <div className="my-4 border-t border-gray-100"></div>
                    <div className="flex flex-row items-center justify-between my-2">
                      <div className="font-semibold">Tạm tính</div>
                      <div className="font-semibold text-primary">{parseNumber(totalMoney)}đ</div>
                    </div>
                    <div className="flex flex-row items-center justify-between my-2">
                      <div className="font-semibold">Ví tiền của bạn</div>
                      {Number(member?.wallet?.balance) > 0 ? (
                        <div className="font-semibold text-yellow-500">
                          {parseNumber(member?.wallet?.balance)}đ
                        </div>
                      ) : (
                        <Button
                          primary
                          text={`${member?.wallet?.balance}đ - Nạp tiền vào ví`}
                          onClick={() => {
                            // toast.info("Đang phát triển tính năng");
                            setOpenWalletFormDialog(true);
                          }}
                        />
                      )}
                    </div>
                    <Button text="Xác nhận" primary submit className="flex justify-end" />
                  </div>
                ) : (
                  <NotFound text="Chọn gói dịch vụ để đăng ký" />
                )}
              </Form>
            </div>
          </div>
        </Dialog.Body>
      </Dialog>
      <Dialog
        isOpen={!!openRequest}
        onClose={() => setOpenRequest(null)}
        extraBodyClass="flex flex-col items-center text-center text-gray-700 p-8"
        width="400px"
      >
        <Dialog.Body>
          <div>
            <AiOutlineCheckCircle className="mb-2 text-40" style={{ color: "#AE2070" }} />
          </div>
          <div className="mb-1 text-xl font-bold text-success" style={{ color: "#AE2070" }}>
            Yêu cầu đăng ký thành công
          </div>
          {SUBSCRIPTION_PLANS.filter((x) => x.value == openRequest?.plan).map((item, index) => (
            <div key={index}>
              <div className="font-semibold">Gói dịch vụ : {item.label}</div>
            </div>
          ))}
          {/* <div className="text-sm">
            Hãy bấm vào nút bên dưới để chuyển hướng thanh toán qua ví điện tử MoMo
          </div> */}
          <div className="flex items-center mt-4">
            {/* <img src="/assets/img/momo.png" className="w-24" /> */}
            <div className="flex-1 pl-4">
              <div>
                Phí thanh toán:{" "}
                <span className="font-semibold">{parseNumber(openRequest?.amount, true)}</span>
              </div>
              <div>
                Số tháng đăng ký : <span className="font-semibold"> {openRequest?.months}</span>
              </div>
              {/* {openRequest?.expiredAt && (
                <div>
                  Ngày hết hạn:{" "}
                  <span className="font-semibold">
                    {formatDate(openRequest?.expiredAt, "dd-MM-yyyy")}
                  </span>
                </div>
              )} */}
              {/* <a
                className="block px-4 py-2 mt-2 font-semibold text-white rounded hover:opacity-90"
                target="_blank"
                href={openRequest?.payment.meta.payUrl}
                style={{ backgroundColor: "#AE2070" }}
              >
                Thanh toán MoMo
              </a> */}
            </div>
          </div>

          <Button />
        </Dialog.Body>
      </Dialog>
      <TopUpWalletFormDialog
        isOpen={openWalletFormDialog}
        onClose={() => setOpenWalletFormDialog(false)}
      />
    </>
  );
}

function ServicePackage({ ...props }) {
  const { infoPacket, handleActiveMonth } = props;
  const [openOptionMonth, setOpenOptionMonth] = useState(false);
  const [openDetailServicePackage, setOpenDetailServicePackage] = useState(false);
  const toast = useToast();
  return (
    <>
      <div className="relative flex flex-col p-8 rounded-md bg-gray-50">
        <div className="flex flex-row items-center justify-between">
          <div className="font-semibold whitespace-nowrap">{infoPacket.packet}</div>
          <div className="font-semibold">{parseNumber(infoPacket.price)}đ/tháng</div>
        </div>
        <div className="my-2 font-semibold text-ellipsis-2 text-[13px]">
          {infoPacket.description}
        </div>
        <div className="mx-3 my-8 border-t-2 border-primary-dark"></div>
        <div className="mb-14">
          <div>Bao gồm những tính năng {infoPacket.packet}</div>
          {infoPacket.features.map((item, index) => (
            <div key={index}>
              <div className="flex flex-col my-4">
                <div className="flex flex-row items-center mt-2">
                  <span>
                    <AiFillCheckSquare className="text-gray-400 text-[24px]" />
                  </span>
                  <div className="ml-2 text-sm text-gray-400 text-ellipsis-3">{item}</div>
                </div>
              </div>
              <div className="absolute left-0 right-0 text-center bottom-2">
                <Button
                  className="w-64 px-10 h-11"
                  text="Chọn"
                  primary
                  onClick={() => {
                    setOpenOptionMonth(true);
                  }}
                />
                <div
                  className="mt-2 text-center underline cursor-pointer text-primary"
                  onClick={() => {
                    setOpenDetailServicePackage(true);
                  }}
                >
                  Xem chi tiết tính năng
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DetailServicePackage
        isOpen={openDetailServicePackage}
        onClose={() => {
          setOpenDetailServicePackage(false);
        }}
      />
      <OptionMonthServicePackageDialog
        isOpen={openOptionMonth}
        onClose={() => {
          setOpenOptionMonth(false);
        }}
        infoPacket={infoPacket}
        activeMonthServicePacket={handleActiveMonth}
      />
    </>
  );
}

function OptionMonthServicePackageDialog({
  infoPacket,
  activeMonthServicePacket,
  ...props
}: DialogProps & { infoPacket: InfoPacket; activeMonthServicePacket: any }) {
  const [activeMonth, setActiveMonth] = useState(null);

  return (
    <Dialog
      width={600}
      {...props}
      className=""
      extraBodyClass="bg-gray-100"
      title="Vui lòng chọn thời gian đăng ký gói dịch vụ"
    >
      <Dialog.Body>
        <div className="grid grid-cols-3 gap-5">
          {OPTIONS_MONTH.map((month, index) => (
            <div
              className={`${activeMonth?.activeMonth == month ? "opacity-60" : ""
                } border rounded-md cursor-pointer border-primary`}
              onClick={() => {
                setActiveMonth({ infoPacket: infoPacket, activeMonth: month });
                activeMonthServicePacket({ infoPacket: infoPacket, activeMonth: month });
                props.onClose();
              }}
              key={index}
            >
              <div className="flex flex-row items-center justify-between p-2 font-semibold text-white rounded-t-sm bg-primary">
                {month} Tháng{" "}
                {activeMonth?.activeMonth == month && (
                  <i className="text-white">
                    <AiOutlineCheck />
                  </i>
                )}{" "}
              </div>
              <div className="p-2">
                <div className="text-sm text-gray-400">
                  {parseNumber(infoPacket?.price, true)}/Tháng
                </div>
                <div className="font-semibold text-primary">
                  Tổng: <span>{parseNumber(infoPacket?.price * month, true)}</span>{" "}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
function DetailServicePackage({ ...props }: DialogProps) {
  return (
    <Dialog width={900} {...props} className="" extraBodyClass="bg-gray-100">
      <Dialog.Body>
        <div>
          <div className="flex flex-row items-center justify-between pr-3">
            <div className="font-semibold">Tính năng</div>
            <div className="flex justify-around">
              <div className="mr-5 font-semibold">Cơ bản</div>
              <div className="font-semibold">Chuyên nghiệp</div>
            </div>
          </div>
          {DATA_DEMO_DETAIL_SERVICE_PACKAGE.map((item, index) => (
            <div key={index} className="my-4 ">
              <div className="mb-3 font-semibold">{item.title}</div>
              <div className="p-3 bg-white ">
                {item.features.map((e, i) => (
                  <div
                    className={`${i % 2 == 0 ? "bg-gray-50" : ""
                      } flex flex-row items-center justify-between p-4 my-1 rounded-md `}
                    key={i}
                  >
                    <div className="w-2/3 font-medium">{e.name}</div>
                    <div className="flex item-center">
                      <div className="w-20">
                        {e.basic ? (
                          <FiCheckSquare className="text-28 text-primary" />
                        ) : (
                          <RiCheckboxBlankLine className="text-28" />
                        )}
                      </div>
                      <div className="w-20">
                        {e.pro ? (
                          <FiCheckSquare className="text-28 text-primary" />
                        ) : (
                          <RiCheckboxBlankLine className="text-28" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Dialog.Body>
    </Dialog>
  );
}
interface InfoPacket {
  packet: string;
  price: number;
  features: any;
  plan: string;
  description: string;
}
export const OPTIONS_MONTH = [6, 9, 12];

export const DATA_SERVICE_PACKAGE: InfoPacket[] = [
  {
    packet: "Cơ bản",
    price: 397000,
    plan: "BASIC",
    description: `Dễ dàng quản lý và bán hàng online 
    cho người mới khởi nghiệp kinh doanh
    `,
    features: [
      `Hệ thống bán hàng tinh gọn, dễ chốt đơn, Khuyến mãi áp dụng đồng bộ Online - Cửa hàng`,
      `Báo cáo, thống kê hiệu quả bán hàng toàn diện        `,
      `Ứng dụng quản lý bán hàng trên điện thoại        `,
      `Tự động thu thập số điện thoại, địa chỉ giao hàng và tạo hồ sơ khách hàng`,
      `Kết nối sẵn các nhà vận chuyển và cổng thanh toán online phổ biến `,
      `Tính năng affiliate bán hàng liên kết,QR Code Marketing, Chia sẻ liên kết bán hàng thông mình cho cộng tác viên `,
    ],
  },
  {
    packet: "Chuyên nghiệp",
    price: 697000,
    plan: "PROFESSIONAL",
    description: `Tăng trưởng kinh doanh online với hệ thống bán 
    hàng chuyên nghiệp và các giải pháp quản lý
    bán hàng tinh gọn hiệu quả.    
    `,
    features: [
      `Cho phép khách đánh giá đơn hàng, chat với khách `,
      "Hệ thống tích điểm và sử dụng điểm thưởng",
      `Cấu hình tên miền riêng `,
      `Bán hàng trên website Thương Mại Điện Tử 3M Shop, đẩy thêm lượt truy cập.`,
      `Phân tích tự động, Cấu hình Tracking riêng (Tiktok pixel, google pixel, facebook pixel)`,
      `Tự động hoá chương trình chăm sóc, marketing và bán lại cho từng nhóm khách hàng theo kịch bản qua Chatbot, Zalo, SMS và ZNS , Email Marketing        `,
    ],
  },
];

export const DATA_DEMO_DETAIL_SERVICE_PACKAGE = [
  {
    title: "Hệ Thống Bán Hàng Chuyên nghiệp",
    features: [
      {
        name: `Thay đổi logo màu sắc website theo thương hiệu  `,
        basic: true,
        pro: true,
      },
      {
        name: `Website app bán hàng chuyện nghiệp trên desktop và mobile        `,
        basic: true,
        pro: true,
      },
      {
        name: `Tính năng quảng cáo BANNER thông minh tích hợp video tăng tỷ lệ mua hàng     `,
        basic: true,
        pro: true,
      },
      {
        name: `Ứng dụng quản lý bán hàng trên điện thoại  iOS, Android
        `,
        basic: true,
        pro: true,
      },
      {
        name: `Kết nối sẵn các nhà vận chuyển và cổng thanh toán online phổ biến
        `,
        basic: true,
        pro: true,
      },
      {
        name: `Tạo và quản lý đơn hàng tại cửa hàng trên app quản lý mobile 
        `,
        basic: true,
        pro: true,
      },
      {
        name: `Tạo đa dạng các loại ưu đãi mã giảm giá flash Sale `,
        basic: true,
        pro: true,
      },
      {
        name: `Tạo nhóm món đề xuất tăng tỷ lệ mua hàng `,
        basic: true,
        pro: true,
      },
      {
        name: `Tạo và quản lý danh sách sản phẩm. `,
        basic: true,
        pro: true,
      },
      {
        name: `Quản lý danh sách đơn hàng, xử lý đơn hàng trên App quản lý`,
        basic: true,
        pro: true,
      },
      {
        name: `Tạo đa chi nhánh quản lý tập trung trên hệ thống        `,
        basic: true,
        pro: true,
      },
      {
        name: `Tích hợp in đơn hàng trên app quản lý         `,
        basic: true,
        pro: true,
      },
      {
        name: `Cho phép khách đánh giá đơn hàng, tăng tỷ lệ seeding sản phẩm        `,
        basic: true,
        pro: true,
      },
      {
        name: `Kết nối với tên miền riêng, SEO theo chuẩn Google       `,
        basic: false,
        pro: true,
      },
    ],
  },
  {
    title: "Phân Tích Dữ Liệu Kinh Doanh và Quản Lý Nhân Viên",
    features: [
      {
        name: `Phân tích, báo cáo dữ liệu (doanh thu, khuyến mãi sản phẩm
          top khách hàng mua nhiều nhất..v.v) chi nhánh của hàng`,
        basic: true,
        pro: true,
      },
      {
        name: `Quản lý tài khoản nhân viên không giới hạn số lượng 
        tài khoản nhân viên `,
        basic: true,
        pro: true,
      },
      {
        name: `Phân quyền nhân viên quản lý đơn hàng trên  App và Website 
        quản lý`,
        basic: true,
        pro: true,
      },
      {
        name: `Ghi nhận lịch sử thao tác nhân viên kiểm soát nội bộ`,
        basic: true,
        pro: true,
      },
      {
        name: `Thiết lập tài khoản tài xế nội bộ kiểm soát quy trình giao vận`,
        basic: true,
        pro: true,
      },
      {
        name: `Tích điểm và sử dụng điểm thưởng khi đặt hàng thường xuyên `,
        basic: true,
        pro: true,
      },
    ],
  },
  {
    title: "CRM - Quản Lý Khách Hàng ",
    features: [
      {
        name: `Phân loại khách hàng theo dữ liệu mua hàng, phân nhóm 
        khách hàng tự động theo điều kiện`,
        basic: false,
        pro: true,
      },
      {
        name: `Chăm sóc quản lý bán hàng thông qua cổng  live chat riêng `,
        basic: false,
        pro: true,
      },
      {
        name: `Quản lý khách hàng, xuất dữ liệu khách hàng`,
        basic: true,
        pro: true,
      },
      {
        name: `Quản lý lịch sử thanh toán hành vi chi tiêu khách hàng`,
        basic: true,
        pro: true,
      },
    ],
  },
  {
    title: "Social Marketing    ",
    features: [
      {
        name: `Tự động chăm sóc khách hàng dễ dàng với tin nhắn 
        thông báo đơn hàng qua SMS, Messenger`,
        basic: false,
        pro: true,
      },
      {
        name: `Tạo chiến dịch Marketing Automation tự động hoá chương trình chăm sóc, bán lại cho từng nhóm khách hàng theo kịch bản qua Chatbot, Zalo, SMS và ZNS , Email Marketing
        `,
        basic: false,
        pro: true,
      },
      {
        name: `Tạo affiliate bán hàng liên kết, chia sẻ liên kết bán hàng thông mình cho cộng tác viên, tích hợp phương thức chi trả hoa hồng qua Momo`,
        basic: false,
        pro: true,
      },
      {
        name: `SMS Marketing thương hiệu theo tên miền riêng `,
        basic: false,
        pro: true,
      },
      {
        name: `Tích hợp Google Analytics ID, Facebook Pixel ID, Tiktok pixel 
        cấu hình tracking riêng tối ưu hiệu quả chiến dịch marketing
        `,
        basic: false,
        pro: true,
      },
    ],
  },
];
