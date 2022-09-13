import { useRouter } from "next/router";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import SwiperCore, { Navigation } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useDevice } from "../../../../lib/hooks/useDevice";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useCart } from "../../../../lib/providers/cart-provider";
import { CUSTOMER_LOGIN_PATHNAME, useShopContext } from "../../../../lib/providers/shop-provider";
import { Product } from "../../../../lib/repo/product.repo";
import { DialogHeader } from "../../../shared/default-layout/dialog-header";
import { CardProductItem } from "../../../shared/product/cart-product-item";
import { ProductCard } from "../../../shared/product/product-card";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button } from "../../../shared/utilities/form/button";
import { useMenusDishContext } from "../provider/menus-dish-provider";
SwiperCore.use([Navigation]);

interface Propstype extends DialogProps { }
export function MenusDishCartDialog(props: Propstype) {
  const router = useRouter();
  const { customer, shopCode } = useShopContext();
  const { setShowConfirmOrderDialog, setShowRequestOrderError } = useMenusDishContext();
  const {
    cartProducts,
    totalAmount,
    changeProductQuantity,
    totalQty,
    clearCartProducts,
  } = useCart();
  const { isMobile } = useDevice();
  const screenLg = useScreen("lg");

  return (
    <Dialog
      extraDialogClass="rounded-t-3xl lg:rounded-t"
      isOpen={props.isOpen}
      onClose={props.onClose}
      // mobileSizeMode
      bodyClass="relative bg-white rounded bg-white "
      // slideFromBottom={`${screenLg ? "none" : "all"}`}
      extraFooterClass=" z-40"
      headerClass=" "
    >
      <DialogHeader title="Giỏ hàng của bạn" onClose={props.onClose} cleanCart={true} />
      <Dialog.Body>
        <div
          className={`flex flex-col text-sm sm:text-base v-scrollbar overflow-hidden text-gray-600 ${isMobile ? "pb-12" : ""
            }`}
          style={{ maxHeight: `calc(96vh - 190px)`, minHeight: `calc(96vh - 350px)` }}
        >
          {/* <div className="flex items-center py-1 pl-4 bg-gray-200">
            <div className="flex-1 text-sm font-medium">{totalQty} sản phẩm</div>
            <Button
              text="Xóa hết"
              small
              icon={<HiOutlineTrash />}
              className="px-0"
              onClick={() => clearCartProducts()}
            />
          </div> */}
          <div className="px-4">
            {cartProducts?.map((cartProduct, index) => (
              <CardProductItem
                editable
                cartProduct={cartProduct}
                index={index}
                key={cartProduct.productId + index}
              />
            ))}
          </div>
          <UpsaleProducts />
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        <Button
          primary
          // text={`Gửi yêu cầu gọi món - ${parseNumber(totalAmount, true)}`}
          text={`Gửi yêu cầu gọi món `}
          className="z-40 w-full h-12 mb-2 font-medium text-center border-b-4 rounded-lg border-primary-dark"
          onClick={() => {
            setShowConfirmOrderDialog(true);
            // setShowRequestOrderError(true)
          }}
        />
      </Dialog.Footer>
    </Dialog>
  );
}

interface UpsaleProductProps extends ReactProps { }
export function UpsaleProducts(props: UpsaleProductProps) {
  const { shop } = useShopContext();
  const { upsaleProducts } = useCart();
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  if (!upsaleProducts?.length) return <></>;
  return (
    <div className="relative mt-auto">
      <div className="px-4 pt-2 text-sm font-medium text-gray-600">
        {shop?.config.upsaleTitle || "Ngon hơn khi ăn kèm"}
      </div>
      <Swiper
        freeMode={true}
        grabCursor
        slidesPerView={"auto"}
        className="px-2"
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
      >
        <div
          ref={navigationPrevRef}
          className="absolute left-0 w-8 pl-0 pr-2 text-gray-600 transform -translate-y-1/2 bg-white border rounded-r-full shadow cursor-pointer h-9 top-1/2 flex-center group-hover:text-primary z-100"
        >
          <i className="text-lg">
            <FaChevronLeft />
          </i>
        </div>
        <div
          ref={navigationNextRef}
          className="absolute right-0 w-8 pl-2 pr-0 text-gray-600 transform -translate-y-1/2 bg-white border rounded-l-full shadow cursor-pointer h-9 top-1/2 flex-center group-hover:text-primary z-100"
        >
          <i className="text-lg">
            <FaChevronRight />
          </i>
        </div>
        {upsaleProducts.map((item: Product, index: number) => (
          <SwiperSlide key={item.id} className="w-2/3 h-full">
            <ProductCard product={item} lazyload={false} className="mx-2" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
