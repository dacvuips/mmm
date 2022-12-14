import React, { useState } from "react";
import { FaClipboard, FaCopy, FaQrcode } from "react-icons/fa";
import { validateKeyword } from "../../../lib/constants/validate-keyword";
import { useCopy } from "../../../lib/hooks/useCopy";
import { useAuth } from "../../../lib/providers/auth-provider";

import { ShopBranch, ShopBranchService } from "../../../lib/repo/shop-branch.repo";
import { ShopTable, ShopTableService } from "../../../lib/repo/shop/shop-table.repo";
import { QRDialog } from "../../shared/shop-layout/qr-dialog";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Field, Form, Input } from "../../shared/utilities/form";
import { List } from "../../shared/utilities/list";
import { Card } from "../../shared/utilities/misc";
import { DataTable } from "../../shared/utilities/table/data-table";

export function ShopTablesPage(props) {
  const [selectedBranch, setSelectedBranch] = useState<ShopBranch>(null);
  const [showQrcode, setShowQrcode] = useState<ShopTable>(null);
  const copy = useCopy();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_TABLES");

  return (
    <Card>
      <DataTable<ShopTable>
        crudService={ShopTableService}
        order={{ _id: -1 }}
        filter={{ branchId: selectedBranch?.id }}
        fetchingCondition={!!selectedBranch}
      >
        <div className="flex gap-3">
          <div className="w-56">
            <DataTable.Consumer>
              {({ loadAll }) => (
                <List<ShopBranch>
                  crudService={ShopBranchService}
                  selectedItem={selectedBranch}
                  onSelect={(item) => setSelectedBranch(item)}
                  hasAll={false}
                  hasAdd={false}
                  hasDelete={false}
                  hasUpdate={false}
                  onChange={() => {
                    loadAll(true);
                  }}
                  renderItem={(item, selected) => (
                    <>
                      <div
                        className={`font-semibold text-sm ${selected ? "text-primary" : "text-gray-700 group-hover:text-primary"
                          }`}
                      >
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-600 break-all">{item.description}</div>
                    </>
                  )}
                ></List>
              )}
            </DataTable.Consumer>
          </div>

          {selectedBranch && (
            <div className="flex-1">
              <DataTable.Header>
                <ShopPageTitle title="B??n" subtitle={`C??c b??n thu???c ${selectedBranch?.name}`} />
                <DataTable.Buttons>
                  <DataTable.Button
                    outline
                    isRefreshButton
                    refreshAfterTask
                    className="w-12 h-12 bg-white"
                  />
                  <DataTable.Button
                    primary
                    isCreateButton
                    className="h-12"
                    disabled={!hasWritePermission}
                  />
                </DataTable.Buttons>
              </DataTable.Header>

              <DataTable.Divider />

              <DataTable.Toolbar>
                <DataTable.Search className="h-12" />
                <DataTable.Filter></DataTable.Filter>
              </DataTable.Toolbar>

              <DataTable.Table className="mt-4 bg-white">
                <DataTable.Column
                  label="B??n"
                  render={(item: ShopTable) => (
                    <DataTable.CellText
                      className="font-semibold"
                      value={item.name}
                      subText={item.code}
                    />
                  )}
                />
                <DataTable.Column
                  label="Link ?????t m??n"
                  render={(item: ShopTable) => (
                    <DataTable.CellButton
                      className="font-semibold"
                      value={item}
                      text={item.pickupUrl}
                      small
                      icon={<FaCopy />}
                      onClick={() => copy(item.pickupUrl)}
                    />
                  )}
                />
                <DataTable.Column
                  right
                  render={(item: ShopTable) => (
                    <>
                      <DataTable.CellButton
                        value={item}
                        icon={<FaQrcode />}
                        onClick={() => setShowQrcode(item)}
                      />

                      <DataTable.CellButton
                        value={item}
                        isUpdateButton
                        disabled={!hasWritePermission}
                      />
                      <DataTable.CellButton
                        value={item}
                        isDeleteButton
                        disabled={!hasWritePermission}
                      />
                    </>
                  )}
                />
              </DataTable.Table>
              <DataTable.Pagination />

              <DataTable.Form
                beforeSubmit={(data) => {
                  data.branchId = selectedBranch?.id;
                  return data;
                }}
              >
                <Field
                  label="T??n b??n"
                  name="name"
                  required
                  validation={{
                    nameTableValid: (value) => validateKeyword(value),
                  }}
                >
                  <Input autoFocus placeholder="Nh???p t??n b??n" />
                </Field>
                <Field label="M?? b??n" name="code">
                  <Input placeholder="H??? th???ng t??? sinh" />
                </Field>
              </DataTable.Form>
            </div>
          )}
        </div>
      </DataTable>
      <QRDialog
        isOpen={!!showQrcode}
        onClose={() => setShowQrcode(null)}
        name={showQrcode?.name}
        link={showQrcode?.pickupUrl}
      />
    </Card>
  );
}
