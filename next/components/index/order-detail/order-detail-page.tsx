import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { FaCamera, FaClipboardList, FaGift, FaPhone, FaStar, FaTimesCircle } from "react-icons/fa";
import { HiOutlineCamera } from "react-icons/hi";
import { RiCloseLine, RiMapPin2Fill } from "react-icons/ri";
import { Swiper, SwiperSlide } from "swiper/react";

import { formatDate, parseNumber } from "../../../lib/helpers/parser";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { OrderLog, OrderService } from "../../../lib/repo/order.repo";
import { Button } from "../../shared/utilities/form";
import { Field } from "../../shared/utilities/form/field";
import { Form, FormProps } from "../../shared/utilities/form/form";
import { ImageInput } from "../../shared/utilities/form/image-input";
import { Textarea } from "../../shared/utilities/form/textarea";
import { Img, Spinner } from "../../shared/utilities/misc";
import { RatingOrder } from "./components/rating-order";
import { UploadImages } from "./components/upload-images";
import { useOrderDetailContext } from "./providers/order-detail-provider";

export function OrderDetailPage(props) {
  const {
    order,
    status,
    setLoading,
    loading,
    showComment,
    setShowComment,
    listDiscount,
    listItems,
    discountByPoint,
    reOrderClick,
  } = useOrderDetailContext();

  const [showDetail, setShowDetail] = useState(false);
  const { shopCode, shop } = useShopContext();
  const [cancelOrder, setCancelOrder] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const [openDetailsOrder, setOpenDetailsOrder] = useState(false);
  useEffect(() => {
    if (!order) return;
    if (
      order.paymentMethod == "MOMO" &&
      order.paymentStatus == "pending" &&
      order.status !== "CANCELED"
    )
      router.push(order?.paymentMeta?.payUrl);
  }, [order]);
  const screenSm = useScreen("sm");
  const screenLg = useScreen("lg");
  const handleOpenDetailsOrders = (value: boolean) => {
    console.log("thong tin moi ra", value);
    setOpenDetailsOrder(value);
  };
  return (
    <div className={`${screenLg ? "main-container" : ""} min-h-screen bg-gray-50`}>
      {/* <div className="flex items-center w-full p-4 py-1">
        <Button
          icon={<FaChevronLeft />}
          iconClassName="text-xl text-gray-400"
          className="w-10 pl-0"
          tooltip={"L???ch s??? ????n h??ng"}
          href={`/${shopCode}/order`}
        />
        <h2 className="flex-1 text-lg font-semibold text-center">Chi ti???t ????n h??ng</h2>
        <div className="w-10"></div>
      </div> */}
      {status && order ? (
        <>
          {/* {order.status === "COMPLETED" && !order.commented && !showDetail ? (
            <>
              <div className="flex flex-col items-center pt-4">
                <Img
                  src="/assets/img/animation/Done.gif"
                  className={`w-2/3 mx-auto mb-6`}
                  contain
                />
                <div className="flex items-end justify-center w-full mb-4 text-base ">
                  <div className="text-green-600">M?? ????n h??ng:</div>
                  <div className="ml-1 font-bold text-green-600">{order.code}</div>
                </div>
                <span className="py-3 text-xl font-semibold">C???m ??n b???n ???? ?????t h??ng</span>
                <span className="font-light">????nh gi?? gi??p ch??ng t??i n??ng cao d???ch v???</span>
                <div className="flex items-center gap-4 mx-auto mt-10">
                  <Button
                    text="Xem chi ti???t ????n h??ng"
                    primary
                    className="rounded-full"
                    small={!screenSm}
                    onClick={() => setShowDetail(true)}
                  />
                  <Button
                    text="????nh gi??"
                    small={!screenSm}
                    icon={<FaStar />}
                    iconClassName="text-yellow-400"
                    primary
                    className="rounded-full"
                    onClick={() => {
                      setLoading(true);
                      setShowComment(true);
                    }}
                  />
                </div>
              </div>
            </>
          ) : ( */}
          <>
            <div className="text-sm text-gray-800 sm:text-lg">
              <div className="w-full">
                <StatusOrder openDetailsOrder={handleOpenDetailsOrders} />
                {order.cancelReason && (
                  <div className="p-4 my-2 text-gray-500 bg-gray-50">
                    L?? do h???y: {order.cancelReason || ""}
                  </div>
                )}
                {openDetailsOrder ? (
                  <div className="pb-20">
                    <div className="flex items-center px-4">
                      {/* <i className="text-xl text-success ">
                          <CgRadioChecked />
                        </i> */}
                      <div className="flex flex-col py-2 ml-2 space-y-1 sm:text-base sm:py-4">
                        <div className="flex flex-row items-center">
                          <span className="mr-2 text-gray-400">
                            <RiMapPin2Fill />
                          </span>
                          <p className="text-gray-500">
                            {order.pickupMethod === "DELIVERY" ? "G???i t???" : "L???y t???i"}
                          </p>
                        </div>

                        <p className="">
                          <span className="pr-1 font-bold text-primary">
                            {order.seller.shopName} - {order.shopBranch.name}
                          </span>
                          ({order.shopBranch.phone})
                        </p>
                        <p className="">
                          {order.shopBranch.address}, {order.shopBranch.ward},{" "}
                          {order.shopBranch.district}, {order.shopBranch.province}
                        </p>
                        {order.pickupMethod !== "DELIVERY" && (
                          <p>L???y v??o l??c: {formatDate(order.pickupTime, "dd-MM-yyyy HH:mm")}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center w-full px-6 py-2 border-t border-dashed">
                      {/* <hr className="flex-1 pt-2" /> */}
                      {order.pickupMethod === "DELIVERY" && (
                        <div className="pb-2 ml-2 text-sm font-semibold">{`${order.shipDistance} km`}</div>
                      )}
                    </div>
                    <div className="flex items-center px-4 border-b border-dashed">
                      {/* <i className="text-xl text-info ">
                          <CgRadioChecked />
                        </i> */}
                      <div className="flex flex-col pb-2 ml-2 space-y-1 sm:text-base sm:pb-4">
                        <div className="flex flex-row items-center">
                          <span className="mr-2 text-gray-400">
                            <RiMapPin2Fill />
                          </span>
                          <p className="text-gray-500">
                            {order.pickupMethod === "DELIVERY" ? "G???i ?????n" : "Ng?????i l???y"}
                          </p>
                        </div>
                        <p className="text-primary">
                          <span className="font-bold">{order.buyerName}</span> ({order.buyerPhone})
                        </p>
                        <p className="">{order.buyerFullAddress}</p>
                      </div>
                    </div>
                    <div className="px-4 border-b border-dashed">
                      <h4 className="flex items-center mt-2 font-medium">
                        <i className="pr-2 text-lg text-primary">
                          <FaClipboardList />
                        </i>
                        <span>Chi ti???t ????n h??ng</span>
                      </h4>
                      {listItems.map((item, index) => {
                        const last = listItems.length - 1 == index;
                        return (
                          <div
                            className={`flex items-start border-gray-100 py-3 ${!last && "border-b"
                              }`}
                            key={index}
                          >
                            <div className="flex items-center font-bold text-primary">
                              <div className="text-center min-w-4">{item.qty}</div>
                              <div className="px-1">X</div>
                            </div>
                            <div className="flex flex-col flex-1 text-gray-700">
                              <div className="font-semibold">{item.productName}</div>
                              {!!item.toppings.length && (
                                <div>
                                  {item.toppings.map((topping) => topping.optionName).join(", ")}
                                </div>
                              )}
                              {item.note && <div>Ghi ch??: {item.note}</div>}
                            </div>
                            <div className="font-bold">{parseNumber(item.amount, true)}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col px-4 pt-2">
                      {order.note && (
                        <div className="">
                          Ghi ch?? ????n h??ng: <span className="">{order.note}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="">
                          T???m t??nh: <span className="font-bold">{order.itemCount || 0} m??n</span>
                        </div>
                        <div className="">{parseNumber(order.subtotal, true)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="">
                          Ph?? giao h??ng: <span className="font-bold">{order.shipDistance} km</span>
                        </div>
                        <div className="">{parseNumber(order.shipfee, true)}</div>
                      </div>
                      {order.discount > 0 && order.discoun !== discountByPoint && (
                        <div className="flex items-center justify-between">
                          <div className="">
                            Khuy???n m??i: <span className="font-bold">{order.discountDetail}</span>
                          </div>
                          <div className="text-danger">
                            {order.discount > 0
                              ? parseNumber(-(order.discount - discountByPoint), true)
                              : parseNumber(order.discount, true)}
                          </div>
                        </div>
                      )}
                      {discountByPoint > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="">Gi???m gi?? ??i???m th?????ng:</div>
                          <div className="text-danger">{parseNumber(-discountByPoint, true)}</div>
                        </div>
                      )}
                      {order.rewardPoint > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="">??i???m nh???n ???????c:</div>
                          <div className="text-success">+{parseNumber(order.rewardPoint)}</div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="">T???ng c???ng:</div>
                        <div className="font-bold text-primary">
                          {parseNumber(order.amount, true)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className={`${!screenLg ? "bg-white" : ""} mt-1 `}>
                {listDiscount.length > 0 && (
                  <div className="px-4 border-b">
                    <h4 className="flex items-center h-10 mt-2 font-medium">
                      <i className="pr-2 text-lg text-primary">
                        <FaGift />
                      </i>
                      <span>M??n ???????c t???ng</span>
                    </h4>
                    {listDiscount.map((item, index) => {
                      const last = listDiscount.length - 1 == index;
                      return (
                        <div
                          className={`flex items-start border-gray-100 py-3 ${!last && "border-b"}`}
                          key={index}
                        >
                          <div className="flex items-center font-bold text-primary">
                            <div className="text-center min-w-4">{item.qty}</div>
                            <div className="px-1">X</div>
                          </div>
                          <div className="flex flex-col flex-1 text-gray-700">
                            <div className="font-semibold">{item.productName}</div>
                            {!!item.toppings.length && (
                              <div>
                                {item.toppings.map((topping) => topping.optionName).join(", ")}
                              </div>
                            )}
                            {item.note && <div>Ghi ch??: {item.note}</div>}
                          </div>
                          <div className="font-bold">{parseNumber(item.amount, true)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(order.paymentMethod == "BANK_TRANSFER" || order.paymentMethod == "MOMO") && (
                  <div className="flex items-center justify-between px-4">
                    <div className="">Thanh to??n:</div>
                    <div className="font-bold text-primary">
                      {order?.status == "CANCELED" ? (
                        <div className="text-danger">Th???t b???i</div>
                      ) : order.paymentFilledAmount >= order.amount ? (
                        <div className="text-success">Ho??n t???t</div>
                      ) : (
                        <div className="text-warning">Ch??a ho??n t???t</div>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={`${!screenLg ? "bg-white fixed bottom-0" : ""
                    }   flex flex-row items-center justify-around w-full gap-2 p-4 lg:flex-col z-100 `}
                >
                  {order.status == "PENDING" &&
                    order.paymentMethod == "BANK_TRANSFER" &&
                    order.paymentStatus == "pending" &&
                    order.paymentFilledAmount < order.amount && (
                      <Button
                        text="??i ?????n trang thanh to??n"
                        outline
                        asyncLoading={loading}
                        small={!screenSm}
                        className="my-2 rounded-full"
                        onClick={() =>
                          router.push(`/${shopCode}/order/bank-transfer/${order.code}`)
                        }
                      />
                    )}

                  {order.status === "PENDING" && (
                    <Button
                      text="G???i nh?? h??ng"
                      primary
                      href={`tel:${order.shopBranch.phone}`}
                      // small={!screenSm}
                      className="rounded-xl "
                      icon={<FaPhone />}
                    />
                  )}
                  {order.status === "CONFIRMED" && (
                    <Button
                      text="G???i nh?? h??ng"
                      primary
                      className="rounded-xl"
                      href={`tel:${order.shopBranch.phone}`}
                    // small={!screenSm}
                    />
                  )}

                  {!screenLg && order.status === "CANCELED" && (
                    <div className="grid grid-cols-2 gap-5">
                      <Button
                        text="?????t l???i ????n"
                        primary
                        className="w-full rounded-xl whitespace-nowrap"
                        asyncLoading={loading}
                        onClick={() => reOrderClick()}
                      />
                      <Button
                        text="B???n c???n h??? tr???"
                        primary
                        className="w-full rounded-xl"
                        outline
                        href={`/${shopCode}/support`}
                      />
                    </div>
                  )}
                  {order.status === "COMPLETED" &&
                    (order?.customerReceiveConfirm ? (
                      <div className="flex flex-row items-center justify-between gap-x-6 ">
                        <Button
                          text="?????t l???i ????n"
                          primary
                          className="rounded-xl"
                          asyncLoading={loading}
                          onClick={() => reOrderClick()}
                        />
                        <Button
                          text="B???n c???n h??? tr???"
                          primary
                          className="rounded-xl"
                          outline
                          href={`/${shopCode}/support`}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-row items-center justify-between gap-x-6 ">
                        <Button
                          text="???? nh???n ???????c h??ng"
                          className="rounded-xl"
                          primary
                          onClick={async () => {
                            try {
                              await OrderService.customerConfirmOrder(order?.id);
                              toast.success("X??c nh???n ???? nh???n ???????c h??ng");
                              setShowComment(true);
                            } catch (err) {
                              toast.error(err.message);
                            }
                          }}
                        />
                        <Button
                          disabled={order?.customerReceiveConfirm ? false : true}
                          text="G???i ????nh gi??"
                          className="rounded-xl"
                          primary
                          outline
                          onClick={() => {
                            setLoading(true);
                            setShowComment(true);
                          }}
                        />
                      </div>
                    ))}
                  {shop?.config?.orderConfig?.allowCancel && order.status === "PENDING" && (
                    <Button
                      text="H???y ????n h??ng"
                      outline
                      hoverDanger
                      className="rounded-xl"
                      // small={!screenSm}
                      onClick={() => setCancelOrder(true)}
                    />
                  )}
                  {order.status === "DELIVERING" && (
                    <div className="mt-2 ">
                      {order.shipMethod === "AHAMOVE" && (
                        <Button
                          text="Xem tr??n Ahamove"
                          outline
                          className="w-full rounded-xl"
                          href={order.ahamoveTrackingLink}
                        // small={!screenSm}
                        />
                      )}
                      <Button
                        text={"T??i x???: " + order.driverName || "G???i t??i x???"}
                        primary
                        className="w-full rounded-xl"
                        iconPosition="end"
                        href={`tel:${order.driverPhone}`}
                        // small={!screenSm}
                        icon={<FaPhone />}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
          {/* )} */}
        </>
      ) : (
        <Spinner />
      )}
      <Form
        extraDialogClass="rounded-t-3xl lg:rounded-lg"
        grid
        dialog
        isOpen={cancelOrder}
        onClose={() => setCancelOrder(false)}
        onSubmit={async (data) => {
          try {
            await OrderService.cancelOrder(order.id, data.note);
            setCancelOrder(false);
            toast.success("H???y ????n h??ng th??nh c??ng");
          } catch (error) {
            toast.error("H???y ????n h??ng th???t b???i " + error);
          }
        }}
        title="H???y ????n h??ng"
      >
        <Field label="L?? do h???y ????n" name="note" cols={12}>
          <Textarea placeholder="Vui l??ng cho ch??ng t??i bi???t l?? do"></Textarea>
        </Field>
        <Form.Footer />
      </Form>
      <CommentOrder isOpen={showComment} onClose={() => setShowComment(false)} />
    </div>
  );
}
function CommentOrder(props: FormProps) {
  const { tags, addTags, commentOrder, order } = useOrderDetailContext();
  const { shop } = useShopContext();
  const [imgs, setImgs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const refUpload = useRef<any>();
  const [rating, setRating] = useState(5);
  return (
    <Form
      title="B??nh lu???n ????n h??ng n??y"
      slideFromBottom="none"
      dialog
      {...props}
      onSubmit={(data) => {
        commentOrder({ rating, message: data.message, images: imgs });
        props.onClose();
      }}
    >
      <div className="flex flex-col items-center w-full v-scrollbar">
        <h3 className="text-green-600">M?? ????n h??ng: {order?.code}</h3>
        <Img src="/assets/img/star-rating.png" className="w-2/5 my-3" contain />

        <span className="font-semibold text-center text sm:text-base">C???m ??n ???? ?????t h??ng!</span>
        <span className="text-sm text-center sm:text-base">
          ????nh gi?? gi??p ch??ng t??i ????? n??ng cao ch???t l?????ng
        </span>
        <RatingOrder
          className="p-2 my-2 "
          voted={rating}
          onChange={(val) => {
            setRating(val);
          }}
        />
        <div className="my-2 " style={{ width: 300 }}>
          <Swiper className="" grabCursor spaceBetween={5} slidesPerView={2.5}>
            {shop?.config?.tags.map((tag, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`px-2 py-1 border rounded-full cursor-pointer text-ellipsis-1 hover:border-accent duration-200 transition-all ${tags.findIndex((t) => t.name === tag.name) !== -1
                      ? "bg-primary-light border-primary"
                      : ""
                    }`}
                  onClick={() => addTags(tag)}
                >
                  {tag.icon} {tag.name}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <span className="w-full py-3 font-semibold sm:pt-6">B??nh lu???n</span>
        <Field name="message" className="w-full" required>
          <Textarea placeholder="Vi???t ????nh gi??" className="text-left" />
        </Field>
        <Button
          onClick={() => {
            refUpload.current().onClick();
          }}
          className="mb-4 text-2xl rounded-full text-primary"
          icon={<HiOutlineCamera />}
          asyncLoading={uploading}
        />
        <UploadImages
          onRef={(ref) => {
            refUpload.current = ref;
          }}
          onImageUploaded={(val) => {
            setImgs(val);
          }}
          onUploadingChange={(val) => setUploading(val)}
        />
        {imgs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {imgs.map((item, index) => (
              <Img src={item} className="w-24 group" key={index} lazyload={false}>
                <Button
                  outline
                  danger
                  className="absolute w-8 h-8 px-0 transform -translate-x-1/2 bg-white rounded-full opacity-0 left-1/2 -bottom-1 group-hover:opacity-100"
                  icon={<RiCloseLine />}
                  onClick={() => {
                    imgs.splice(index, 1);
                    let newValue = [...imgs];
                    setImgs(newValue);
                  }}
                />
              </Img>
            ))}
          </div>
        )}
        <Field name="images" className="hidden w-full">
          <ImageInput multi largeImage />
        </Field>
        <Button submit text="G???i ????nh gi??" large primary className="w-full mt-4 rounded-xl" />
      </div>
    </Form>
  );
}

interface ItemStatusOrderProps {
  status?: OrderLog;
  text?: string;
  actived?: boolean;
}

function ItemStatusOrder({ status, text, actived, ...props }: ItemStatusOrderProps) {
  console.log("status", status, text, actived);
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      {actived ? (
        <i
          className={`text-lg sm:text-xl ${text == "???? h???y" || text == "Th???t b???i" ? "text-danger" : "text-primary"
            }`}
        >
          {text == "???? h???y" || text == "Th???t b???i" ? <FaTimesCircle /> : <AiFillCheckCircle />}
        </i>
      ) : (
        <i className="text-lg text-gray-300 sm:text-xl">
          <AiFillCheckCircle />
        </i>
      )}
      <div
        className={`py-1 ${actived && "font-semibold"
          } flex-1 text-left whitespace-nowrap text-primary`}
      >
        {text}
      </div>
      {status && (
        <div className="text-sm text-primary">
          {formatDate(status.updatedAt || status.createdAt, "HH:mm")}
        </div>
      )}
      {/* {
        {
          "??ang giao h??ng": (
            <div className="text-sm text-gray-300">{formatDate(status?.updatedAt, "HH:mm")}</div>
          ),
        }[text]
      } */}
    </div>
  );
}
function StatusOrder(props) {
  const { order, status } = useOrderDetailContext();

  const [pending, setPending] = useState<OrderLog>();
  const [shipping, setShipping] = useState<OrderLog>();
  const [approval, setApproval] = useState<OrderLog>();
  const [finished, setFinished] = useState<OrderLog>();
  const [failure, setFailure] = useState<OrderLog>();
  const [canceled, setCanceled] = useState<OrderLog>();
  const [showDetailsOrder, setShowDetailsOrder] = useState(false);
  useEffect(() => {
    if (order.logs) {
      order.logs.forEach((item) => {
        switch (item.statusText) {
          case "Ch??? duy???t":
            setPending(item);
            break;
          case "X??c nh???n":
            setApproval(item);
            break;
          case "??ang giao":
            setShipping(item);
            break;
          case "Ho??n th??nh":
            setFinished(item);
            break;
          case "???? hu???":
            setCanceled(item);
            break;
          case "Th???t b???i":
            setFailure(item);
            break;
        }
      });
    }
  }, [order.logs]);
  const screenSm = useScreen("sm");
  const screenLg = useScreen("lg");

  return (
    <div className="flex flex-col px-4 pb-4">
      {order?.customerReceiveConfirm ? (
        <>
          <Img
            src="/assets/img/img-complete.png"
            className={`${screenLg ? "w-32" : "w-2/3 "} mx-auto my-2`}
            contain
          />
        </>
      ) : (
        <>
          {
            {
              PENDING: (
                <Img
                  src="/assets/img/order-success.png"
                  className={`${screenLg ? "w-32" : "w-2/3 "} mx-auto`}
                  contain
                />
              ),
              CONFIRMED: (
                <Img
                  // src="/assets/img/animation/Cook.gif"
                  src="/assets/img/order-success.png"
                  className={`${screenLg ? "w-32" : "w-2/3 "} mx-auto `}
                  contain
                />
              ),
              DELIVERING: (
                <Img
                  // src="/assets/img/animation/Shipper.gif"
                  src="/assets/img/shipper.png"
                  className={`${screenLg ? "w-32" : "w-2/3 "} mx-auto`}
                  contain
                />
              ),
              CANCELED: (
                <Img
                  // src="/assets/img/animation/Sorry.gif"
                  src="/assets/img/cancel-order.png"
                  className={`${screenLg ? "w-32" : "w-2/3 "} mx-auto`}
                  contain
                />
              ),
              COMPLETED: (
                <Img
                  src="/assets/img/delivery_success.png"
                  className={`${screenLg ? "w-32" : "w-2/3 "} mx-auto`}
                  contain
                />
              ),
            }[status.value]
          }
        </>
      )}

      <div className="flex items-end justify-center w-full mb-4 text-base">
        <div className="text-green-500 ">M?? ????n h??ng:</div>
        <div className="ml-1 font-bold text-green-500 ">{order.code}</div>
      </div>
      {canceled && (
        <>
          <div className="font-semibold text-center text-sm sm:text-lg px-5">
            Ch??ng t??i r???t ti???c v?? ph???i h???y ????n
          </div>
          <div className="font-semibold text-center text-sm sm:text-lg px-5 mb-3">
            Mong qu?? kh??ch th??ng c???m!
          </div>
        </>
      )}

      <div className="flex flex-wrap items-start justify-center w-full mx-auto mt-2 text-base">
        <ItemStatusOrder
          status={pending}
          actived={
            order.status == "PENDING" ||
            order.status == "CONFIRMED" ||
            order.status == "COMPLETED" ||
            order.status == "DELIVERING"
          }
          text={order.pickupMethod == "DELIVERY" ? "???? ?????t" : "???? x??c nh???n"}
        />
        <div
          className={`py-0.5 mt-1.5 rounded-full flex-1 max-w-28 ${order.status !== "PENDING" && order.status !== "CONFIRMED" && order.status !== "FAILURE"
              ? "bg-primary"
              : "bg-gray-200"
            }`}
        ></div>

        {!canceled ? (
          <>
            {order.pickupMethod == "DELIVERY" && (
              <>
                <ItemStatusOrder
                  status={shipping}
                  actived={order.status == "COMPLETED" || order.status == "DELIVERING"}
                  text="??ang giao h??ng"
                />
                <div
                  className={`py-0.5 mt-1.5 rounded-full flex-1 max-w-28 ${order.status == "COMPLETED" ? "bg-primary" : "bg-gray-200"
                    }`}
                ></div>
              </>
            )}
            {order.status != "FAILURE" ? (
              <ItemStatusOrder
                status={finished}
                actived={order.status == "COMPLETED"}
                text={order.pickupMethod == "DELIVERY" ? "???? ?????n n??i" : "Ho??n th??nh"}
              />
            ) : (
              <ItemStatusOrder
                status={failure}
                actived={order.status == "FAILURE"}
                text="Th???t b???i"
              />
            )}
          </>
        ) : (
          <ItemStatusOrder status={canceled} actived={order.status == "CANCELED"} text="???? h???y" />
        )}
      </div>
      <div className="flex flex-col px-4 mt-2 bg-white border border-blue-100 rounded-lg">
        <div className="flex flex-row items-center justify-between py-3 border-b border-dashed">
          <div className="font-medium">Th??ng tin v???n chuy???n</div>
          <div className="font-semibold">{order.shipDistance} km</div>
        </div>
        <div className="flex flex-row items-center justify-between py-3">
          <div className="font-medium">Th??ng tin ????n h??ng</div>
          <div className="font-semibold">{parseNumber(order.amount, true)}</div>
        </div>
      </div>
      {!showDetailsOrder ? (
        <Button
          text="Xem chi ti???t ????n h??ng"
          textPrimary
          className="font-medium"
          onClick={() => {
            setShowDetailsOrder(true);
            props.openDetailsOrder(true);
          }}
        />
      ) : (
        <Button
          text="Thu g???n"
          textPrimary
          className="font-medium"
          onClick={() => {
            setShowDetailsOrder(false);
            props.openDetailsOrder(false);
          }}
        />
      )}

      {order.status === "COMPLETED" && (
        <div className="flex flex-row flex-wrap items-center justify-center px-5 text-center">
          Vui l??ng ch???n{" "}
          <span className="mx-1 font-semibold cursor-pointer ">???? nh???n ???????c h??ng</span>
          ????? ho??n th??nh ????n h??ng.
        </div>
      )}

      {/* {order.status !== "PENDING" && order.status !== "DELIVERING" && order.status !== "CONFIRMED" && (
        <div className="flex gap-3 mx-auto mt-4">
          {!order.commented && order.status == "COMPLETED" && (
            <Button
              text="????nh gi??"
              primary
              small={!screenSm}
              asyncLoading={loading}
              className="rounded-xl"
              onClick={() => setShowComment(true)}
            />
          )}
          <Button
            text="?????t l???i"
            small={!screenSm}
            primary
            asyncLoading={loading}
            className="rounded-xl"
            onClick={() => reOrderClick()}
          />
        </div>
      )} */}
    </div>
  );
}
