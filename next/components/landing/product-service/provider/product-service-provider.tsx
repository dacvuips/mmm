import { createContext, useContext, useEffect, useState } from "react";
import {
  SubscriptionPackage,
  SubscriptionPackageService,
} from "../../../../lib/repo/subscription-package.repo";
export const ProductServiceContext = createContext<Partial<{ packages: SubscriptionPackage[] }>>(
  {}
);

export function ProductServiceProvider(props) {
  const [packages, setPackages] = useState<SubscriptionPackage[]>();
  async function loadPost() {
    await SubscriptionPackageService.getAll()
      .then((res) => setPackages(res.data))
      .catch((err) => setPackages([]));
  }
  useEffect(() => {
    loadPost();
  }, []);

  return (
    <ProductServiceContext.Provider value={{ packages }}>
      {props.children}
    </ProductServiceContext.Provider>
  );
}

export const useProductServiceContext = () => useContext(ProductServiceContext);
