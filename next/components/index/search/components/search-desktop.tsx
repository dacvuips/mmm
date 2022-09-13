import Link from "next/link";
import { useState } from "react";
import { FaCircle } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useCrud } from "../../../../lib/hooks/useCrud";
import { ProductService } from "../../../../lib/repo/product.repo";
import { Input } from "../../../shared/utilities/form";
import { Img, NotFound, Spinner } from "../../../shared/utilities/misc";

export function SearchDesktop() {
  const [searchText, setSearchText] = useState("");

  const productCrud = useCrud(
    ProductService,
    {
      search: searchText,
      limit: 5,
    },
    {
      fetchingCondition: !!searchText,
    }
  );

  console.log("productCrud", productCrud.items);
  return (
    <>
      <div className="relative mb-1">
        <Input
          className=""
          placeholder="Bạn muốn tìm đồ ăn gì ?"
          prefix={
            <>
              <FiSearch />
            </>
          }
          prefixClassName="text-2xl"
          value={searchText}
          onChange={setSearchText}
          clearable
        />
      </div>
      {searchText != "" && (
        <div className="absolute left-0 w-full px-3 py-5 bg-white rounded-md shadow-lg top-10 z-100">
          {productCrud?.items ? (
            productCrud?.items?.length > 0 ? (
              productCrud?.items.map((product, index) => (
                <Link
                  href={{
                    pathname: `/${product?.member?.code}`,
                    query: { product: product.code },
                  }}
                  key={index}
                >
                  <a>
                    <div className="flex flex-row items-center justify-between py-2 border-b">
                      <div className="flex flex-row items-center w-4/5">
                        <Img
                          src={`${product?.image ? product?.image : "/assets/default/default.png"}`}
                          className="object-cover rounded-sm w-14"
                          alt="image-product"
                        />
                        <div className="flex-1 ml-3 overflow-hidden">
                          <div className="text-gray-700 text-ellipsis-1">{product?.name}</div>
                          <div className="text-gray-400 text-[12px] text-ellipsis-1">
                            {product?.member?.code} - {product?.member?.ward} -
                            {product?.member?.district} - {product?.member?.province}
                          </div>
                          <div className="text-gray-400 text-[12px] text-ellipsis-1">
                            {product?.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 ml-5">
                        {product?.allowSale ? (
                          <span className="flex items-center text-green-500 text-[12px]">
                            Mở cửa <FaCircle className="ml-2" />
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[12px]">Đóng cửa</span>
                        )}
                      </div>
                    </div>
                  </a>
                </Link>
              ))
            ) : (
              <NotFound text="Không có sản phẩm cần tìm" />
            )
          ) : (
            <Spinner />
          )}

          <div className="flex flex-row items-center justify-start p-2 bg-gray-50">
            <span className="p-2 mr-2 text-white rounded-full bg-primary">
              <FiSearch className="" />
            </span>{" "}
            Tìm kiếm kết quả cho{" "}
            <span className="ml-2 font-semibold text-primary">{searchText}</span>
          </div>
        </div>
      )}
    </>
  );
}
