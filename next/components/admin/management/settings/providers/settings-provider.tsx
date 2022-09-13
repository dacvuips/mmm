import isEqual from "lodash/isEqual";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { useCrud } from "../../../../../lib/hooks/useCrud";
import { useAlert } from "../../../../../lib/providers/alert-provider";
import { useToast } from "../../../../../lib/providers/toast-provider";
import { SettingGroup, SettingGroupService } from "../../../../../lib/repo/setting-group.repo";
import { Setting, SettingService } from "../../../../../lib/repo/setting.repo";
export const SettingsContext = createContext<
  Partial<{
    settingGroups: SettingGroup[];
    settingGroup: SettingGroup;
    settings: Setting[];
    loadingSettings: boolean;
    saveSettings: (data: any) => Promise<any>;
    saveSetting: (id: string, data: Setting) => Promise<any>;
    deleteSettingGroup: (settingGroup: SettingGroup) => Promise<any>;
    saveSettingGroup: (id: string, data: Partial<SettingGroup>) => Promise<any>;
  }>
>({});

export function SettingsProvider(props) {
  const [settingGroup, setSettingGroup] = useState<SettingGroup>();
  const router = useRouter();
  const alert = useAlert();
  const toast = useToast();

  const settingGroupCrud = useCrud(SettingGroupService, {
    limit: 1000,
  });

  useEffect(() => {
    if (settingGroupCrud.items) {
      const { slug } = router.query;
      if (slug) {
        if (!settingGroupCrud.items.find((x) => x.slug == slug)) router.replace("/admin/settings");
      } else {
        if (settingGroupCrud.items.length)
          router.replace("/admin/settings/" + settingGroupCrud.items[0].slug);
      }
    }
  }, [settingGroupCrud.items]);

  useEffect(() => {
    if (settingGroupCrud.items) {
      const { slug } = router.query;
      setSettingGroup(slug ? settingGroupCrud.items.find((x) => x.slug == slug) : null);
    }
  }, [router.query, settingGroupCrud.items]);

  // useEffect(() => {
  //   if (settingGroup) {
  //     setLoadingSettings(true);
  //     SettingService.getAll({
  //       query: { limit: 0, filter: { groupId: settingGroup.id } },
  //     })
  //       .then((res) => {
  //         setSettings([...res.data]);
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //         setSettings(null);
  //       })
  //       .finally(() => {
  //         setLoadingSettings(false);
  //       });
  //   } else {
  //     setSettings(null);
  //   }
  // }, [settingGroup]);

  const settingCrud = useCrud(
    SettingService,
    {
      limit: 1000,
      filter: { groupId: settingGroup?.id },
    },
    {
      fetchingCondition: !!settingGroup,
    }
  );

  const saveSettings = async (data: any) => {
    const filteredSettings = settingCrud.items.filter(
      (setting) => !isEqual(setting.value, data[setting.key])
    );
    if (!filteredSettings.length) {
      toast.info("Chưa có dữ liệu nào thay đổi");
      return;
    }

    try {
      await SettingService.mutate({
        mutation: filteredSettings.map((setting) =>
          SettingService.updateQuery({
            id: setting.id,
            data: { value: data[setting.key] },
          })
        ),
      });
      settingCrud.loadAll(true);
      toast.success("Lưu cấu hình thành công");
    } catch (err) {
      toast.error("Lưu cấu hình thất bại. " + err.message);
    }
  };

  const saveSetting = async (id: string, data: Setting) => {
    const { type, name, key, isActive, isPrivate, readOnly, value, valueKeys } = data;
    let groupId = settingGroup.id;
    let newValue = undefined;
    if (!id) {
      switch (type) {
        case "string":
        case "richText":
        case "image": {
          newValue = "";
          break;
        }
        case "boolean": {
          newValue = false;
          break;
        }
        case "number": {
          newValue = 0;
          break;
        }
        case "array": {
          newValue = [];
          break;
        }
        case "object": {
          newValue = {};
          valueKeys.forEach((key) => (newValue[key] = ""));
          break;
        }
      }
    } else {
      switch (type) {
        case "object": {
          newValue = {};
          valueKeys.forEach((key) => {
            if (value[key]) newValue[key] = value[key];
            else newValue[key] = "";
          });
          break;
        }
      }
    }
    return await SettingService.createOrUpdate({
      id,
      data: {
        name,
        key,
        isActive,
        isPrivate,
        readOnly,
        groupId,
        value: newValue,
        type: id ? undefined : type,
      },
      toast,
    }).then((res) => {
      settingCrud.loadAll(true);
    });
  };

  const saveSettingGroup = async (id: string, data: SettingGroup) => {
    const { name, desc, slug } = data;

    return await SettingGroupService.createOrUpdate({
      id,
      data: { name, desc, slug: id ? undefined : slug },
      toast,
    }).then(() => {
      settingGroupCrud.loadAll(true);
    });
  };

  const deleteSettingGroup = async (settingGroup: SettingGroup) => {
    if (!(await alert.danger("Xoá nhóm cấu hình", "Bạn có chắc chắn muốn xoá nhóm cấu hình này?")))
      return;
    return await SettingGroupService.delete({ id: settingGroup.id }).then((res) => {
      settingGroupCrud.loadAll(true);
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settingGroups: settingGroupCrud.items,
        settingGroup,
        saveSetting,
        saveSettingGroup,
        deleteSettingGroup,
        loadingSettings: settingCrud.loading,
        settings: settingCrud.items,
        saveSettings,
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  );
}

export const useSettingsContext = () => useContext(SettingsContext);
