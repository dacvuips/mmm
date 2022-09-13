import { RiDeleteBin6Line, RiPhoneLine } from "react-icons/ri";
import { parseAddress } from "../../../../lib/helpers/parser";
import { ShopBranch } from "../../../../lib/repo/shop-branch.repo";
import { Button } from "../../../shared/utilities/form/button";
import { Switch } from "../../../shared/utilities/form/switch";

interface PropsType extends ReactProps {
  branch: ShopBranch;
  onClick: () => any;
  onDeleteClick: () => any;
  onToggleClick: () => any;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}
export function BranchItem({ branch, editDisabled, deleteDisabled, ...props }: PropsType) {
  return (
    <div
      className="flex items-center p-2 mb-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:border-primary group"
      onClick={props.onClick}
    >
      <div className="flex-1 pl-3">
        <div className="text-lg font-semibold text-gray-800 group-hover:text-primary">
          {branch.name}
        </div>
        <div className="text-gray-600">{parseAddress(branch)}</div>
      </div>
      <div className="px-4 text-gray-700" style={{ flexGrow: 0.5 }}>
        <div className="flex">
          <i className="mt-1 mr-1 text-lg">
            <RiPhoneLine />
          </i>
          {branch.phone}
        </div>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        data-tooltip="Mở cửa hàng"
        data-placement="top-center"
      >
        <Switch
          className="px-4"
          readOnly={editDisabled}
          value={!!branch.isOpen}
          onChange={props.onToggleClick}
        />
      </div>
      <Button
        disabled={deleteDisabled}
        icon={<RiDeleteBin6Line />}
        hoverDanger
        iconClassName="text-lg"
        onClick={async (e) => {
          e.stopPropagation();
          await props.onDeleteClick();
        }}
      />
    </div>
  );
}
