import { useMemo, useState } from 'react';
import { RiCheckDoubleFill, RiCloseFill } from 'react-icons/ri';

import { useAdminLayoutContext } from '../../../../layouts/admin-layout/providers/admin-layout-provider';
import { useAlert } from '../../../../lib/providers/alert-provider';
import { useAuth } from '../../../../lib/providers/auth-provider';
import { useToast } from '../../../../lib/providers/toast-provider';
import {
  SHOP_REGISTRATION_STATUS,
  ShopRegistration,
  ShopRegistrationService,
} from '../../../../lib/repo/shop-registration.repo';
import { DatePicker } from '../../../shared/utilities/form/date';
import { Field } from '../../../shared/utilities/form/field';
import { Select } from '../../../shared/utilities/form/select';
import { Card } from '../../../shared/utilities/misc';
import { DataTable } from '../../../shared/utilities/table/data-table';

export function RegistrationsPage(props) {
  const { checkPendingRegistrations } = useAdminLayoutContext();
  const { adminPermission } = useAuth();
  const hasExecutePermission = adminPermission("EXECUTE_REGISTRATIONS");

  const toast = useToast();
  const alert = useAlert();
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();

  const filter = useMemo(() => {
    let tempFilter = {};

    if (fromDate || toDate) {
      tempFilter["updatedAt"] = {};
      if (fromDate) {
        tempFilter["updatedAt"]["$gte"] = fromDate;
      }
      if (toDate) {
        tempFilter["updatedAt"]["$lte"] = toDate;
      }
    }
    return tempFilter;
  }, [fromDate, toDate]);
  return (
    <Card>
      <DataTable<ShopRegistration>
        crudService={ShopRegistrationService}
        order={{ createdAt: -1 }}
        filter={filter}
      >
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
            <Field name="status" noError>
              <Select
                autosize
                clearable
                placeholder="Tất cả trạng thái"
                options={SHOP_REGISTRATION_STATUS}
              />
            </Field>
            <Field noError>
              <DatePicker value={fromDate} onChange={setFromDate} placeholder="Từ ngày" />
            </Field>
            <Field noError>
              <DatePicker value={toDate} onChange={setToDate} placeholder="Đến ngày" />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
          <DataTable.Column
            orderBy="shopName"
            label="Cửa hàng"
            render={(item: ShopRegistration) => (
              <DataTable.CellText
                value={item.shopName}
                subText={item.shopCode}
                className="font-semibold"
              />
            )}
          />
          <DataTable.Column
            orderBy="name"
            label="Người đại diện"
            render={(item: ShopRegistration) => (
              <DataTable.CellText
                value={item.name}
                subText={item.phone}
                className="font-semibold"
              />
            )}
          />
          <DataTable.Column
            label="Email đăng ký"
            render={(item: ShopRegistration) => <DataTable.CellText value={item.email} />}
          />
          <DataTable.Column
            center
            label="Danh mục"
            render={(item: ShopRegistration) => <DataTable.CellText value={item.category?.name} />}
          />
          <DataTable.Column
            center
            label="Thởi gian đăng ký"
            render={(item: ShopRegistration) => (
              <DataTable.CellDate format="dd-MM-yyyy HH:mm" value={item.createdAt} />
            )}
          />
          <DataTable.Column
            center
            orderBy="status"
            label="Trạng thái"
            render={(item: ShopRegistration) => (
              <DataTable.CellStatus value={item.status} options={SHOP_REGISTRATION_STATUS} />
            )}
          />
          <DataTable.Column
            right
            render={(item: ShopRegistration) => (
              <DataTable.Consumer>
                {({ loadAll }) => (
                  <>
                    {item.status == "PENDING" && (
                      <>
                        <DataTable.CellButton
                          hoverSuccess
                          value={item}
                          tooltip="Duyệt đăng ký"
                          icon={<RiCheckDoubleFill />}
                          onClick={async () => {
                            if (hasExecutePermission) {
                              await alert.question(
                                "Duyệt đăng ký này",
                                `Đăng ký cửa hàng "${item.shopName}" sẽ được duyệt.`,
                                "Duyệt đăng ký",
                                async () =>
                                  ShopRegistrationService.approveShopRegis(item.id, true)
                                    .then(async (res) => {
                                      toast.success("Duyệt đăng ký thành công");
                                      await loadAll(true);
                                      await checkPendingRegistrations();
                                      return true;
                                    })
                                    .catch((err) => {
                                      console.error(err);
                                      toast.error("Duyệt đăng ký thất bại. " + err.message);
                                      return false;
                                    })
                              );
                            } else {
                              toast.info("Bạn không có quyền duyệt đăng ký");

                            }
                          }}
                        />
                        <DataTable.CellButton
                          hoverDanger
                          value={item}
                          tooltip="Từ chối đăng ký"
                          icon={<RiCloseFill />}
                          onClick={async () => {
                            if (hasExecutePermission) {
                              await alert.danger(
                                "Từ chối đăng ký này",
                                `Đăng ký cửa hàng "${item.shopName}" sẽ bị từ chối.`,
                                "Từ chối đăng ký",
                                async () =>
                                  ShopRegistrationService.approveShopRegis(item.id, false)
                                    .then(async (res) => {
                                      toast.success("Từ chối đăng ký thành công");
                                      await loadAll(true);
                                      await checkPendingRegistrations();
                                      return true;
                                    })
                                    .catch((err) => {
                                      console.error(err);
                                      toast.error("Từ chối đăng ký thất bại. " + err.message);
                                      return false;
                                    })
                              );
                            } else {
                              toast.info("Bạn không có quyền từ chối đăng ký");
                            }
                          }}
                        />
                      </>
                    )}
                  </>
                )}
              </DataTable.Consumer>
            )}
          />
        </DataTable.Table>
        <DataTable.Pagination />
      </DataTable>
    </Card>
  );
}
