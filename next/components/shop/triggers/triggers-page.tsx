import { useEffect, useMemo, useState } from "react";
import { validateKeyword } from "../../../lib/constants/validate-keyword";
import { useAuth } from "../../../lib/providers/auth-provider";

import { TriggerGroup, TriggerGroupService } from "../../../lib/repo/trigger-group.repo";
import { Trigger, TRIGGER_ACTION_TYPES, TriggerService } from "../../../lib/repo/trigger.repo";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Field } from "../../shared/utilities/form/field";
import { Input } from "../../shared/utilities/form/input";
import { List } from "../../shared/utilities/list";
import { Card, NotFound } from "../../shared/utilities/misc";
import { TabGroup } from "../../shared/utilities/tab/tab-group";
import { DataTable } from "../../shared/utilities/table/data-table";
import { TriggerForm } from "./components/trigger-form";
import { TriggerSettings } from "./components/trigger-settings";
import { SmaxbotProvider } from "./providers/smaxbot-provider";
import { TriggersProvider, useTriggersContext } from "./providers/triggers-provider";

export function TriggersPage() {
  return (
    <TriggersProvider>
      <SmaxbotProvider>
        <TabGroup
          tabsClassName="bg-transparent"
          tabClassName="pb-3 px-3"
          bodyClassName="mt-3"
          flex={false}
          autoHeight
          name="trigger"
        >
          <TabGroup.Tab label="Danh sách chiến dịch">
            <Card>
              <TriggerDataTable />
            </Card>
          </TabGroup.Tab>
          <TabGroup.Tab label="Cấu hình">
            <TriggerSettings />
          </TabGroup.Tab>
        </TabGroup>
      </SmaxbotProvider>
    </TriggersProvider>
  );
}
function TriggerDataTable() {
  const { subEvents } = useTriggersContext();
  const [selectedTriggerGroup, setSelectedTriggerGroup] = useState<TriggerGroup>();
  const [triggerGroups, setTriggerGroups] = useState<TriggerGroup[]>();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_TRIGGERS");

  return (
    <DataTable<Trigger>
      crudService={TriggerService}
      order={{ updatedAt: -1 }}
      filter={{ triggerGroupId: selectedTriggerGroup?.id }}
      fetchingCondition={!!selectedTriggerGroup}
    >
      <div className="flex gap-3">
        <div className="w-56 grow-0 shrink-0">
          <DataTable.Consumer>
            {({ loadAll }) => (
              <List<TriggerGroup>
                saveDisabled={!hasWritePermission}
                deleteDisabled={!hasWritePermission}
                crudService={TriggerGroupService}
                selectedItem={selectedTriggerGroup}
                onSelect={(item) => setSelectedTriggerGroup(item)}
                hasAll={false}
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
                onLoadItems={(items) => setTriggerGroups(items)}
              >
                <List.Form>
                  <Field
                    name="name"
                    label="Tên nhóm trigger"
                    required
                    cols={12}
                    validation={{ nameValid: (val) => validateKeyword(val) }}
                  >
                    <Input autoFocus />
                  </Field>
                  <Field
                    name="description"
                    label="Mô tả"
                    cols={12}
                    validation={{ descValid: (val) => validateKeyword(val) }}
                  >
                    <Input />
                  </Field>
                </List.Form>
              </List>
            )}
          </DataTable.Consumer>
        </div>

        {selectedTriggerGroup ? (
          <div className="flex-1">
            <DataTable.Header>
              <ShopPageTitle title="Trigger" subtitle="Danh sách Trigger" />
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
                label="Trigger"
                render={(item: Trigger) => (
                  <DataTable.CellText
                    className="font-semibold"
                    value={item.name}
                    subText={item.code}
                  />
                )}
              />
              <DataTable.Column
                center
                label="Sự kiện"
                render={(item: Trigger) => (
                  <DataTable.CellText value={subEvents?.find((x) => x.id == item.event)?.name} />
                )}
              />
              <DataTable.Column
                center
                label="Các nền tảng"
                render={(item: Trigger) => (
                  <DataTable.CellText
                    value={
                      item.actions
                        ? item.actions
                          .map(
                            (item) =>
                              TRIGGER_ACTION_TYPES.find((x) => x.value == item.type)?.label
                          )
                          .join(", ")
                        : "Không có"
                    }
                  />
                )}
              />
              <DataTable.Column
                right
                render={(item: Trigger) => (
                  <>
                    <DataTable.CellButton value={item} isUpdateButton />
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
            <DataTable.Consumer>
              {({ loadAll, formItem, setFormItem }) => (
                <TriggerForm
                  triggerEditDisable={!hasWritePermission}
                  triggerGroupId={selectedTriggerGroup?.id}
                  triggerGroups={triggerGroups}
                  trigger={formItem}
                  isOpen={!!formItem}
                  onClose={() => setFormItem(undefined)}
                  onSubmit={async (data) => {
                    await TriggerService.createOrUpdate({ id: formItem.id, data });
                    loadAll();
                    setFormItem(undefined);
                  }}
                />
              )}
            </DataTable.Consumer>
          </div>
        ) : (
          <NotFound text="Chưa chọn nhóm chiến dịch" />
        )}
      </div>
    </DataTable>
  );
}
