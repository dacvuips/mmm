import { RiSearchLine } from "react-icons/ri";
import { Form, FormProps } from "../form/form";
import { Input, InputProps } from "../form/input";
import { useDataTable } from "./data-table";

interface PropsType extends ReactProps {}

export function TableToolbar({ ...props }: PropsType) {
  return <div className="flex items-center justify-between gap-x-2">{props.children}</div>;
}

const Search = ({ ...props }: InputProps) => {
  const { itemName, onSearchChange } = useDataTable();

  return (
    <Input
      style={{
        maxWidth: 250,
      }}
      clearable
      prefix={
        <i className="text-xl">
          <RiSearchLine />
        </i>
      }
      placeholder={`Tìm kiếm ${itemName}`}
      debounce={300}
      onChange={onSearchChange}
      {...props}
    />
  );
};
Search.displayName = "Search";
TableToolbar.Search = Search;

const Filter = ({ children, ...props }: FormProps) => {
  const { onFilterChange } = useDataTable();

  return (
    <Form className="flex justify-end flex-1 w-auto gap-x-2" {...props} onChange={onFilterChange}>
      {children}
    </Form>
  );
};
Filter.displayName = "Filter";
TableToolbar.Filter = Filter;

// type ButtonCompProps = ButtonProps & { isCreateButton?: boolean; isDeleteButton?: boolean };
// const ButtonComp = ({ isCreateButton, isDeleteButton, children, ...props }: ButtonCompProps) =>
//   children;
// ButtonComp.displayName = "Button";
// TableHeader.Button = ButtonComp;
