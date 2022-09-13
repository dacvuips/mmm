import router from "next/router";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { parseNumber } from "../../../lib/helpers/parser";
import { useCart } from "../../../lib/providers/cart-provider";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { usePaymentContext } from "../../index/payment/providers/payment-provider";
import { ProductDetailsBanners } from "../product-details/product-details-banners";
import { useProductDetailsContext } from "../product-details/product-details-provider";
import { ProductDetailsQuantityButtons } from "../product-details/product-details-quantity-buttons";
import { ProductNote } from "../product-details/product-note";
import { ProductToppings } from "../product-details/product-toppings";
import { ProductPrice } from "../product/product-price";
import { ProductRating } from "../product/product-rating";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";
import { Button } from "../utilities/form/button";
import { Img, Spinner } from "../utilities/misc";

interface PropsType extends DialogProps { }
export function ProductDetailsDialogDesktop({ ...props }: PropsType) {
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
  const { isOpenShop } = useShopContext();
  const toast = useToast();

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
      width={"800px"}
      isOpen={!!(productCode || cartProduct)}
      onClose={onClose}
      extraFooterClass=" items-center rounded-2xl"
    >
      <div className="p-5 rounded-2xl no-scrollbar">
        <div
          className={`w-7 h-7 absolute right-5 top-2 z-100 rounded-full flex-center cursor-pointer text-gray-800`}
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
            <div className="mt-8">
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
                        compress={200}
                        contain
                        className="z-50 w-2/4 mx-auto"
                      />
                    </div>
                    <Img
                      lazyload={false}
                      src={product.image}
                      compress={200}
                      percent={50}
                      imageClassName="filter blur-lg opacity-40"
                    />
                  </>
                )}
              </div>
              <div className="my-5">
                <div className="text-xl font-medium text-gray-700">{product.name}</div>
                <div className="flex flex-row items-center gap-5">
                  <ProductPrice
                    price={isDiscountItems ? cartProduct?.price : product.basePrice}
                    saleRate={product.saleRate}
                    downPrice={isDiscountItems ? product.basePrice : product.downPrice}
                  />
                  {!!product.rating && (
                    <ProductRating rating={product.rating} soldQty={product.soldQty} />
                  )}
                </div>
                <div className="text-gray-500 ">{product.subtitle}</div>
              </div>
            </div>

            <div className="flex flex-col bg-white">
              <div>
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
                <ProductNote className="mt-2" value={note} onChange={setNote} />

                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-row items-center justify-start">
                    <div className="mr-3 font-semibold text-primary text-[20px] ">
                      {parseNumber(totalAmount)}đ
                    </div>
                    <ProductDetailsQuantityButtons
                      value={qty}
                      onChange={onChangeQuantity}
                      disabled={isDiscountItems && isOffer}
                      maxValue={maxValue}
                    />
                  </div>
                  <div
                    className="sticky bottom-0 flex flex-col items-center py-4 mt-auto bg-white"
                    style={{ boxShadow: "0 -1px 2px rgba(0, 0, 0, 0.06)" }}
                  >
                    <Button
                      primary
                      text={`${cartProduct ? "Cập nhật" : "Thêm vào giỏ hàng "}`}
                      className="h-12 shadow rounded-xl border-primary-dark whitespace-nowrap"
                      onClick={() => {
                        if (isOpenShop) {
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
                        } else {
                          toast.warn("Cửa hàng hiện tại đang đóng cửa vui lòng chờ!");
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
