import { useState } from "react";
import { RiLock2Line } from "react-icons/ri";
import { validateKeyword } from "../../../../lib/constants/validate-keyword";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { ADMIN_SCOPES, User, UserService, USER_ROLES } from "../../../../lib/repo/user.repo";
import { Field } from "../../../shared/utilities/form/field";
import { Form, FormProps } from "../../../shared/utilities/form/form";
import { Input } from "../../../shared/utilities/form/input";
import { Select } from "../../../shared/utilities/form/select";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";

export function UserPage(props) {
  const [openChangePasswordUser, setOpenChangePasswordUser] = useState<User>(null);
  const { adminPermission } = useAuth();
  const hasWritePermission = adminPermission("WRITE_USERS");

  const toast = useToast();
  return (
    <Card>
      <DataTable<User> crudService={UserService} order={{ createdAt: 1 }}>
        <DataTable.Header>
          <DataTable.Title />
          <DataTable.Buttons>
            <DataTable.Button outline isRefreshButton refreshAfterTask />
            <DataTable.Button primary isCreateButton disabled={!hasWritePermission} />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search />
          <DataTable.Filter>
            <Field name="role" noError>
              <Select placeholder="Tất cả loại tài khoản" clearable options={USER_ROLES} autosize />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
          <DataTable.Column
            label="Email"
            render={(item: User) => <DataTable.CellText value={item.email} />}
          />
          <DataTable.Column
            center
            label="Họ tên"
            render={(item: User) => <DataTable.CellText value={item.name} />}
          />
          <DataTable.Column
            center
            orderBy="role"
            label="Vai trò"
            render={(item: User) => <DataTable.CellStatus value={item.role} options={USER_ROLES} />}
          />
          <DataTable.Column
            center
            label="Ngày tạo"
            render={(item: User) => <DataTable.CellDate value={item.createdAt} />}
          />
          <DataTable.Column
            right
            render={(item: User) => (
              <>
                <DataTable.CellButton
                  disabled={!hasWritePermission}
                  value={item}
                  icon={<RiLock2Line />}
                  tooltip="Đổi mật khẩu"
                  onClick={() => {
                    setOpenChangePasswordUser(item);
                  }}
                />
                <DataTable.CellButton value={item} isUpdateButton />
                <DataTable.CellButton
                  hoverDanger
                  value={item}
                  isDeleteButton
                  disabled={item.email == "admin@gmail.com" || !hasWritePermission}
                />
              </>
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />

        <DataTable.Consumer>
          {({ formItem }) => (
            <>
              <DataTable.Form
                grid
                footerProps={{
                  submitProps: { disabled: !hasWritePermission },
                  cancelText: "Đóng",
                }}
              >
                <Field
                  label="Email đăng nhập"
                  name="email"
                  cols={formItem?.id ? 12 : 6}
                  readOnly={formItem?.id}
                  required
                  validation={{ email: true }}
                >
                  <Input autoFocus />
                </Field>
                {!formItem?.id && (
                  <Field label="Mật khẩu" name="password" cols={6} required>
                    <Input type="password" />
                  </Field>
                )}
                <Field
                  label="Họ tên"
                  name="name"
                  cols={6}
                  required
                  validation={{ nameValid: (val) => validateKeyword(val) }}
                >
                  <Input />
                </Field>
                <Field label="Vai trò" name="role" cols={6} required>
                  <Select options={USER_ROLES} />
                </Field>
                <Field label="Quyền hạn" name="scopes" cols={6} required>
                  <Select multi options={ADMIN_SCOPES} />
                </Field>
              </DataTable.Form>
              <ChangeUserPwdDialog
                isOpen={!!openChangePasswordUser}
                onClose={() => setOpenChangePasswordUser(null)}
                userId={openChangePasswordUser?.id}
                email={openChangePasswordUser?.email}
              />
            </>
          )}
        </DataTable.Consumer>
      </DataTable>
    </Card>
  );
}

function ChangeUserPwdDialog({
  userId,
  email,
  ...props
}: FormProps & { userId: string; email: string }) {
  const toast = useToast();
  return (
    <Form
      {...props}
      dialog
      onSubmit={async (data) => {
        try {
          await UserService.updateUserPassword(userId, data.password);
          props.onClose();
          toast.success("Thay đổi mật khẩu thành công.");
        } catch (err) {
          toast.error("Thay đổi mật khẩu thất bại. " + err.message);
        }
      }}
    >
      <Field readOnly label="Tài khoản">
        <Input value={email} />
      </Field>
      <Field required name="password" label="Mật khẩu mới">
        <Input type="password" autoFocus />
      </Field>
      <Form.Footer />
    </Form>
  );
}
