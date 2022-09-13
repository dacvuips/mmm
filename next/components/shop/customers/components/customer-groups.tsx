import { unset } from 'lodash';
import { register } from 'numeral';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiCheckFill, RiCloseFill, RiCloseLine, RiDeleteBin2Line } from 'react-icons/ri';
import { validateKeyword } from '../../../../lib/constants/validate-keyword';

import { formatDate, parseNumber } from '../../../../lib/helpers/parser';
import { useAuth } from '../../../../lib/providers/auth-provider';
import { useToast } from '../../../../lib/providers/toast-provider';
import { CustomerGroup, CustomerGroupResource, CustomerGroupService } from '../../../../lib/repo/customer-group.repo';
import { Button } from '../../../shared/utilities/form/button';
import { Field } from '../../../shared/utilities/form/field';
import { Input } from '../../../shared/utilities/form/input';
import { Label } from '../../../shared/utilities/form/label';
import { List } from '../../../shared/utilities/list';
import { NotFound } from '../../../shared/utilities/misc';
import { useDataTable } from '../../../shared/utilities/table/data-table';
import { useConditionContext } from '../providers/condition-provider';
import { ConditionItemDialog, OPERATOR_ICONS, SELECT_OPERATORS } from './condition-item-dialog';

interface PropsType extends ReactProps {
  customerGroup: CustomerGroup;
  onCustomerGroupSelected: (group: CustomerGroup) => any;
  onCustomerGroupChange: () => any;
}
export function CustomerGroups({
  customerGroup,
  onCustomerGroupSelected,
  onCustomerGroupChange,
  ...props
}: PropsType) {
  const { pagination } = useDataTable();
  const {
    selectedCondition,
    setSelectedCondition,
    conditionFieldName,
    setUpdatedConditionData,
  } = useConditionContext();
  const toast = useToast();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_CUSTOMERS")

  return (
    <>
      <List<CustomerGroup>
        saveDisabled={!hasWritePermission}
        deleteDisabled={!hasWritePermission}
        formWidth="1080px"
        crudService={CustomerGroupService}
        selectedItem={customerGroup}
        onSelect={onCustomerGroupSelected}
        onChange={() => {
          onCustomerGroupChange();
        }}
        renderItem={(item, selected) => (
          <>
            <div className="flex flex-col flex-1">
              <span
                className={`font-semibold ${(item.id == null && !customerGroup) || item.id == customerGroup?.id
                  ? "text-primary"
                  : "text-gray-700 group-hover:text-primary"
                  }`}
              >
                {item.name || "Tất cả"}
              </span>
              <span className="text-sm text-gray-600">
                {item.summary >= 0 ? parseNumber(item.summary) : pagination?.total} khách hàng
              </span>
            </div>
          </>
        )}
      >
        <List.Form>
          <CustomerGroupFields />
        </List.Form>
      </List>
      <ConditionItemDialog
        isOpen={!!selectedCondition}
        onClose={() => setSelectedCondition(null)}
        onConditionChange={(data) => {
          setUpdatedConditionData({ selectedCondition: data, conditionFieldName });
          // condition.conditions.push(data);
          // onConditionChange();
        }}
      />
    </>
  );
}

function CustomerGroupFields() {
  const { watch, setValue, register } = useFormContext();
  const { updatedConditionData, setUpdatedConditionData } = useConditionContext();
  const condition = watch("filter");

  register("filter");
  useEffect(() => {
    if (!condition) {
      setValue("filter", {
        type: "group",
        conditions: [],
        logical: "$or",
      });
    }
  }, [condition]);

  useEffect(() => {
    if (updatedConditionData) {
      setValue(updatedConditionData.conditionFieldName, updatedConditionData.selectedCondition);
      setUpdatedConditionData(null);
    }
  }, [updatedConditionData]);

  return (
    <>
      <Field name="name" label="Tên nhóm khách hàng" required validation={{
        nameValidator: (val) => validateKeyword(val)
      }}>
        <Input autoFocus />
      </Field>
      <div className="col-span-full">
        <Label text="Điều kiện nhóm khách hàng" />
        <ConditionGroup name="filter" condition={condition} />
      </div>
    </>
  );
}

export interface ResourceOptions {
  periodType?: "ALL" | "D" | "W" | "M";
  period?: number;
  transactionType?: string;
  productIds?: string[];
  productGroupIds?: string[];
}

export interface Condition extends ReactProps {
  type?: "group" | "item";
  logical?: "$or" | "$nor" | "$and";
  comparison?: string;
  conditions?: Condition[];
  display?: string;
  resource?: string;
  value?: any;
  resourceOpts?: ResourceOptions;
}

interface ConditionGroupPropsType extends ReactProps {
  name: string;
  condition: Condition;
}
function ConditionGroup({ name, condition }: ConditionGroupPropsType) {
  const { setValue, getValues } = useFormContext();

  if (!condition || condition.type != "group") return <NotFound text="Chưa có điều kiện" />;
  if (!condition.conditions) condition.conditions = [];
  const { customerGroupResources } = useConditionContext();

  const { setSelectedCondition, setConditionFieldName } = useConditionContext();

  return (
    <div className="relative p-2 my-6 border border-gray-400 border-dashed shadow-sm hover:border-primary">
      <div className="absolute rounded border-group -top-4 left-4">
        {CONDITION_LOGICAL_OPTIONS.map((option) => (
          <Button
            key={option.value}
            outline
            small
            tooltip={option.label}
            placement="top"
            className={`px-1 text-xs ${condition.logical == option.value
              ? "bg-primary border-primary text-white hover-white"
              : "bg-white"
              }`}
            text={option.value.replace("$", "").toUpperCase()}
            onClick={() => {
              setValue(`${name}.logical`, option.value);
            }}
          />
        ))}
      </div>
      <div className="absolute -top-4 right-4">
        <Button
          outline
          small
          tooltip="Xoá nhóm điều kiện"
          placement="top"
          icon={<RiCloseLine />}
          className={`h-9 w-9 px-0 text-xs bg-white rounded-full`}
          onClick={() => {
            const values = getValues();
            unset(values, name);
            setValue("filter", { ...values.filter });
          }}
        />
      </div>
      <div className="p-2">
        {condition.conditions.length == 0 ? (
          <NotFound className="p-3" text="Chưa có điều kiện" />
        ) : (
          condition.conditions.map((item, index) => (
            <div key={index}>
              {item.type == "group" ? (
                <ConditionGroup name={`${name}.conditions.${index}`} condition={item} />
              ) : (
                <ConditionItem name={`${name}.conditions.${index}`} condition={item} />
              )}
            </div>
          ))
        )}
      </div>
      {/* <ConditionItemDialog
        isOpen={!!selectedCondition}
        onClose={() => setSelectedCondition(null)}
        condition={selectedCondition}
        onConditionChange={(data) => {
          condition.conditions.push(data);
          onConditionChange();
        }}
      /> */}
      <div className="absolute -bottom-4 left-4">
        <Button
          className="mr-2 bg-white"
          small
          outline
          text="Thêm điều kiện"
          onClick={() => {
            setSelectedCondition({
              resource: customerGroupResources[0].id,
            });
            setConditionFieldName(`${name}.conditions.${condition.conditions.length}`);
          }}
        />
        <Button
          className="bg-white"
          small
          outline
          text="Thêm nhóm điều kiện"
          onClick={() => {
            setValue(`${name}.conditions.${condition.conditions.length}`, {
              type: "group",
              logical: "$or",
              conditions: [],
            });
          }}
        />
      </div>
    </div>
  );
}

interface ConditionItemPropsType extends ReactProps {
  name: string;
  condition: Condition;
}
function ConditionItem({ name, condition }: ConditionItemPropsType) {
  const { customerGroupResources, setSelectedCondition } = useConditionContext();
  const [resource, setResource] = useState<CustomerGroupResource>();
  const { setValue, getValues } = useFormContext();

  useEffect(() => {
    if (customerGroupResources) {
      setResource(customerGroupResources.find((x) => x.id == condition.resource));
    }
  }, [customerGroupResources]);

  if (!customerGroupResources || !resource) return null;
  return (
    <div
      className="flex items-center justify-between my-4 border border-l-0 border-gray-400 rounded cursor-pointer group hover:border-primary"
      onClick={() => {
        setSelectedCondition(condition);
      }}
    >
      <div className="flex items-center p-3 pl-5 font-semibold text-gray-600 border-l-8 border-gray-400 min-h-10 group-hover:border-primary group-hover:text-gray-800">
        <span>{resource?.name}</span>
        {resource.type == "text" && (
          <>
            <span className="px-1 underline">bắt đầu hoặc chứa cụm từ</span>
            <span>{condition.value}</span>
          </>
        )}
        {resource.type == "number" && (
          <>
            <i className="px-2 text-sm text-gray-500">{OPERATOR_ICONS[condition.comparison]}</i>
            <span>{parseNumber(condition.value)}</span>
          </>
        )}
        {(resource.type == "select" || resource.type == "ref-multi") && (
          <>
            <span className="px-1 underline">
              {SELECT_OPERATORS.find((x) => x.value == condition.comparison)?.label}
            </span>
            <span>{condition.display}</span>
          </>
        )}
        {resource.type == "boolean" && (
          <>
            {condition.value ? (
              <span className="text-success font-semibold flex items-center gap-x-0.5 underline pl-3">
                <i>
                  <RiCheckFill />
                </i>
                Bật
              </span>
            ) : (
              <span className="text-warning font-semibold flex items-center gap-x-0.5 underline pl-3">
                <RiCloseFill />
                <i></i>Tắt
              </span>
            )}
          </>
        )}
        {resource.type == "date" && (
          <>
            <span className="px-1 underline">vào</span>
            <span>
              {condition.resourceOpts.periodType == "D"
                ? condition.resourceOpts.period + " ngày sau"
                : formatDate(condition.value, "dd-MM-yyyy")}
            </span>
          </>
        )}
        {resource.type == "address" && (
          <>
            <span className="px-1 underline">thuộc</span>
            <span>{condition.display}</span>
          </>
        )}
      </div>
      <div>
        <Button
          icon={<RiDeleteBin2Line />}
          tooltip="Xoá điều kiện"
          placement="top"
          onClick={(e) => {
            e.stopPropagation();
            const values = getValues();
            unset(values, name);
            setValue("filter", { ...values.filter });
          }}
        />
      </div>
      {/* <ConditionItemDialog
        condition={selectedCondition}
        isOpen={!!selectedCondition}
        onClose={() => setSelectedCondition(null)}
        onConditionChange={(data) => {
          onConditionChange({ ...condition, ...data });
        }}
      /> */}
    </div>
  );
}

export const CONDITION_LOGICALS = {
  $or: "Thoả 1 trong các điều kiện sau",
  $and: "Thoả tất cả điều kiện sau",
  $nor: "Không thoả 1 trong các điều kiện sau",
};
export const CONDITION_LOGICAL_OPTIONS: Option[] = Object.keys(CONDITION_LOGICALS).map((k) => ({
  label: CONDITION_LOGICALS[k],
  value: k,
}));
