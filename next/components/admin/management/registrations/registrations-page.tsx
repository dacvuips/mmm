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
                placeholder="T???t c??? tr???ng th??i"
                options={SHOP_REGISTRATION_STATUS}
              />
            </Field>
            <Field noError>
              <DatePicker value={fromDate} onChange={setFromDate} placeholder="T??? ng??y" />
            </Field>
            <Field noError>
              <DatePicker value={toDate} onChange={setToDate} placeholder="?????n ng??y" />
            </Field>
          </DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Table className="mt-4">
          <DataTable.Column
            orderBy="shopName"
            label="C???a h??ng"
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
            label="Ng?????i ?????i di???n"
            render={(item: ShopRegistration) => (
              <DataTable.CellText
                value={item.name}
                subText={item.phone}
                className="font-semibold"
              />
            )}
          />
          <DataTable.Column
            label="Email ????ng k??"
            render={(item: ShopRegistration) => <DataTable.CellText value={item.email} />}
          />
          <DataTable.Column
            center
            label="Danh m???c"
            render={(item: ShopRegistration) => <DataTable.CellText value={item.category?.name} />}
          />
          <DataTable.Column
            center
            label="Th???i gian ????ng k??"
            render={(item: ShopRegistration) => (
              <DataTable.CellDate format="dd-MM-yyyy HH:mm" value={item.createdAt} />
            )}
          />
          <DataTable.Column
            center
            orderBy="status"
            label="Tr???ng th??i"
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
                          tooltip="Duy???t ????ng k??"
                          icon={<RiCheckDoubleFill />}
                          onClick={async () => {
                            if (hasExecutePermission) {
                              await alert.question(
                                "Duy???t ????ng k?? n??y",
                                `????ng k?? c???a h??ng "${item.shopName}" s??? ???????c duy???t.`,
                                "Duy???t ????ng k??",
                                async () =>
                                  ShopRegistrationService.approveShopRegis(item.id, true)
                                    .then(async (res) => {
                                      toast.success("Duy???t ????ng k?? th??nh c??ng");
                                      await loadAll(true);
                                      await checkPendingRegistrations();
                                      return true;
                                    })
                                    .catch((err) => {
                                      console.error(err);
                                      toast.error("Duy???t ????ng k?? th???t b???i. " + err.message);
                                      return false;
                                    })
                              );
                            } else {
                              toast.info("B???n kh??ng c?? quy???n duy???t ????ng k??");

                            }
                          }}
                        />
                        <DataTable.CellButton
                          hoverDanger
                          value={item}
                          tooltip="T??? ch???i ????ng k??"
                          icon={<RiCloseFill />}
                          onClick={async () => {
                            if (hasExecutePermission) {
                              await alert.danger(
                                "T??? ch???i ????ng k?? n??y",
                                `????ng k?? c???a h??ng "${item.shopName}" s??? b??? t??? ch???i.`,
                                "T??? ch???i ????ng k??",
                                async () =>
                                  ShopRegistrationService.approveShopRegis(item.id, false)
                                    .then(async (res) => {
                                      toast.success("T??? ch???i ????ng k?? th??nh c??ng");
                                      await loadAll(true);
                                      await checkPendingRegistrations();
                                      return true;
                                    })
                                    .catch((err) => {
                                      console.error(err);
                                      toast.error("T??? ch???i ????ng k?? th???t b???i. " + err.message);
                                      return false;
                                    })
                              );
                            } else {
                              toast.info("B???n kh??ng c?? quy???n t??? ch???i ????ng k??");
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
