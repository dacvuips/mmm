import router from "next/router";
import { useEffect, useMemo, useState } from "react";
import { FaCircle, FaShoppingBasket } from "react-icons/fa";
import { HiOutlineX } from "react-icons/hi";
import { parseNumber } from "../../../lib/helpers/parser";
import { useCart } from "../../../lib/providers/cart-provider";
import { usePaymentContext } from "../../index/payment/providers/payment-provider";
import { ProductPrice } from "../product/product-price";
import { ProductRating } from "../product/product-rating";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";
import { Button } from "../utilities/form/button";
import { Img, Spinner } from "../utilities/misc";
import { ProductDetailsBanners } from "./product-details-banners";
import { useProductDetailsContext } from "./product-details-provider";
import { ProductDetailsQuantityButtons } from "./product-details-quantity-buttons";
import { ProductNote } from "./product-note";
import { ProductToppings } from "./product-toppings";

interface PropsType extends DialogProps { }
export function ProductDetailsDialog({ ...props }: PropsType) {
  const {
    isDiscountItems,
    productCode,
    editCartProductIndex,
    product,
    cartProduct,
    totalAmount,
    qty,
    setQty,
    onChangeQuantity,
  } = useProductDetailsContext();
  const { addProductToCart, updateCartProduct } = useCart();
  const { selectedVoucher, updateDiscountItem, orderInput, isGroup, isOffer } = usePaymentContext();

  const [note, setNote] = useState("");
  const [showMore, setShowMore] = useState<any>();

  const maxValue = useMemo(() => {
    let max = 0;
    if (isDiscountItems && selectedVoucher && cartProduct) {
      if (!isGroup && !isOffer) {
        const offerItem = selectedVoucher.offerItems[editCartProductIndex];
        return offerItem?.qty || 0;
      } else if (isGroup && isOffer) {
        const offerItem =
          selectedVoucher.offerItemGroups2[orderInput.offerGroupIndex]?.items[editCartProductIndex];
        return offerItem?.qty || 0;
      }
    }
    return max;
  }, [isDiscountItems, selectedVoucher, cartProduct, editCartProductIndex]);

  function checkHeight(code: string) {
    let el = document.getElementById(code);
    if (el) {
      let bounding = el.getBoundingClientRect();
      console.log(bounding.height);
      if (bounding.height > 200) {
        setShowMore(false);
      } else {
        setShowMore(undefined);
      }
    }
  }
  useEffect(() => {
    if (product) {
      checkHeight(`${product.code}-intro`);
    } else {
      setShowMore(undefined);
    }
  }, [product]);

  useEffect(() => {
    if (cartProduct) {
      setNote(cartProduct.note);
      // setQty(cartProduct?.qty);
    }
  }, [cartProduct]);

  const onClose = () => {
    const url = new URL(location.href);
    url.searchParams.delete("product");
    url.searchParams.delete("editProduct");
    url.searchParams.delete("editDiscountProduct");
    router.replace(url.toString(), null, { shallow: true });
  };

  return (
    <Dialog
      extraDialogClass="rounded-t-3xl lg:rounded-t"
      isOpen={!!(productCode || cartProduct)}
      onClose={onClose}
      // mobileSizeMode
      slideFromBottom="all"
      extraFooterClass="border-t border-gray-300 items-center"
    >
      <div className="no-scrollbar" style={{ height: `calc(100vh - 120px)` }}>
        <div
          className={`w-7 h-7 absolute right-2 top-2 z-100 rounded-full flex-center cursor-pointer bg-black hover:bg-gray-800 text-gray-300 hover:text-gray-200`}
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={() => {
            onClose();
          }}
        >
          <i className="text-xl">
            <HiOutlineX />
          </i>
        </div>
        {!product ? (
          <Spinner />
        ) : (
          <>
            <div className="relative overflow-hidden shadow-inner">
              {product.images?.length > 0 || product.youtubeLink || product.cover ? (
                <ProductDetailsBanners
                  images={product.images}
                  youtubeLink={product.youtubeLink}
                  cover={product.cover}
                />
              ) : (
                <>
                  <div className="absolute top-0 left-0 flex w-full">
                    <Img
                      lazyload={false}
                      src={product.image}
                      compress={400}
                      contain
                      className="z-50 w-3/4 mx-auto"
                    />
                  </div>
                  <Img
                    lazyload={false}
                    src={product.image}
                    compress={400}
                    percent={75}
                    imageClassName="filter blur-lg opacity-40"
                  />
                </>
              )}
            </div>

            <div className="flex flex-col bg-white border-t">
              <div className="px-4 py-3 mb-20">
                <div className="flex flex-row justify-between my-3">
                  <div>
                    {!!product.rating && (
                      <ProductRating rating={product.rating} soldQty={product.soldQty} />
                    )}
                    <div className="text-xl font-medium text-gray-700">{product.name}</div>
                  </div>
                  <ProductDetailsQuantityButtons
                    value={qty}
                    onChange={onChangeQuantity}
                    disabled={isDiscountItems && isOffer}
                    maxValue={maxValue}
                  />
                </div>
                <ProductPrice
                  price={isDiscountItems ? cartProduct?.price : product.basePrice}
                  saleRate={product.saleRate}
                  downPrice={isDiscountItems ? product.basePrice : product.downPrice}
                />

                <div className="text-sm text-gray-500">{product.subtitle}</div>
                <ProductNote className="mt-2" value={note} onChange={setNote} />
                <ProductToppings className="mt-3 border-b" />

                <div id={`${product.code}-intro`} className="pt-3 text-gray-700">
                  {product.intro && (
                    <>
                      <div className="font-medium">Mô tả sản phẩm</div>
                      <div className="relative pt-3">
                        <div
                          className={`text-sm overflow-hidden transition-all`}
                          style={{
                            maxHeight:
                              showMore !== undefined ? (showMore ? "10000px" : "80px") : "",
                          }}
                          dangerouslySetInnerHTML={{ __html: product.intro }}
                        ></div>
                        {showMore !== undefined && (
                          <div
                            className={`w-full h-16 bg-gradient-to-t from-white absolute bottom-0 left-0 pointer-events-none transition-opacity ${showMore ? "opacity-0" : "opacity-100"
                              }`}
                          ></div>
                        )}
                      </div>
                      {showMore !== undefined && (
                        <div className="flex-center">
                          <Button
                            small
                            className="w-full underline"
                            text={`${showMore ? "Thu gọn" : "Xem thêm"}`}
                            onClick={() => setShowMore(!showMore)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* <ProductDetailsQuantityButtons
                  value={qty}
                  onChange={onChangeQuantity}
                  disabled={isDiscountItems && isOffer}
                  maxValue={maxValue}
                /> */}
              </div>
              <div
                className="absolute bottom-0 flex flex-col items-center w-full px-4 py-4 mt-auto bg-white border-t"
                style={{ boxShadow: "0 -1px 2px rgba(0, 0, 0, 0.06)" }}
              >
                <Button
                  icon={cartProduct ? null : <FaShoppingBasket />}
                  iconPosition="start"
                  primary
                  text={`${cartProduct ? "Cập nhật - " : `Thêm vào giỏ hàng - `} ${parseNumber(
                    totalAmount
                  )}đ`}
                  className="w-full h-12 text-base border-b-4 shadow rounded-xl border-primary-dark whitespace-nowrap"
                  onClick={() => {
                    if (isDiscountItems) {
                      updateDiscountItem(product, qty, note, editCartProductIndex);
                    } else {
                      if (cartProduct) {
                        updateCartProduct(product, qty, note, editCartProductIndex);
                      } else {
                        addProductToCart(product, qty, note);
                      }
                    }
                    setNote("");
                    setQty(1);
                    onClose();
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
