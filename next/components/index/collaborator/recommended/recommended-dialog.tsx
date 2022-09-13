import React from "react";
import { parseNumber } from "../../../../lib/helpers/parser";
import { useDevice } from "../../../../lib/hooks/useDevice";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { InvitedCustomer } from "../../../../lib/repo/collaborator.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Spinner } from "../../../shared/utilities/misc";
import { useCollaboratorContext } from "../providers/collaborator-provider";

interface RecommendedDialogProps extends DialogProps { }
export function RecommendedDialog(props: RecommendedDialogProps) {
  const { customersInvited } = useCollaboratorContext();
  const { isMobile } = useDevice();
  let screenLg = useScreen("lg");
  return (
    <Dialog width={screenLg ? 500 : 0} {...props} title={`Danh sách đã mời (${customersInvited?.length || 0})`}>
      <div
        className={`bg-white shadow relative rounded-md w-full v-scrollbar ${isMobile ? "pb-12" : ""
          }`}
        style={{ maxHeight: `calc(96vh - 150px)`, minHeight: `calc(96vh - 350px)` }}
      >
        {" "}
        {customersInvited ? (
          <>
            {customersInvited.length > 0 ? (
              <>
                {customersInvited.map((item: InvitedCustomer, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 flex items-center justify-between ${index < customersInvited.length - 1 ? "border-b" : ""
                      }`}
                  >
                    <div>
                      <span className="font-semibold">{item.name}</span>
                      <span className="px-1">-</span>
                      <span>{item.phone}</span>
                      {/* <span
                className={`px-1 rounded-full ${
                  item === "Đã mua" ? "bg-success" : "bg-trueGray"
                } text-white font-semibold`}
              >
                {item}
              </span> */}
                    </div>
                    <span className="text-lg font-bold text-success">
                      +{parseNumber(item.commission, true)}
                    </span>
                  </div>
                ))}{" "}
              </>
            ) : (
              <div className="px-4 mt-10 text-center">Chưa có lịch sử hoa hồng</div>
            )}
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </Dialog>
  );
}
