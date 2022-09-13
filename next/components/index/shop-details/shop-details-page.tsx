import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { parseNumber } from "../../../lib/helpers/parser";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useCart } from "../../../lib/providers/cart-provider";
import { CUSTOMER_LOGIN_PATHNAME, useShopContext } from "../../../lib/providers/shop-provider";
import { Button } from "../../shared/utilities/form";
import { ShopDetailCategoriesDesktop } from "./components/shop-details-categories-desktop";
import { ShopDetailsProductsGroupDesktop } from "./components/shop-details-product-group-desktop";
import { ShopDetailsActions } from "./components/shop-details-actions";
import { ShopDetailsActionsDesktop } from "./components/shop-details-actions-desktop";
import { ShopDetailsBanners } from "./components/shop-details-banners";
import { ShopDetailsCartDialog } from "./components/shop-details-cart-dialog";
import { ShopDetailsCategories } from "./components/shop-details-categories";
import { ShopDetailsInfoDesktop } from "./components/shop-details-info-desktop";
import { ShopDetailsLocation } from "./components/shop-details-location";
import { ShopDetailsProductsGroup } from "./components/shop-details-products-group";
import { ShopDetailsReactions } from "./components/shop-details-reactions";
import { ShopDetailsProvider, useShopDetailsContext } from "./providers/shop-details-provider";
import { ShopDetailsCartDesktop } from "./components/shop-details-cart-desktop";
import { PaymentContext, PaymentProvider } from "../payment/providers/payment-provider";
import { RiShoppingBasket2Line } from "react-icons/ri";
import { useCrud } from "../../../lib/hooks/useCrud";
import { ProductService } from "../../../lib/repo/product.repo";
import { ProductCard } from "../../shared/product/product-card";
import { NotFound, Spinner } from "../../shared/utilities/misc";
import { DefaulLayoutProvider } from "../../../layouts/default-layout/provider/default-layout-provider";
import { Dialog, DialogProps } from "../../shared/utilities/dialog/dialog";

export function ShopDetailsPage() {
  const router = useRouter();
  const { shop } = useShopContext();
  const screenLg = useScreen("lg");
  const { keyword } = router.query;
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  return (
    <ShopDetailsProvider>
      {screenLg ? (
        // when ui is desktop
        <PaymentProvider>
          <PaymentContext.Consumer>
            {({ isSubmitting }) => (
              <div className="min-h-screen pb-10 main-container">
                <div className="grid grid-cols-2 gap-8 py-8">
                  <div>
                    <ShopDetailsBanners banners={shop.config.banners} cover={shop.shopCover} />
                    <ShopDetailsReactions reactions={shop.config.tags} shopName={shop.shopName} />
                  </div>
                  <div>
                    <ShopDetailsLocation />
                    <ShopDetailsInfoDesktop />
                    <ShopDetailsActionsDesktop />
                  </div>
                </div>
                <div>
                  <ShopDetailsProductsGroupDesktop productGroups={shop.config.productGroups} />
                  <div className="flex justify-between py-5 my-5">
                    <div className="flex flex-row justify-between flex-1 ">
                      <ShopDetailCategoriesDesktop />
                    </div>
                    <div className="w-96 h-1/2">
                      <div className="p-5 ml-5 bg-white rounded-md w-96 ">
                        <ShopDetailsCartDesktop />
                      </div>
                      <div className="p-5 mt-5 ml-5 bg-white rounded-md w-96">
                        <div className="flex flex-row items-center justify-between mb-2 text-sm font-semibold">
                          Thông tin về các tiện ích và dịch vụ hỗ trợ
                          <span className="text-xs underline cursor-pointer text-primary" onClick={() => setOpenDetailDialog(true)}>Xem chi tiết</span>
                        </div>
                      </div>
                      <ShopDetailsPolicyInfoDialog
                        isOpen={openDetailDialog}
                        onClose={() => {
                          setOpenDetailDialog(false)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </PaymentContext.Consumer>
        </PaymentProvider>
      ) : (
        // when ui is mobile
        <DefaulLayoutProvider>
          <div className={`relative flex-1 text-gray-700`}>
            <ShopDetailsLocation />
            <ShopDetailsBanners banners={shop.config.banners} cover={shop.shopCover} />
            {/* <ShopDetailsActions /> */}
            <ShopDetailsReactions reactions={shop.config.tags} shopName={shop.shopName} />
            {keyword ? (
              <SearchProduct />
            ) : (
              <>
                <ShopDetailsProductsGroup productGroups={shop.config.productGroups} />
                <ShopDetailsCategories />
              </>
            )}
          </div>
          <CartButton />
        </DefaulLayoutProvider>
      )}
    </ShopDetailsProvider>
  );
}

function SearchProduct() {
  const router = useRouter();
  const { keyword } = router.query;
  const productCrud = useCrud(
    ProductService,
    {
      search: keyword as string,
      limit: 0,
    },
    {
      fetchingCondition: !!keyword,
    }
  );

  return (
    <div className="w-full bg-white">
      <div className="flex flex-col px-4 mb-16">
        {keyword ? (
          <>
            {productCrud.items ? (
              <>
                {!!productCrud.items.length ? (
                  <>
                    <div className="pt-6 pb-1 text-lg font-medium">
                      Tìm thấy {productCrud.items.length} sản phẩm cho "{keyword}"
                    </div>
                    {productCrud.items.map((product, index) => (
                      <ProductCard product={product} key={index} />
                    ))}
                  </>
                ) : (
                  <NotFound text={"Không có sản phẩm bạn muốn tìm"} />
                )}
              </>
            ) : (
              <Spinner />
            )}
          </>
        ) : (
          <NotFound text={"Vui lòng nhập tên sản phẩm bạn muốn tìm"} />
        )}
      </div>
    </div>
  );
}

function CartButton() {
  const { cartProducts, totalQty, totalAmount } = useCart();
  const { showDialogCart, setShowDialogCart } = useShopDetailsContext();
  const { shop, shopCode, customer, setOpenLoginDialog } = useShopContext();
  const router = useRouter();

  useEffect(() => {
    if (!cartProducts?.length) {
      setShowDialogCart(false);
    }
  }, [cartProducts]);

  return (
    <>
      {!cartProducts ||
        (!cartProducts?.length ? (
          <></>
        ) : (
          <CartFloatingButton
            onClick={() => {
              if (shop.config.orderConfig.skipCart) {
                if (customer) {
                  router.push(`${shopCode}/payment`);
                } else {
                  sessionStorage.setItem(CUSTOMER_LOGIN_PATHNAME, `${shopCode}/payment`);
                  // router.push(`${shopCode}?login=true`);
                  setOpenLoginDialog(true);
                }
              } else {
                setShowDialogCart(true);
              }
            }}
          />
        ))}
      <ShopDetailsCartDialog
        isOpen={showDialogCart}
        onClose={() => setShowDialogCart(false)}
        slideFromBottom="all"
      />
    </>
  );
}

interface CartFloatingButtonProps extends ReactProps {
  onClick?: Function;
}
function CartFloatingButton(props: CartFloatingButtonProps) {
  const { totalQty, totalAmount } = useCart();
  return (
    // <div className="sticky left-0 flex flex-col items-center w-full mt-3 bottom-5 sm:bottom-7 z-100">
    <button
      className={`rounded-xl border-1 border-b-4 border-primary-dark font-medium fixed bottom-4 z-50 left-1/2 transform -translate-x-1/2 justify-between shadow-xl flex btn-primary mx-auto w-11/12 sm:w-5/6 max-w-md h-12 animate-emerge`}
      onClick={() => {
        props.onClick();
      }}
    >
      <span>
        <i className="text-lg mb-0.5">
          <RiShoppingBasket2Line />
        </i>
        <span className="font-normal">Bạn đã chọn ({totalQty}) món</span>
      </span>
      <span className="pl-2 font-bold text-right whitespace-nowrap">
        {parseNumber(totalAmount, true)}
      </span>
    </button>
    // </div>
  );
}

function ShopDetailsPolicyInfoDialog(props: DialogProps) {
  return (
    <Dialog width={500} {...props} title="Thông tin về các tiện ích và dịch vụ hỗ trợ">
      {INFO_POLICY.map((item, index) => (
        <div key={index} className="flex flex-col p-3">
          <div className="text-sm font-semibold">{item.title}</div>
          <div
            className="text-sm ck-content"
            dangerouslySetInnerHTML={{
              __html: item.content,
            }}
          ></div>
        </div>
      ))}
    </Dialog>
  );
}

export const INFO_POLICY = [
  {
    title: "Chính sách kiểm hàng",
    content: `
    <p>
      Trước khi nhận hàng và thanh toán, người mua được được quyền kiểm tra sản phẩm, không hỗ trợ thử hàng.
    </p>
    <p>
      Người mua mở gói hàng kiểm tra để đảm bảo đơn hàng được giao đúng mẫu mã, số lượng như đơn hàng đã đặt. Không thử hay dùng thử sản phẩm. Sau khi đồng ý với món hàng được giao đến, người mua thanh toán với nhân viên giao hàng (trường hợp đơn hàng được ship COD) và nhận hàng.
    </p>
  
  `,
  },
  {
    title: "Chính sách đổi trả, hoàn tiền",
    content: `
    <p>
      Sàn Giaohang.shop không phải là nhà cung cấp sản phẩm/dịch vụ nên việc trả sản phẩm/dịch vụ sẽ được thực hiện theo chính sách của từng nhà cung cấp. 
    </p>
    <p>
      Sàn Giaohang.shop yêu cầu nhà cung cấp trình bày đầy đủ thông tin về chính sách trả hàng. 
    </p>
    <p>
      Sàn Giaohang.shop khuyến cáo khách hàng phải đọc kĩ thông tin, hoặc gọi điện trực tiếp cho nhà cung cấp tìm hiểu về việc trả hàng trước khi quyết định mua hàng. 
    </p>
    <p>
      Sàn Giaohang.shop sẽ hỗ trợ khách hàng trong khả năng cho phép về việc trả sản phẩm/dịch vụ. </p>
    <p>
      Sàn Giaohang.shop sẽ không hỗ trợ khách hàng trong việc trả sản phẩm/dịch vụ trong trường hợp tình trạng hư hỏng, mất mát của sản phẩm/dịch vụ không do Sàn Giaohang.shop hoặc phía nhà cung cấp.
    </p>
  `,
  },
];
