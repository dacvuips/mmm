import { createContext, useContext, useEffect, useState } from "react";
import { ShopRegistrationService } from "../../../lib/repo/shop-registration.repo";
import { WithdrawRequestService } from "../../../lib/repo/withdraw-request.repo";

export const AdminLayoutContext = createContext<
  Partial<{
    pendingRegistrations: number;
    checkPendingRegistrations: () => Promise<any>;
    pendingWithdrawRequest: number;
    checkPendingWithdrawRequest: () => Promise<any>;
  }>
>({});
export function AdminLayoutProvider(props) {
  const [pendingRegistrations, setPendingRegistrations] = useState(0);
  const [pendingWithdrawRequest, setPendingWithdrawRequest] = useState(0);

  useEffect(() => {
    checkPendingRegistrations();
    checkPendingWithdrawRequest();
  }, []);

  const checkPendingRegistrations = async () => {
    await ShopRegistrationService.getAll({
      query: { limit: 0, filter: { status: "PENDING" } },
      fragment: "id",
      cache: false,
    }).then((res) => {
      setPendingRegistrations(res.total);
    });
  };

  const checkPendingWithdrawRequest = async () => {
    await WithdrawRequestService.getAll({
      query: { limit: 0, filter: { status: "PENDING" } },
      fragment: "id",
      cache: false,
    }).then((res) => {
      setPendingWithdrawRequest(res.total);
    });
  };

  return (
    <AdminLayoutContext.Provider
      value={{
        pendingRegistrations,
        checkPendingRegistrations,
        pendingWithdrawRequest,
        checkPendingWithdrawRequest,
      }}
    >
      {props.children}
    </AdminLayoutContext.Provider>
  );
}

export const useAdminLayoutContext = () => useContext(AdminLayoutContext);
