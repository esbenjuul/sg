import { HttpError, page } from "fresh";
import SettingsEditor from "@/islands/settings/SettingsEditor.tsx";
import { getSettings } from "@/models/settings/index.ts";
import { getLocationUsage, getRoleUsage } from "@/models/team/index.ts";
import { toSettingsDto } from "@/routes/api/settings/index.ts";
import { define } from "@/utils/state.ts";

export const handler = define.handlers({
  async GET(ctx) {
    if (ctx.state.user?.role !== "admin") {
      throw new HttpError(403, "Kun administratorer har adgang");
    }
    const [settings, roleUsage, locationUsage] = await Promise.all([
      getSettings(),
      getRoleUsage(),
      getLocationUsage(),
    ]);
    return page({
      settings: toSettingsDto(settings),
      roleUsage,
      locationUsage,
    });
  },
});

export default define.page<typeof handler>(function SettingsPage({ data }) {
  return (
    <div class="container">
      <header class="page-header">
        <h1>Indstillinger</h1>
        <span class="page-header-subtitle">
          Gælder for hele applikationen. Kun administratorer har adgang.
        </span>
      </header>
      <SettingsEditor
        settings={data.settings}
        roleUsage={data.roleUsage}
        locationUsage={data.locationUsage}
      />
    </div>
  );
});
