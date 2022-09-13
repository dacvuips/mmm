import { Children, MouseEvent, useEffect, useRef, useState } from "react";
import { HiOutlineArrowNarrowDown, HiOutlineArrowNarrowUp } from "react-icons/hi";
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiCheckboxBlankCircleFill,
  RiCheckboxCircleFill,
  RiCheckFill,
  RiCloseFill,
  RiDeleteBinLine,
  RiEdit2Line,
  RiMore2Fill,
} from "react-icons/ri";
import { formatDate, parseNumber } from "../../../../lib/helpers/parser";
import { BaseModel } from "../../../../lib/repo/crud.repo";
import { Button, ButtonProps } from "../form/button";
import { Img, ImgProps, NotFound, Spinner, StatusLabel, StatusLabelType } from "../misc";
import { Dropdown } from "../popover/dropdown";
import { useDataTable } from "./data-table";

interface TableProps extends ReactProps {
  items?: BaseModel[];
  disableDbClick?: boolean;
}

export function Table({ className = "", style = {}, ...props }: TableProps) {
  const {
    itemName,
    items,
    loadingItems,
    multiSelection,
    selectedItems,
    setSelectedItems,
    onUpdateItem,
    currentOrder,
    setCurrentOrder,
  } = useDataTable();
  const [tableItems, setTableItems] = useState<BaseModel[]>(undefined);

  const columnComponents = Children.map(props.children, (child) =>
    child?.type?.displayName === "Column" ? { child } : null
  );
  const columns = ([
    ...(multiSelection
      ? [
        {
          top: true,
          center: true,
          isSelection: true,
          width: 40,
        } as ColumnProps,
      ]
      : []),
    ...columnComponents?.map((col) => col.child.props),
  ] || []) as ColumnProps[];

  const children = Children.map(props.children, (child) =>
    !child?.type?.displayName ? { child } : null
  );

  useEffect(() => {
    setTableItems(props.items ?? items);
  }, [items, props.items]);

  const onItemClick = (item: BaseModel) => {
    if (!multiSelection) {
      setSelectedItems([item]);
    } else {
      let index = selectedItems.findIndex((x) => x.id == item.id);
      if (index >= 0) {
        selectedItems.splice(index, 1);
      } else {
        selectedItems.push(item);
      }
      setSelectedItems([...selectedItems]);
    }
  };

  const onDoubleClick = (e: MouseEvent, item) => {
    if (e.detail != 2) return;
    else {
      if (!props.disableDbClick) {
        onUpdateItem(item);
      }
    }
  };

  const onHeaderClick = (col: ColumnProps) => {
    if (col.orderBy) {
      if (currentOrder && currentOrder.property == col.orderBy) {
        switch (currentOrder.type) {
          case "asc": {
            setCurrentOrder({ property: col.orderBy, type: "desc" });
            break;
          }
          case "desc": {
            setCurrentOrder(null);
            break;
          }
        }
      } else {
        setCurrentOrder({ property: col.orderBy, type: "asc" });
      }
    }
  };

  return (
    <table
      className={`w-full border-t border-l border-r border-gray-300 border-collapse ${className}`}
      style={{ ...style }}
    >
      <thead>
        <tr className="text-sm font-semibold text-gray-600 uppercase border-b border-gray-300 bg-gray-50">
          {columns.map((col, index, arr) => (
            <th
              onClick={() => onHeaderClick(col)}
              key={col.label + index.toString()}
              className={`py-3 ${index == 0 ? "pl-3 pr-2" : index == arr.length - 1 ? "pl-2 pr-3" : "px-2"
                } ${col.orderBy ? "cursor-pointer hover:text-primary hover:underline" : ""} ${col.className || ""
                }`}
              style={{ width: col.width ? col.width + "px" : "auto" }}
            >
              <div
                className={`flex items-center relative ${col.center ? "justify-center" : col.right ? "justify-end" : "justify-start"
                  }`}
              >
                <div className="relative">
                  {col.orderBy && col.orderBy == currentOrder?.property && (
                    <i className="absolute pr-1 text-lg -left-4">
                      {currentOrder?.type == "asc" ? (
                        <HiOutlineArrowNarrowUp />
                      ) : (
                        <HiOutlineArrowNarrowDown />
                      )}
                    </i>
                  )}
                  {col.label}
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="relative">
        {loadingItems && (
          <>
            {tableItems?.length ? (
              <tr>
                <td className="border-b" colSpan={100}>
                  <Spinner className="absolute h-full py-0 max-h-44" />
                </td>
              </tr>
            ) : (
              <tr>
                <td className="border-b" colSpan={100}>
                  <Spinner className="py-20" />
                </td>
              </tr>
            )}
          </>
        )}
        {tableItems && !tableItems.length && !loadingItems && (
          <tr>
            <td className="border-b" colSpan={100}>
              <NotFound className="py-20" text={`Không tìm thấy ${itemName}`} />
            </td>
          </tr>
        )}
        {tableItems?.map((item, index) => {
          const selected = selectedItems.find((x) => x.id == item.id);
          return (
            <tr
              onClick={(e) => {
                e.stopPropagation();
                onDoubleClick(e, item);
                onItemClick(item);
              }}
              key={item.id + index.toString()}
              style={{ transitionProperty: "background-color" }}
              className={`border-b text-gray-800 text-sm duration-75 h-12 ${selected ? "bg-slate-light" : "hover:bg-gray-50"
                } ${loadingItems
                  ? "opacity-0 border-transparent pointer-events-none"
                  : `${index == tableItems.length - 1 ? "border-gray-300" : "border-gray-200"}`
                }`}
            >
              {columns.map((col, index, arr) => (
                <td
                  key={col.label + index.toString()}
                  className={`${index == 0
                      ? "py-2 pl-3 pr-2"
                      : index == arr.length - 1
                        ? "py-2 pl-2 pr-3"
                        : "p-2"
                    } ${col.center ? "text-center" : col.right ? "text-right" : "text-left"} ${col.top ? "align-top" : col.bottom ? "align-bottom" : "align-middle"
                    } ${col.className || ""}`}
                  style={{ width: col.width ? col.width + "px" : "auto" }}
                >
                  {col.isSelection && (
                    <div className="flex justify-center h-full pt-2 cursor-pointer group">
                      {selected ? (
                        <i className="text-xl text-primary group-hover:text-primary-dark">
                          <RiCheckboxCircleFill />
                        </i>
                      ) : (
                        <i className="text-xl text-slate-200 group-hover:text-slate-300">
                          <RiCheckboxBlankCircleFill />
                        </i>
                      )}
                    </div>
                  )}
                  {!!col.render && col.render(item, col)}
                </td>
              ))}
            </tr>
          );
        })}
        {children}
      </tbody>
    </table>
  );
}

interface ColumnProps extends ReactProps {
  label?: string;
  center?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
  width?: number;
  orderBy?: string;
  isSelection?: boolean;
  render?: (item: BaseModel, column?: ColumnProps) => React.ReactNode;
}
const Column = ({ children }: ColumnProps) => <>children</>;
Column.displayName = "Column";
Table.Column = Column;

interface CellProps extends ReactProps {
  value: any;
}

interface CellTextProps extends CellProps {
  subText?: any;
  subTextClassName?: string;
  image?: string;
  imageClassName?: string;
  avatar?: string;
  ratio169?: boolean;
  percent?: number;
  compress?: number;
  subTextOptions?: Option[];
  subTextIsLabel?: boolean;
}
const CellText = ({
  value,
  className = "",
  style = {},
  subText = "",
  subTextClassName = "text-sm",
  image,
  avatar,
  imageClassName = "",
  ratio169,
  percent,
  compress,
  subTextOptions,
  subTextIsLabel = false,
}: CellTextProps) => {
  let option = subTextOptions ? subTextOptions.find((option) => option.value == subText) : null;

  return (
    <div className="flex items-center">
      {(image !== undefined || avatar !== undefined) && (
        <Img
          compress={compress || 80}
          className={`w-10 mr-3 ${imageClassName}`}
          imageClassName={`border border-gray-300`}
          src={image || avatar}
          avatar={avatar !== undefined}
          showImageOnClick
          ratio169={ratio169}
          percent={percent}
        />
      )}
      <div className="flex-1">
        <div className={`${className}`} style={{ ...style }}>
          {value}
        </div>
        {subText && (
          <div className={`${subTextClassName}`}>
            {option ? (
              <span
                className={`${subTextIsLabel ? "status-label" : "status-text"} ${option?.color
                    ? subTextIsLabel
                      ? "bg-" + option.color
                      : "text-" + option.color
                    : subTextIsLabel
                      ? "bg-gray-400 text-gray-700"
                      : "text-gray-700"
                  } ${className}`}
              >
                {option?.label}
              </span>
            ) : (
              subText
            )}
          </div>
        )}
      </div>
    </div>
  );
};
CellText.displayName = "CellText";
Table.CellText = CellText;

interface CellDateProps extends CellProps {
  format?: string;
}
const CellDate = ({ value, className = "", style = {}, format = "dd-MM-yyyy" }: CellDateProps) => (
  <div className={`${className}`} style={{ ...style }}>
    {value ? formatDate(value, format) : ""}
  </div>
);
CellDate.displayName = "CellDate";
Table.CellDate = CellDate;

interface CellNumberProps extends CellProps {
  suffix?: string;
  currency?: string | boolean;
  compact?: boolean;
  percent?: boolean;
  signDisplay?: "auto" | "always" | "never";
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}
const CellNumber = ({
  value,
  className = "",
  suffix = "",
  style = {},
  currency,
  compact,
  percent,
  signDisplay,
  minimumFractionDigits,
  maximumFractionDigits,
}: CellNumberProps) => (
  <div className={`${className}`} style={{ ...style }}>
    {parseNumber(value, currency, {
      compact,
      percent,
      signDisplay,
      minimumFractionDigits,
      maximumFractionDigits,
    })}
    {suffix}
  </div>
);
CellNumber.displayName = "CellNumber";
Table.CellNumber = CellNumber;

interface CellBooleanProps extends CellProps {
  trueIcon?: JSX.Element;
  falseIcon?: JSX.Element;
  trueClassName?: string;
  falseClassName?: string;
}
const CellBoolean = ({
  value,
  className = "",
  style = {},
  trueIcon = <RiCheckFill />,
  trueClassName = "text-success",
  falseIcon = <RiCloseFill />,
  falseClassName = "text-gray-700",
}: CellBooleanProps) => (
  <div className={`flex-center ${className}`} style={{ ...style }}>
    <i className={`${value ? trueClassName : falseClassName}`}>{value ? trueIcon : falseIcon}</i>
  </div>
);
CellBoolean.displayName = "CellBoolean";
Table.CellBoolean = CellBoolean;

interface CellImageProps extends CellProps, ImgProps {
  center?: boolean;
  right?: boolean;
  compress?: number;
}
const CellImage = ({
  value,
  className = "",
  style = {},
  center,
  right,
  compress,
  ...props
}: CellImageProps) => (
  <Img
    compress={compress || 80}
    className={`flex ${center ? "mx-auto" : right ? "ml-auto" : "mr-auto"} ${className}`}
    imageClassName="border border-gray-300"
    style={{ ...style }}
    src={value}
    showImageOnClick
    {...props}
  />
);
CellImage.displayName = "CellImage";
Table.CellImage = CellImage;

interface CellStatusProps extends CellProps {
  options: Option[];
  type?: StatusLabelType;
  extraClassName?: string;
}
const CellStatus = ({
  value,
  className,
  extraClassName,
  style,
  options,
  type,
}: CellStatusProps) => {
  return (
    <StatusLabel
      className={className}
      extraClassName={extraClassName}
      style={style}
      options={options}
      value={value}
      type={type}
    />
  );
};
CellStatus.displayName = "CellStatus";
Table.CellStatus = CellStatus;

interface CellActionProps extends ReactProps { }
const CellAction = ({ className = "", style = {}, children }: CellActionProps) => {
  return (
    <div className={`flex border-group ${className}`} style={{ ...style }}>
      {children}
    </div>
  );
};
CellAction.displayName = "CellAction";
Table.CellAction = CellAction;

interface CellButtonProps extends ButtonProps {
  value: BaseModel;
  isUpdateButton?: boolean;
  isDeleteButton?: boolean;
  refreshAfterTask?: boolean;
  moreItems?: ((ButtonProps & { refreshAfterTask?: boolean }) | "divider")[];
}
const CellButton = ({
  value,
  isUpdateButton,
  isDeleteButton,
  refreshAfterTask,
  moreItems,
  className = "",
  ...props
}: CellButtonProps) => {
  const { updateItemHref, onDeleteItem, onUpdateItem, loadAll, loadingItem } = useDataTable();
  const ref = useRef();

  let icon = props.icon;
  if (!icon) {
    if (isUpdateButton) {
      icon = <RiEdit2Line />;
    } else if (isDeleteButton) {
      icon = <RiDeleteBinLine />;
    } else if (moreItems) {
      icon = <RiMore2Fill />;
    }
  }

  return (
    <>
      <Button
        icon={icon}
        innerRef={props.innerRef || ref}
        hoverDanger={isDeleteButton}
        {...props}
        className={`text-lg px-1.5 h-8 ${className}`}
        {...(isUpdateButton
          ? {
            isLoading: loadingItem == value.id,
          }
          : {})}
        href={
          props.href
            ? props.href
            : isUpdateButton && updateItemHref
              ? updateItemHref(value)
              : undefined
        }
        onClick={async (e) => {
          e.stopPropagation();
          try {
            if (props.onClick) await props.onClick(e);
            if (isUpdateButton) {
              await onUpdateItem(value);
            }
            if (isDeleteButton) {
              await onDeleteItem(value);
            }
            if (refreshAfterTask) {
              await loadAll(true);
            }
          } catch (err) { }
        }}
      />
      {moreItems && (
        <Dropdown reference={props.innerRef || ref}>
          {moreItems.map((item, index) =>
            item == "divider" ? (
              <Dropdown.Divider key={index} />
            ) : (
              <Dropdown.Item
                key={index}
                {...item}
                onClick={async (e) => {
                  try {
                    if (item.onClick) await item.onClick(e);
                    if (item.refreshAfterTask) await loadAll(true);
                  } catch (err) { }
                }}
              />
            )
          )}
        </Dropdown>
      )}
    </>
  );
};
CellButton.displayName = "CellButton";
Table.CellButton = CellButton;
