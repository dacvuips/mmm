import { useState } from "react";
import { FaHome, FaSearch } from "react-icons/fa";
import { useCrud } from "../../../lib/hooks/useCrud";
import { useShopContext } from "../../../lib/providers/shop-provider";
import { ProductService } from "../../../lib/repo/product.repo";
import { ProductCard } from "../../shared/product/product-card";
import { Button } from "../../shared/utilities/form/button";
import { Input } from "../../shared/utilities/form/input";
import { NotFound, Spinner } from "../../shared/utilities/misc";

export function SearchPage() {
  const { shopCode } = useShopContext();
  const [searchText, setSearchText] = useState("");
  const productCrud = useCrud(
    ProductService,
    {
      search: searchText,
      limit: 0,
    },
    {
      fetchingCondition: !!searchText
    }
  );

  return (
    <div className="relative min-h-screen p-4 bg-white">
      <div className="flex items-center">
        <Button
          icon={<FaHome />}
          iconClassName="text-xl"
          className="w-10 pl-0 pr-2 sm:pr-3"
          href={`/${shopCode}`}
        />
        <Input
          className="flex-1"
          clearable
          prefix={
            <i className="text-xl">
              <FaSearch />
            </i>
          }
          placeholder={`Tìm kiếm sản phẩm`}
          debounce={500}
          value={searchText}
          onChange={setSearchText}
        />
      </div>

      <div className="w-full">
        {searchText ? (
          <>
            {productCrud.items ? (
              <>
                {!!productCrud.items.length ? (
                  <>
                    <div className="pt-6 pb-1 text-lg font-medium">
                      Tìm thấy {productCrud.items.length} sản phẩm cho "{searchText}"
                    </div>
                    {productCrud.items.map((product, index) => (
                      <ProductCard product={product} key={index} />
                    ))}
                  </>
                ) : (
                  <NotFound text={"Vui lòng nhập tên sản phẩm bạn muốn tìm"} />
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
