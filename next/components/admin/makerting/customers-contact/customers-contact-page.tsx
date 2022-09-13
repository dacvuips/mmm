import { RiEyeLine } from "react-icons/ri";
import {
  CustomerContact,
  CustomerContactService,
  CUSTOMER_CONTACT_STATUS,
} from "../../../../lib/repo/customer-contact";
import { Field, Form, Input, Select, Textarea } from "../../../shared/utilities/form";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";

export function CustomerContactPage() {
  return (
    <Card className="max-w-5xl">
      <DataTable<CustomerContact> crudService={CustomerContactService}>
        <DataTable.Header>
          <DataTable.Title />
          <DataTable.Buttons>
            <DataTable.Button outline isRefreshButton refreshAfterTask />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter>
            <Field name="status">
              <Select
                options={CUSTOMER_CONTACT_STATUS}
                placeholder="Lọc trạng thái"
                clearable
                autosize
              />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
          <DataTable.Column
            width={200}
            label="Thời điểm"
            render={(item: CustomerContact) => (
              <DataTable.CellDate value={item.createdAt} format="dd-MM-yyyy HH:mm" />
            )}
          />
          <DataTable.Column
            width={250}
            label="Người dùng"
            render={(item: CustomerContact) => <DataTable.CellText value={item.name} />}
          />
          <DataTable.Column
            label="Liên hệ"
            render={(item: CustomerContact) => (
              <DataTable.CellText value={item.email} subText={item.phone} />
            )}
          />
          <DataTable.Column
            label="Trạng thái"
            render={(item: CustomerContact) => (
              <DataTable.CellStatus
                options={[
                  { value: "pending", label: "Đang chờ", color: "warning" },
                  { value: "completed", label: "Đã tư vấn", color: "success" },
                ]}
                value={item.status}
              />
            )}
          />
          <DataTable.Column
            right
            render={(item: CustomerContact) => (
              <>
                <DataTable.CellButton value={item} isUpdateButton icon={<RiEyeLine />} />
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Consumer>
          {({ formItem, setFormItem }) => (
            <Form
              dialog
              width={"700px"}
              grid
              isOpen={formItem ? true : false}
              onClose={() => setFormItem(null)}
              defaultValues={formItem}
              title="Thông tin khách hàng cần tư vấn"
            >
              <Field name="name" label="Tên khách hàng" cols={6} readOnly>
                <Input />
              </Field>
              <Field name="phone" label="Số điện thoai" cols={6} readOnly>
                <Input />
              </Field>
              <Field name="email" label="Email" cols={6} readOnly>
                <Input />
              </Field>
              <Field name="companyName" label="Công ty" cols={6} readOnly>
                <Input />
              </Field>
              <Field name="message" label="Lời nhắn" readOnly cols={12}>
                <Textarea />
              </Field>
              <Field name="address" label="Địa chỉ" readOnly cols={12}>
                <Input />
              </Field>
            </Form>
          )}
        </DataTable.Consumer>
        <DataTable.Pagination />
      </DataTable>
    </Card>
  );
}
