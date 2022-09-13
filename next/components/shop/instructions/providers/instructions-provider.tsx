import cloneDeep from "lodash/cloneDeep";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../../lib/providers/toast-provider";
import { ShopBranch, ShopBranchService } from "../../../../lib/repo/shop-branch.repo";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { StaffService } from "../../../../lib/repo/staff.repo";
import { DriverService } from "../../../../lib/repo/driver.repo";
import { CategoryService } from "../../../../lib/repo/category.repo";
import { ProductService } from "../../../../lib/repo/product.repo";
import { GraphService } from "../../../../lib/repo/graph.repo";

export interface InstructionStep {
  type: "phone" | "shop" | "branch" | "staff" | "driver" | "category" | "product";
  status: "pending" | "completed";
}
const INSTRUCTION_STEPS: InstructionStep[] = [
  {
    type: "shop",
    status: "pending",
  },
  {
    type: "branch",
    status: "pending",
  },
  {
    type: "staff",
    status: "pending",
  },
  {
    type: "driver",
    status: "pending",
  },
  {
    type: "category",
    status: "pending",
  },
  {
    type: "product",
    status: "pending",
  },
  {
    type: "phone",
    status: "pending",
  },
];

export const InstructionContext = createContext<
  Partial<{
    step;
    defaultValues: any;
    nextStep: () => any;
    prevStep: () => any;
    steps: InstructionStep[];
    incompleteSteps: InstructionStep[];
    handleSubmit: (data: any) => Promise<any>;
  }>
>({});
interface Props extends ReactProps {
  onComplete: () => any;
}
export function InstructionsProvider({ onComplete, ...props }: Props) {
  const { memberUpdateMe, member } = useAuth();
  const [step, setStep] = useState<number>(-1);
  const [steps, setSteps] = useState<InstructionStep[]>();
  const [defaultValues, setDefaultValues] = useState<any>({});

  const toast = useToast();

  async function initSteps() {
    const steps = cloneDeep(INSTRUCTION_STEPS);

    if (member.phoneVerified) {
      steps[0].status = "completed";
    }
    if (member.shopCover && member.shopName && member.categoryId) {
      steps[1].status = "completed";
    }
    let queries = [
      ShopBranchService.getAllQuery({
        query: {
          limit: 1,
        },
        fragment: "id",
      }),
      StaffService.getAllQuery({
        query: {
          limit: 1,
        },
        fragment: "id",
      }),
      DriverService.getAllQuery({
        query: {
          limit: 1,
        },
        fragment: "id",
      }),
      CategoryService.getAllQuery({
        query: {
          limit: 1,
        },
        fragment: "id",
      }),
      ProductService.getAllQuery({
        query: {
          limit: 1,
        },
        fragment: "id",
      }),
    ];
    await GraphService.query({
      query: queries,
    }).then((res) => {
      if (res.data["g0"].data.length) {
        steps[2].status = "completed";
      }
      if (res.data["g1"].data.length) {
        steps[3].status = "completed";
      }
      if (res.data["g2"].data.length) {
        steps[4].status = "completed";
      }
      if (res.data["g3"].data.length) {
        steps[5].status = "completed";
      }
      if (res.data["g4"].data.length) {
        steps[6].status = "completed";
      }
    });

    setSteps(steps);
    return steps;
  }

  useEffect(() => {
    if (member) {
      initSteps().then((steps) => {
        checkStep(steps);
      });
    }
  }, [member?.id]);

  const checkStep = (steps: InstructionStep[]) => {
    if (!steps) return;

    const index = steps.findIndex((x) => x.status == "pending");
    if (index < 0) {
      onComplete();
    } else {
      setStep(index);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  useEffect(() => {
    switch (step) {
      case 0: {
        setDefaultValues(member);
        break;
      }
      case 1: {
        ShopBranchService.getAll({
          query: {
            limit: 1,
          },
          fragment: ShopBranchService.fullFragment,
          toast,
        }).then((res) => {
          if (res.data[0]) {
            setDefaultValues(
              cloneDeep({
                ...res.data[0],
                longitude: res.data[0].location.coordinates[0],
                latitude: res.data[0].location.coordinates[1],
              })
            );
          } else {
            setDefaultValues({});
          }
        });
        break;
      }
      case 2:
        {
          StaffService.getAll({
            query: {
              limit: 1,
            },
            fragment: StaffService.fullFragment,
            toast,
          }).then((res) => {
            if (res.data[0]) {
              setDefaultValues(res.data[0]);
            } else {
              setDefaultValues({});
            }
          });
        }
        break;
      case 3:
        {
          DriverService.getAll({
            query: {
              limit: 1,
            },
            fragment: DriverService.fullFragment,
            toast,
          }).then((res) => {
            if (res.data[0]) {
              setDefaultValues(res.data[0]);
            } else {
              setDefaultValues({});
            }
          });
        }
        break;
      case 4:
        {
          CategoryService.getAll({
            query: {
              limit: 1,
            },
            fragment: CategoryService.fullFragment,
            toast,
          }).then((res) => {
            if (res.data[0]) {
              setDefaultValues(res.data[0]);
            } else {
              setDefaultValues({});
            }
          });
        }
        break;
      case 5:
        {
          ProductService.getAll({
            query: {
              limit: 1,
            },
            fragment: ProductService.fullFragment,
            toast,
          }).then((res) => {
            if (res.data[0]) {
              setDefaultValues(res.data[0]);
            } else {
              setDefaultValues({});
            }
          });
        }
        break;
      case 6: {
        setDefaultValues({});
        break;
      }
      default:
        {
          checkStep(steps);
        }
        break;
    }
    scroll({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleSubmit = async (data: any) => {
    try {
      switch (step) {
        case 0:
          {
            await memberUpdateMe(data);
          }
          break;
        case 1:
          {
            const res = await createOrUpdateBranch(data);
            if (!res) return;
          }
          break;
        case 2:
          {
            await StaffService.createOrUpdate({
              id: defaultValues?.id,
              data: { ...data, password: defaultValues?.id ? undefined : "123123" },
            });
          }
          break;
        case 3:
          {
            await DriverService.createOrUpdate({ id: defaultValues?.id, data });
          }
          break;
        case 4:
          {
            await CategoryService.createOrUpdate({ id: defaultValues?.id, data });
          }
          break;
        case 5:
          {
            await ProductService.createOrUpdate({ id: defaultValues?.id, data });
          }
          break;
        case 6: {
          if (!member.phoneVerified) {
            toast.info("Yêu cầu xác thực số điện thoại");
            return;
          }
          toast.success("Thiết lập cửa hàng thành công");
          break;
        }
        default:
          break;
      }
      steps[step].status = "completed";
      setSteps([...steps]);
      nextStep();
    } catch (err) {
      toast.error("Lưu thay đổi thất bại. " + err.message);
    }
  };

  const createOrUpdateBranch = async (data) => {
    if (!data.longitude || !data.latitude) {
      toast.info("Yêu cầu chọn toạ độ cửa hàng");
      return false;
    }
    const { name, phone, provinceId, districtId, wardId, address, email, coverImage } = data;
    let newData = {
      name,
      phone,
      provinceId,
      districtId,
      wardId,
      address,
      email,
      coverImage,
      location: {
        type: "Point",
        coordinates: [data.longitude, data.latitude],
      },
      isOpen: true,
    } as Partial<ShopBranch>;

    return await ShopBranchService.createOrUpdate({ id: defaultValues.id, data: newData });
  };

  return (
    <InstructionContext.Provider
      value={{
        step,
        defaultValues,
        nextStep,
        prevStep,
        steps,
        handleSubmit,
      }}
    >
      {props.children}
    </InstructionContext.Provider>
  );
}

export const useInstructionsContext = () => useContext(InstructionContext);
