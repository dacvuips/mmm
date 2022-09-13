import { useEffect, useState } from "react";
import { FaAsterisk } from "react-icons/fa";
import { RiCloseCircleLine, RiSearch2Line } from "react-icons/ri";
import KhongDau from "khong-dau";
import { ProductTopping } from "../../../../lib/repo/product-topping.repo";
import { Input } from "../../../shared/utilities/form/input";
import { NotFound, Spinner } from "../../../shared/utilities/misc";
import { useProductsContext } from "../providers/products-provider";
import { parseNumber } from "../../../../lib/helpers/parser";

interface PropsType extends ReactProps {
  onToppingSelect: (topping: ProductTopping) => any;
}
export function ToppingSelection({ onToppingSelect }: PropsType) {
  const [searchText, setSearchText] = useState("");
  const { toppings, loadToppings } = useProductsContext();
  const [filteredToppings, setFilteredToppings] = useState<ProductTopping[]>();

  useEffect(() => {
    if (toppings) {
      setFilteredToppings(
        toppings.filter((topping) => {
          if (searchText) {
            return KhongDau(topping.name).includes(KhongDau(searchText));
          } else {
            return true;
          }
        })
      );
    }
  }, [toppings, searchText]);

  useEffect(() => {
    loadToppings();
  }, []);

  return (
    <div
      className="overflow-hidden bg-white rounded"
      style={{ width: "450px", marginLeft: "-9px", marginRight: "-9px" }}
    >
      {!toppings ? (
        <Spinner />
      ) : (
        <>
          <Input
            className="border-0 no-focus"
            placeholder="Tìm kiếm topping"
            prefix={<RiSearch2Line />}
            clearable
            value={searchText}
            onChange={setSearchText}
          />
          <div className="p-4 border-t border-gray-200 v-scrollbar" style={{ height: "450px" }}>
            {!filteredToppings?.length && (
              <NotFound icon={<RiCloseCircleLine />} text="Không có mẫu topping nào" />
            )}
            {filteredToppings?.map((topping) => (
              <div
                className={`border border-gray-300 hover:border-primary hover:bg-primary-light transition-colors duration-150 shadow-sm rounded mb-2 p-3 cursor-pointer`}
                key={topping.id}
                onClick={() => onToppingSelect(topping)}
              >
                <div className="flex font-semibold text-gray-800">
                  {topping.name}
                  {topping.required && (
                    <i className="text-danger text-xs ml-1 mt-0.5">
                      <FaAsterisk />
                    </i>
                  )}
                </div>
                <div className="text-gray-600">
                  {topping.options
                    .map((option) => `${option.name} ${parseNumber(option.price, true)}`)
                    .join(", ")}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
