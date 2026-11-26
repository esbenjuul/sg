import { HttpError, page } from "fresh";
import TeamEditor, {
  type InstructorOption,
} from "@/islands/team/TeamEditor.tsx";
import { getSettings } from "@/models/settings/index.ts";
import { getUsers } from "@/models/user/index.ts";
import { define } from "@/utils/state.ts";

export async function instructorOptions(): Promise<InstructorOption[]> {
  const users = await getUsers();
  return users
    .map((user) => ({ id: user._id, name: user.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "da"));
}

export const handler = define.handlers({
  async GET(ctx) {
    if (ctx.state.user?.role !== "admin") {
      throw new HttpError(403, "Kun administratorer kan oprette hold");
    }
    const [instructors, settings] = await Promise.all([
      instructorOptions(),
      getSettings(),
    ]);
    return page({
      instructors,
      roles: settings.instructorRoles,
      locations: settings.locations,
    });
  },
});

export default define.page<typeof handler>(function NewTeamPage({ data }) {
  return (
    <TeamEditor
      instructors={data.instructors}
      roles={data.roles}
      locations={data.locations}
    />
  );
});
