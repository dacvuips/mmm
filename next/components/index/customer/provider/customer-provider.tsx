import { createContext, useContext, useEffect, useState } from "react";
import {
  Customer,
  CustomerService,
  CustomeUpdateMeInput,
} from "../../../../lib/repo/customer.repo";
import { useToast } from "../../../../lib/providers/toast-provider";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { cloneDeep } from "lodash";
import { Spinner } from "../../../shared/utilities/misc";
export const CustomerContext = createContext<
  Partial<{
    customerUpdateMe: (data: CustomeUpdateMeInput) => Promise<any>;
    pageCustomer: Customer;
    setPageCustomer: (customer: Customer) => any;
  }>
>({});

export function CustomerProvider(props) {
  const { customer, setCustomer } = useShopContext();
  const [pageCustomer, setPageCustomer] = useState<Customer>();

  const customerUpdateMe = async (data: CustomeUpdateMeInput) => {
    return CustomerService.mutate({
      mutation: `
        customerUpdateMe(data: $data) {
          ${CustomerService.fullFragment}
        }
      `,
      variablesParams: `($data: CustomeUpdateMeInput!)`,
      options: {
        variables: {
          data,
        },
      },
    })
      .then((res) => {
        setCustomer(res.data.g0 as Customer);
        setPageCustomer(res.data.g0);
        return res.data.g0;
      })
      .catch((err) => {
        throw err;
      });
  };

  // async function getCustomer() {
  //   let res = await CustomerService.getCustomer();
  //   setCustomerHere(res);
  // }
  useEffect(() => {
    if (customer) {
      setPageCustomer(cloneDeep(customer));
    }
  }, [customer]);
  return (
    <CustomerContext.Provider value={{ customerUpdateMe, pageCustomer, setPageCustomer }}>
      {pageCustomer ? <>{props.children}</> : <Spinner />}
    </CustomerContext.Provider>
  );
}

export const useCustomerContext = () => useContext(CustomerContext);
