import cloneDeep from "lodash/cloneDeep";
import { useState } from "react";
import { RiGiftLine } from "react-icons/ri";
import { parseNumber } from "../../../lib/helpers/parser";
import { useAuth } from "../../../lib/providers/auth-provider";
import { useToast } from "../../../lib/providers/toast-provider";
import { LuckyWheel, LuckyWheelService } from "../../../lib/repo/lucky-wheel.repo";
import { Staff } from "../../../lib/repo/staff.repo";
import { ShopPageTitle } from "../../shared/shop-layout/shop-page-title";
import { Switch } from "../../shared/utilities/form/switch";
import { DataTable } from "../../shared/utilities/table/data-table";
import { LuckyWheelResultsDialog } from "./components/lucky-wheel-results-dialog";
import { LuckyWheelForm } from "./components/lucky-wheels-form";

export function LuckyWheelsPage(props: ReactProps) {
  const [openLuckyWheel, setOpenLuckyWheel] = useState<LuckyWheel>(undefined);
  const [openWheelResult, setOpenWheelResult] = useState<string>("");
  const toast = useToast();
  const { staffPermission } = useAuth();
  const hasWritePermission = staffPermission("WRITE_WHEELS");
  return (
    <>
      <DataTable<LuckyWheel>
        crudService={LuckyWheelService}
        order={{ createdAt: -1 }}
        createItem={() => {
          setOpenLuckyWheel(null);
        }}
        updateItem={async (item) => {
          await LuckyWheelService.getOne({ id: item.id }).then((res) => {
            setOpenLuckyWheel(cloneDeep(res));
          });
        }}
      >
        <DataTable.Header>
          <ShopPageTitle title="Vòng quay" subtitle="Trò chơi vòng quay trao thưởng" />
          <DataTable.Buttons>
            <DataTable.Button
              outline
              isRefreshButton
              refreshAfterTask
              className="w-12 h-12 bg-white"
            />
            <DataTable.Button primary isCreateButton className="h-12" disabled={!hasWritePermission} />
          </DataTable.Buttons>
        </DataTable.Header>

        <DataTable.Divider />

        <DataTable.Toolbar>
          <DataTable.Search className="h-12" />
          <DataTable.Filter></DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Consumer>
          {({ changeRowData, loadAll }) => (
            <>
              <DataTable.Table className="mt-4 bg-white">
                <DataTable.Column
                  label="Vòng quay"
                  render={(item: LuckyWheel) => (
                    <DataTable.CellText image={item.wheelImage} value={item.title} />
                  )}
                />
                <DataTable.Column
                  center
                  label="Mã"
                  render={(item: LuckyWheel) => <DataTable.CellText value={item.code} />}
                />
                <DataTable.Column
                  center
                  label="Bắt đầu"
                  render={(item: LuckyWheel) => <DataTable.CellDate value={item.startDate} />}
                />
                <DataTable.Column
                  center
                  label="Kết thúc"
                  render={(item: LuckyWheel) => <DataTable.CellDate value={item.endDate} />}
                />
                {/* <DataTable.Column
                  center
                  label="Điểm yêu cầu"
                  render={(item: LuckyWheel) => (
                    <DataTable.CellNumber value={item.gamePointRequired} />
                  )}
                /> */}
                <DataTable.Column
                  center
                  label="Tỉ lệ thắng"
                  render={(item: LuckyWheel) => (
                    <DataTable.CellText value={`${parseNumber(item.successRatio)}%`} />
                  )}
                />
                <DataTable.Column
                  center
                  label="Kích hoạt"
                  render={(item: LuckyWheel) => (
                    <DataTable.CellText
                      className="flex justify-center"
                      value={
                        <Switch
                          dependent
                          value={item.isActive}
                          onChange={async () => {
                            if (!item.isActive && (!item.wheelImage || item.gifts.length < 2)) {
                              toast.info(
                                "Yêu cầu có ảnh vòng quay và tạo ít nhất 2 món quà trước khi kích hoạt"
                              );
                              changeRowData(item, "isActive", false);
                              return;
                            }
                            try {
                              const res = await LuckyWheelService.update({
                                id: item.id,
                                data: { isActive: !item.isActive },
                              });
                              changeRowData(item, "isActive", res.isActive);
                            } catch (err) {
                              changeRowData(item, "isActive", item.isActive);
                            }
                          }}
                        />
                      }
                    />
                  )}
                />
                <DataTable.Column
                  right
                  render={(item: Staff) => (
                    <>
                      <DataTable.CellButton
                        icon={<RiGiftLine />}
                        tooltip="Kết quả vòng quay"
                        value={item}
                        onClick={() => setOpenWheelResult(item.id)}
                      />
                      <DataTable.CellButton value={item} isUpdateButton />
                      <DataTable.CellButton hoverDanger value={item} isDeleteButton disabled={!hasWritePermission} />
                    </>
                  )}
                />
              </DataTable.Table>
              <LuckyWheelForm
                luckyWheel={openLuckyWheel}
                onChange={loadAll}
                isOpen={openLuckyWheel !== undefined}
                onClose={() => setOpenLuckyWheel(undefined)}
                editLuckyWheel={!hasWritePermission}
              />
              <LuckyWheelResultsDialog
                luckyWheelId={openWheelResult}
                isOpen={!!openWheelResult}
                onClose={() => {
                  setOpenWheelResult("");
                }}

              />
            </>
          )}
        </DataTable.Consumer>
        <DataTable.Pagination />
      </DataTable>
    </>
  );
}
