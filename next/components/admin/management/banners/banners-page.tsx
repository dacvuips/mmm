import { useAuth } from "../../../../lib/providers/auth-provider";
import { Banner, BannerService, BANNER_ACTIONS } from "../../../../lib/repo/banner.repo";
import { Switch } from "../../../shared/utilities/form/switch";
import { Card } from "../../../shared/utilities/misc";
import { DataTable } from "../../../shared/utilities/table/data-table";
import { BannerFields } from "./components/banner-fields";

export function BannersPage(props) {
  const { adminPermission } = useAuth();
  const hasWritePermission = adminPermission("WRITE_BANNERS");
  return (
    <Card>
      <DataTable<Banner> crudService={BannerService} order={{ priority: -1 }}>
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
          <DataTable.Filter></DataTable.Filter>
        </DataTable.Toolbar>

        <DataTable.Consumer>
          {({ changeRowData, loadAll }) => (
            <>
              <DataTable.Table className="mt-4">
                <DataTable.Column
                  label="Banner"
                  width={180}
                  render={(item: Banner) => (
                    <DataTable.CellText
                      ratio169
                      imageClassName="w-40"
                      compress={200}
                      image={item.image}
                      value=""
                    />
                  )}
                />
                <DataTable.Column
                  label="Hành động"
                  render={(item: Banner) => (
                    <DataTable.CellText
                      value={
                        <div className="flex flex-col items-start font-semibold gap-y-1">
                          <span
                            className={`status-label bg-${BANNER_ACTIONS.find((x) => x.value == item.actionType)?.color
                              }`}
                          >
                            {BANNER_ACTIONS.find((x) => x.value == item.actionType)?.label}
                          </span>

                          {item.actionType == "SHOP" && (
                            <>
                              <div>{item.shop?.name}</div>
                            </>
                          )}
                          {item.actionType == "PRODUCT" && (
                            <>
                              <div>{item.product?.name}</div>
                            </>
                          )}
                          {item.actionType == "VOUCHER" && (
                            <>
                              <div>{item.voucher?.name}</div>
                            </>
                          )}
                          {item.actionType == "WEBSITE" && (
                            <>
                              <div>{item.link}</div>
                            </>
                          )}
                        </div>
                      }
                    />
                  )}
                />
                <DataTable.Column
                  center
                  label="Ưu tiên"
                  render={(item: Banner) => <DataTable.CellText value={item.priority} />}
                />
                <DataTable.Column
                  center
                  label="Kích hoạt"
                  render={(item: Banner) => (
                    <DataTable.CellText
                      className="flex justify-center"
                      value={
                        <Switch
                          readOnly={!hasWritePermission}
                          dependent
                          value={item.isPublic}
                          onChange={async () => {
                            try {
                              const res = await BannerService.update({
                                id: item.id,
                                data: { isPublic: !item.isPublic },
                              });
                              changeRowData(item, "isPublic", res.isPublic);
                            } catch (err) {
                              changeRowData(item, "isPublic", item.isPublic);
                            }
                          }}
                        />
                      }
                    />
                  )}
                />
                <DataTable.Column
                  right
                  render={(item: Banner) => (
                    <>
                      <DataTable.CellButton value={item} isUpdateButton />
                      <DataTable.CellButton hoverDanger value={item} isDeleteButton disabled={!hasWritePermission} />
                    </>
                  )}
                />
              </DataTable.Table>
            </>
          )}
        </DataTable.Consumer>
        <DataTable.Form grid width={650}
          footerProps={{
            submitProps: { disabled: !hasWritePermission }
          }}
        >
          <BannerFields />
        </DataTable.Form>
        <DataTable.Pagination />
      </DataTable>
    </Card>
  );
}
