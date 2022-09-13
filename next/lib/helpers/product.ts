import { cloneDeep } from "lodash";
import { Product } from "../repo/product.repo";

export const initProductToppings = (product: Product, referenceProduct?: Product) => {
  if (!product) return {} as Product;

  const newProduct = cloneDeep(product);
  newProduct?.toppings?.forEach((topping) => {
    if (referenceProduct) {
      const tempTopping = referenceProduct?.toppings?.find((x) => x.id == topping.id);
      for (let i = 0; i < tempTopping?.options?.length; i++) {
        if (tempTopping.options[i].selected) {
          topping.options[i].selected = true;
        }
      }
    } else {
      if (topping.required || topping.min >= 1) {
        console.log(topping.options);
        for (let i = 0; i < (topping.min || 1); i++) {
          if (i >= topping?.options?.length - 1) break;
          topping.options[i].selected = true;
        }
      }
    }
    topping.selectedOptions = topping?.options.filter((x) => x.selected);
  });
  newProduct.selectedToppings = newProduct?.toppings?.reduce(
    (options, topping) => [
      ...options,
      ...topping.options
        .filter((x) => x.selected)
        .map((option) => ({
          toppingId: topping.id,
          toppingName: topping.name,
          optionName: option.name,
          price: option.price,
        })),
    ],
    []
  );
  return newProduct;
};
