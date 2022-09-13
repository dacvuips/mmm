import { createContext, useContext, useEffect, useState } from "react";
import {
  CustomerGroupResource,
  CustomerGroupService,
} from "../../../../lib/repo/customer-group.repo";
import { Spinner } from "../../../shared/utilities/misc";
import { Condition } from "../components/customer-groups";

export const ConditionContext = createContext<
  Partial<{
    selectedCondition: Condition;
    setSelectedCondition: (condition: Condition) => any;
    conditionFieldName: string;
    setConditionFieldName: (name: string) => any;
    updatedConditionData: {
      selectedCondition: Condition;
      conditionFieldName: string;
    };
    setUpdatedConditionData: ({ selectedCondition: Condition, conditionFieldName: string }) => any;
    customerGroupResources: CustomerGroupResource[];
  }>
>({});
export function ConditionProvider(props) {
  const [selectedCondition, setSelectedCondition] = useState<Condition>();
  const [conditionFieldName, setConditionFieldName] = useState<string>();
  const [updatedConditionData, setUpdatedConditionData] = useState<{
    selectedCondition: Condition;
    conditionFieldName: string;
  }>();
  const [customerGroupResources, setCustomerGroupResources] = useState<CustomerGroupResource[]>();

  useEffect(() => {
    CustomerGroupService.getCustomerGroupResource().then((res) => {
      setCustomerGroupResources(res);
    });
  }, []);

  return (
    <ConditionContext.Provider
      value={{
        selectedCondition,
        setSelectedCondition,
        conditionFieldName,
        setConditionFieldName,
        updatedConditionData,
        setUpdatedConditionData,
        customerGroupResources,
      }}
    >
      {customerGroupResources ? props.children : <Spinner />}
    </ConditionContext.Provider>
  );
}

export const useConditionContext = () => useContext(ConditionContext);
