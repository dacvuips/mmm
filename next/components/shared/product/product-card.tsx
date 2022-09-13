import Link from "next/link";
import { useEffect, useState } from "react";
import { useScreen } from "../../../lib/hooks/useScreen";
import { useCart } from "../../../lib/providers/cart-provider";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { Product, ProductService } from "../../../lib/repo/product.repo";
import { useShopDetailsContext } from "../../index/shop-details/providers/shop-details-provider";
import { ProductImg } from "./product-img";
import { ProductPrice } from "./product-price";
import { ProductQuantityButtons } from "./product-quantity-buttons";
import { ProductRating } from "./product-rating";

interface Props extends ReactProps {
  product: Product;
  hasQuantityButtons?: boolean;
  lazyload?: boolean;
  hasLabel?: boolean;
}
export function ProductCard({
  product,
  hasQuantityButtons = false,
  className = "",
  lazyload = true,
  hasLabel = false,
  style = {},
  ...props
}: Props) {
  const { cartProducts, changeProductQuantity, addToCartNoTopping } = useCart();
  const { setShowDialogCart } = useShopDetailsContext();
  const { shopCode } = useShopContext();
  const screenLg = useScreen("lg");
  let [productQty, setProductQty] = useState(0);

  useEffect(() => {
    if (!cartProducts) return;
    productQty = 0;
    cartProducts.forEach((item) => {
      if (item.productId === product.id) productQty += item.qty;
    });
    setProductQty(productQty);
  }, [cartProducts]);

  return (
    <Link
      href={{
        pathname: `/${shopCode}`,
        query: { product: product.code },
      }}
      shallow
    >
      <a className={`block py-3 transition border-gray-100 cursor-pointer hover:text-primary-dark ${className}`}>
        <div className="flex">
          <div className={`relative`}>
            <ProductImg
              src={product.image}
              className="w-20 rounded-sm xs:w-24 sm:w-28"
              compress={120}
              saleRate={product.saleRate}
              lazyload={lazyload}
            />
          </div>
          <div className="flex flex-col justify-start flex-1 pl-3 leading-6 min-h-24">
            <span className="text-sm font-semibold products-start text-ellipsis-2 ">{product.name}</span>
            {!!product.rating && (
              <ProductRating rating={product.rating} soldQty={product.soldQty} />
            )}
            {screenLg && product.subtitle && (
              <span className="text-sm text-gray-500 text-ellipsis-2">{product.subtitle}</span>
            )}
            {hasLabel && (
              <div className="flex flex-wrap gap-2 mt-0.5">
                {product.labels?.map((label, index) => (
                  <div
                    className="px-2.5 py-0.5 text-xs font-semibold text-white rounded cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: label.color }}
                    key={index}
                  >
                    <span>{label.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col mt-auto mb-0">
              <div className="flex flex-wrap">
                <ProductPrice price={product.basePrice} downPrice={product.downPrice} />
                {hasQuantityButtons && (
                  <ProductQuantityButtons
                    className="ml-auto mr-0 transform translate-x-2"
                    quantity={productQty}
                    hasToppings={!!product.toppings?.length}
                    onAdd={() => {
                      let index = cartProducts.findIndex((item) => item.productId === product.id);
                      if (index !== -1) {
                        changeProductQuantity(index, cartProducts[index].qty + 1);
                      } else {
                        ProductService.getOne({ id: product.id }).then((res) => {
                          addToCartNoTopping(res, 1);
                        });
                      }
                    }}
                    onMinus={() => {
                      setShowDialogCart(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
