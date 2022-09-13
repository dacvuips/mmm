import KhongDau from "khong-dau";
import { useEffect, useState } from "react";
import { RiCloseCircleLine, RiSearch2Line } from "react-icons/ri";
import { parseNumber } from "../../../lib/helpers/parser";
import { Product, ProductService } from "../../../lib/repo/product.repo";
import { OfferItem } from "../../../lib/repo/shop-voucher.repo";
import { Input } from "../utilities/form/input";
import { NotFound, Img, Spinner } from "../utilities/misc";
import { Popover, PopoverProps } from "../utilities/popover/popover";

interface PropsType extends PopoverProps {
  onProductSelect: (product: Product) => any;
  items?: OfferItem[];
}
export function ProductSelectionPopover({ onProductSelect, items = [], ...props }: PropsType) {
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState<Product[]>();
  const [filterProducts, setFilterProducts] = useState<Product[]>();

  useEffect(() => {
    if (products) {
      setFilterProducts(
        products.filter((product) => {
          if (searchText) {
            return KhongDau(product.name).includes(KhongDau(searchText));
          } else {
            return true;
          }
        })
      );
    }
  }, [products, searchText]);
  async function loadProduct() {
    if (items.length > 0) {
      ProductService.getAll({
        query: { limit: 0, filter: { _id: { __nin: items.map((item) => item.productId) } } },
        fragment: "id image name basePrice",
      })
        .then((res) => setProducts(res.data))
        .catch((err) => console.error(err));
    } else {
      ProductService.getAll({
        query: { limit: 0 },
        fragment: "id image name basePrice",
      })
        .then((res) => setProducts(res.data))
        .catch((err) => console.error(err));
    }
  }
  useEffect(() => {
    loadProduct();
  }, [items]);

  return (
    <Popover trigger="click" arrow={true} placement="auto-start" {...props}>
      {!products ? (
        <Spinner />
      ) : (
        <div style={{ width: "450px", marginLeft: "-9px", marginRight: "-9px" }}>
          <Input
            className="border-0 no-focus"
            placeholder="Tìm kiếm sản phẩm"
            prefix={<RiSearch2Line />}
            clearable
            value={searchText}
            onChange={setSearchText}
          />
          <div className="p-4 border-t border-gray-200 v-scrollbar" style={{ height: "450px" }}>
            {!filterProducts?.length && (
              <NotFound icon={<RiCloseCircleLine />} text="Không có mẫu topping nào" />
            )}
            {filterProducts?.map((product) => (
              <div
                className={`flex items-center border border-gray-300 hover:border-primary hover:bg-primary-light transition-colors duration-150 shadow-sm rounded mb-2 p-3 cursor-pointer`}
                key={product.id}
                onClick={() => {
                  onProductSelect(product);
                  (props.reference.current as any)._tippy.hide();
                }}
              >
                <Img className="w-12" src={product.image} compress={50} />
                <div className="pl-3 font-semibold">
                  <div className="text-gray-800">{product.name}</div>
                  <div className="text-danger">{parseNumber(product.basePrice, true)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Popover>
  );
}
