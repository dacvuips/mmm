import cloneDeep from "lodash/cloneDeep";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "../../../../lib/providers/toast-provider";
import { ShopBranch, ShopBranchService } from "../../../../lib/repo/shop-branch.repo";

export const BranchesContext = createContext<
  Partial<{
    branches: ShopBranch[];
    onCreateOrUpdateBranch: (branch: Partial<ShopBranch>) => Promise<any>;
    onRemoveBranch: (branch: ShopBranch) => Promise<any>;
    onToggleBranch: (branch: ShopBranch) => Promise<any>;
    loadBranches: (reset: boolean) => Promise<any>;
  }>
>({});
export function BranchesProvider(props) {
  const [branches, setBranches] = useState<ShopBranch[]>();
  const toast = useToast();

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async (reset: boolean = false) => {
    if (reset) {
      setBranches(null);
      await ShopBranchService.clearStore();
    }
    ShopBranchService.getAll({
      query: {
        limit: 0,
        order: { createdAt: 1 },
      },
      fragment: ShopBranchService.fullFragment,
    }).then((res) => {
      setBranches(cloneDeep(res.data));
    });
  };

  const onCreateOrUpdateBranch = async (branch: Partial<ShopBranch>) => {
    if (branch.id) {
      let res = await ShopBranchService.update({ id: branch.id, data: branch, toast });
      let index = branches.findIndex((x) => x.id == branch.id);
      branches[index] = res;
      setBranches([...branches]);
    } else {
      let res = await ShopBranchService.create({ data: branch, toast });
      setBranches([...branches, res]);
    }
  };

  const onRemoveBranch = async (branch: ShopBranch) => {
    await ShopBranchService.delete({ id: branch.id });
    let index = branches.findIndex((x) => x.id == branch.id);
    branches.splice(index, 1);
    setBranches([...branches]);
  };

  const onToggleBranch = async (branch: ShopBranch) => {
    try {
      let index = branches.findIndex((x) => x.id == branch.id);
      branches[index].isOpen = !branches[index].isOpen;
      setBranches([...branches]);
      await ShopBranchService.update({
        id: branch.id,
        data: { isOpen: branches[index].isOpen },
      })
        .then((res) => {
          toast.success(`${branches[index].isOpen ? "Mở" : "Đóng"} cửa hàng thành công`);
        })
        .catch((err) => {
          toast.success(`${branches[index].isOpen ? "Mở" : "Đóng"} cửa hàng thất bại`);
          branches[index].isOpen = !branches[index].isOpen;
          setBranches([...branches]);
        });
    } catch (err) {}
  };

  return (
    <BranchesContext.Provider
      value={{
        branches,
        onCreateOrUpdateBranch,
        onRemoveBranch,
        onToggleBranch,
        loadBranches,
      }}
    >
      {props.children}
    </BranchesContext.Provider>
  );
}

export const useBranchesContext = () => useContext(BranchesContext);
