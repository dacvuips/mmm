import { useState } from "react";
import { FaChevronRight, FaStore } from "react-icons/fa";
import { useScreen } from "../../../../lib/hooks/useScreen";
import { useShopContext } from "../../../../lib/providers/shop-provider";
import { LocationToolbar } from "../../../shared/location/location-toolbar";
import { ShopDetailsBranchesDialog } from "./shop-details-branches-dialog";

export function ShopDetailsLocation() {
  const { selectedBranch } = useShopContext();
  const [openShopBranchs, setOpenShopBranchs] = useState(false);
  const screenLg = useScreen("lg");
  if (selectedBranch === undefined) return <></>;
  return (
    <div className={`${screenLg ? "" : "p-3"}`}>
      <div
        className={`${screenLg ? "border-b border-dashed rounded-t-lg" : "border-b border-dashed rounded-t-lg  "
          } lg:flex lg:items-center px-4 py-2.5  bg-white cursor-pointer lg:whitespace-nowrap `}
        onClick={() => setOpenShopBranchs(true)}
      >
        {screenLg && <i className="pr-2 text-lg text-primary">{<FaStore />}</i>}
        <div className={` flex items-center text-ellipsis`}>
          <span className="flex-1 text-left text-ellipsis">
            <span className="font-semibold text-gray-600">Chi nhánh: </span>
            <span className="font-normal text-gray-600 ">
              {selectedBranch ? selectedBranch.name : "Chọn cửa hàng"} -{" "}
              {selectedBranch?.distance >= 0 && `${selectedBranch.distance} km`}
            </span>
          </span>
          <i className="text-base text-gray-400 ">
            <FaChevronRight />
          </i>
        </div>
      </div>
      <ShopDetailsBranchesDialog
        isOpen={openShopBranchs}
        onClose={() => setOpenShopBranchs(false)}
      />
      <LocationToolbar />
    </div>
  );
}
