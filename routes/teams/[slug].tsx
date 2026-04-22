import { HttpError, page } from "fresh";
import { define } from "@/utils/state.ts";
import { getTeamBySlug } from "@/models/team/team.ts";
import { findUserById } from "@/models/user/user.ts";

interface TeamDetailsData {
  name: string;
  category: string;
  coachName: string;
  image: string;
}

export const handler = define.handlers({
  async GET(ctx) {
    const slug = ctx.params.slug;
    if (!slug) {
      throw new HttpError(404, "Team not found");
    }

    try {
      const team = await getTeamBySlug(slug);
      if (!team) {
        throw new HttpError(404, "Team not found");
      }

      let coachName = "No coach assigned";
      const coachId = team.coachUserId?.toString();
      if (coachId) {
        const coach = await findUserById(coachId);
        if (coach) {
          coachName = coach.name;
        }
      }

      return page<TeamDetailsData>({
        name: team.name,
        category: team.category,
        coachName,
        image: team.image || "/img/gym.png",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      console.error(error);
      throw new HttpError(500);
    }
  },
});

export default define.page<typeof handler>(function TeamDetailsPage(ctx) {
  const team = ctx.data;

  return (
    <section class="container">
      <div class="content-box">
        <div class="row row-split row-deck">
          <h2>{team.name}</h2>
          <a href="/teams" class="icon-link">Back to teams</a>
        </div>

        <article class="profile-section">
          <div class="profile-info">
            <div class="profile-field">
              <span class="profile-label">Category:</span>
              <span class="profile-value">{team.category}</span>
            </div>
            <div class="profile-field">
              <span class="profile-label">Coach:</span>
              <span class="profile-value">{team.coachName}</span>
            </div>
          </div>
        </article>

        <figure style="margin-top: 1rem;">
          <img
            src={team.image}
            alt={team.name}
            style="max-width: 280px; width: 100%; border-radius: 8px;"
          />
        </figure>
      </div>
    </section>
  );
});
