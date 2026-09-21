import { define } from "@/utils/state.ts";
import { HttpError, page } from "fresh";
import Card from "@/components/card/card.tsx";
import { getTeams } from "@/models/team/index.ts";
import { getUsers } from "@/models/user/index.ts";
import AddTeamDialog, {
  type TeamUserOption,
} from "@/islands/AddTeamDialog.tsx";
import { handleCreateTeam } from "./create-team.ts";

export interface TeamsPageData {
  teams: TeamCardData[];
  users: TeamUserOption[];
}

interface TeamCardData {
  name: string;
  category: string;
  coachName: string;
  image: string;
  href: string;
}

export const handler = define.handlers({
  async GET() {
    try {
      const [teams, users] = await Promise.all([getTeams(), getUsers()]);
      const userById = new Map(
        users.map((user) => [user._id, user]),
      );

      const teamCards: TeamCardData[] = teams.map((team) => {
        const coachId = team.coachUserId?.toString();
        const coachName = coachId ? userById.get(coachId)?.name : undefined;
        return {
          name: team.name,
          category: team.category,
          coachName: coachName ?? "No coach assigned",
          image: team.image || "/img/gym.png",
          href: `/teams/${team.slug}`,
        };
      });

      const userOptions: TeamUserOption[] = users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
      }));

      return page({ teams: teamCards, users: userOptions });
    } catch (err) {
      console.error(err);
      throw new HttpError(500);
    }
  },
  async POST(ctx) {
    if (ctx.state.user?.role !== "admin") {
      throw new HttpError(403, "Only admins can create teams");
    }

    try {
      const form = await ctx.req.formData();
      return await handleCreateTeam(form);
    } catch (err) {
      console.error(err);
      if (err instanceof HttpError) {
        throw err;
      }
      throw new HttpError(500);
    }
  },
});

function getTeamsByCategory(
  teams: TeamCardData[],
  category: string,
): TeamCardData[] {
  return teams.filter((team) => team.category === category);
}

export default define.page<typeof handler>(function TeamsPage(ctx) {
  const { user } = ctx.state;
  const teams = ctx.data?.teams ?? [];
  const users = ctx.data?.users ?? [];
  const pigerTeams = getTeamsByCategory(teams, "piger");
  const mixTeams = getTeamsByCategory(teams, "mix");
  const drengeTeams = getTeamsByCategory(teams, "drenge");

  return (
    <>
      <section class="container content-box">
        <div class="dashboard-header">
          <h2>Teams</h2>
        </div>

        <div class="row row-split row-deck">
          <h3>Teamgym piger</h3>
          {user?.role === "admin" && (
            <AddTeamDialog users={users} defaultCategory="piger" />
          )}
        </div>
        <div class="dashboard-grid">
          {pigerTeams.map((team) => (
            <Card
              title={team.name}
              text={`instruktør: ${team.coachName}`}
              img={team.image}
              href={team.href}
            />
          ))}
        </div>
        <div class="row row-split">
          <h3>Teamgym mix</h3>
          {user?.role === "admin" && (
            <AddTeamDialog users={users} defaultCategory="mix" />
          )}
        </div>
        <div class="dashboard-grid">
          {mixTeams.map((team) => (
            <Card
              title={team.name}
              text={`instruktør: ${team.coachName}`}
              img={team.image}
              href={team.href}
            />
          ))}
        </div>
        <div class="row row-split">
          <h3>Teamgym Drenge</h3>
          {user?.role === "admin" && (
            <AddTeamDialog users={users} defaultCategory="drenge" />
          )}
        </div>
        <div class="dashboard-grid">
          {drengeTeams.map((team) => (
            <Card
              title={team.name}
              text={`instruktør: ${team.coachName}`}
              img={team.image}
              href={team.href}
            />
          ))}
        </div>
      </section>
    </>
  );
});
