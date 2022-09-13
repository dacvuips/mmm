import cloneDeep from "lodash/cloneDeep";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { CollaboratorService, InvitedCustomer } from "../../../../lib/repo/collaborator.repo";
import { CommissionLog, CommissionLogService } from "../../../../lib/repo/commission.repo";
import { Customer, CustomerService } from "../../../../lib/repo/customer.repo";
export const CollaboratorContext = createContext<
  Partial<{
    collaborator: Customer;
    commissions: CommissionLog[];
    customersInvited: InvitedCustomer[];
    setFromDate: Function;
    setToDate: Function;
    total: number;
    fromDate: Date;
    toDate: Date;
    submitCustomerMomoWallet: ({ name, idCard }) => Promise<any>;
  }>
>({});

export function CollaboratorProvider(props) {
  const { customer } = useShopContext();
  const [collaborator, setCollaborator] = useState<Customer>();
  let [commissions, setCommissions] = useState<CommissionLog[]>();
  let [customersInvited, setCustomersInvited] = useState<InvitedCustomer[]>();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [total, setTotal] = useState(-1);
  const filter = useMemo(() => {
    let tempFilter = {};
    if (fromDate || toDate) {
      tempFilter["updatedAt"] = {};
      if (fromDate) {
        tempFilter["updatedAt"]["$gte"] = fromDate;
      }
      if (toDate) {
        tempFilter["updatedAt"]["$lte"] = toDate;
      }
    }
    return tempFilter;
  }, [fromDate, toDate]);
  useEffect(() => {
    if (!filter) return;
    if (filter["updatedAt"]) {
      setTotal(null);
      CommissionLogService.getAll({
        query: {
          limit: 0,
          filter,
        },
      }).then((res) => {
        setCommissions(cloneDeep(res.data));
        setTotal(res.data.reduce((total, item) => total + item.value, 0));
      });
    } else {
      setTotal(-1);
    }
  }, [filter]);
  async function getCommissions() {
    CommissionLogService.getAll({ query: { order: { createdAt: -1 } }, cache: false })
      .then((res) => setCommissions(res.data))
      .catch((err) => console.error(err));
  }
  async function getAllCustomerInvited() {
    if (customer && customer.id) {
      CollaboratorService.getAllInvitedCustomers(customer.id)
        .then((res) => setCustomersInvited(res.data))
        .catch((err) => console.error(err));
    }
  }
  useEffect(() => {
    if (!customer) return;
    if (customer.isCollaborator) {
      loadCollaborator();
      getCommissions();
      getAllCustomerInvited();
    }
  }, [customer]);

  const loadCollaborator = () => {
    CustomerService.getCustomer()
      .then((res) => {
        setCollaborator(res);
      })
      .catch((err) => console.error(err));
  };

  const submitCustomerMomoWallet = async ({ name, idCard }) => {
    await CustomerService.submitCustomerMomoWallet({ name, idCard });
    loadCollaborator();
  };

  return (
    <CollaboratorContext.Provider
      value={{
        commissions,
        customersInvited,
        collaborator,
        setFromDate,
        setToDate,
        total,
        fromDate,
        toDate,
        submitCustomerMomoWallet,
      }}
    >
      {props.children}
    </CollaboratorContext.Provider>
  );
}

export const useCollaboratorContext = () => useContext(CollaboratorContext);
