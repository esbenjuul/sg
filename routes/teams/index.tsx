import { HttpError, page } from "fresh";
import { SPORTS } from "@/api/contracts/team.ts";
import Card from "@/components/card/card.tsx";
import { PlusIcon } from "@/components/icons/index.ts";
import { getTeams } from "@/models/team/index.ts";
import { getUsers } from "@/models/user/index.ts";
import { define } from "@/utils/state.ts";

interface TeamCardData {
  name: string;
  text: string;
  image: string;
  href: string;
}

interface SportGroup {
  sport: string;
  teams: TeamCardData[];
}

/** Sport groups in SPORTS order; teams without a sport go last. */
function groupBySport(
  teams: (TeamCardData & { sport: string })[],
): SportGroup[] {
  const order: string[] = [...SPORTS, ""];
  return order
    .map((sport) => ({
      sport: sport || "Uden sport",
      teams: teams.filter((team) => team.sport === sport),
    }))
    .filter((group) => group.teams.length > 0);
}

export const handler = define.handlers({
  async GET() {
    try {
      const [teams, users] = await Promise.all([getTeams(), getUsers()]);
      const nameById = new Map(users.map((user) => [user._id, user.name]));

      const cards = teams.map((team) => {
        const names = team.instructors
          .map((i) => nameById.get(i.userId))
          .filter(Boolean);
        return {
          name: team.name,
          sport: team.sport,
          text: names.length
            ? `Instruktør: ${names.join(", ")}`
            : "Ingen instruktør",
          image: team.image || "/img/gym.png",
          href: `/teams/${team.slug}`,
        };
      });

      return page({ count: teams.length, groups: groupBySport(cards) });
    } catch (err) {
      console.error(err);
      throw new HttpError(500);
    }
  },
});

export default define.page<typeof handler>(function TeamsPage({ data, state }) {
  return (
    <div class="container">
      <header class="page-header">
        <h1>Hold</h1>
        <span class="page-header-subtitle">
          Der er i øjeblikket {data.count} hold
        </span>
        <div class="page-header-action">
          {state.user?.role === "admin" && (
            <a href="/teams/new" class="button button-primary">
              <div>
                <PlusIcon />
                <span>Opret hold</span>
              </div>
            </a>
          )}
        </div>
      </header>

      {data.groups.map((group) => (
        <section key={group.sport}>
          <h3>{group.sport}</h3>
          <div class="dashboard-grid">
            {group.teams.map((team) => (
              <Card
                title={team.name}
                text={team.text}
                img={team.image}
                href={team.href}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
});
