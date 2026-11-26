import { HttpError, page } from "fresh";
import TeamEditor from "@/islands/team/TeamEditor.tsx";
import { getSettings } from "@/models/settings/index.ts";
import { getTeamBySlug } from "@/models/team/index.ts";
import { toTeamDto } from "@/routes/api/teams/[id].ts";
import { define } from "@/utils/state.ts";
import { instructorOptions } from "../new.tsx";

export const handler = define.handlers({
  async GET(ctx) {
    if (ctx.state.user?.role !== "admin") {
      throw new HttpError(403, "Kun administratorer kan redigere hold");
    }
    const [team, instructors, settings] = await Promise.all([
      getTeamBySlug(ctx.params.slug),
      instructorOptions(),
      getSettings(),
    ]);
    if (!team) {
      throw new HttpError(404, "Holdet findes ikke");
    }
    return page({
      team: toTeamDto(team),
      instructors,
      roles: settings.instructorRoles,
      locations: settings.locations,
    });
  },
});

export default define.page<typeof handler>(function EditTeamPage({ data }) {
  return (
    <TeamEditor
      team={data.team}
      instructors={data.instructors}
      roles={data.roles}
      locations={data.locations}
    />
  );
});
