import { HttpError, page } from "fresh";
import { TEAM_STATUS_LABELS, WEEKDAYS } from "@/api/contracts/team.ts";
import { getSettings } from "@/models/settings/index.ts";
import { getTeamBySlug } from "@/models/team/index.ts";
import { getUsers } from "@/models/user/index.ts";
import { define } from "@/utils/state.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const [team, users, settings] = await Promise.all([
      getTeamBySlug(ctx.params.slug),
      getUsers(),
      getSettings(),
    ]);
    if (!team) {
      throw new HttpError(404, "Holdet findes ikke");
    }

    const nameById = new Map(users.map((user) => [user._id, user.name]));
    const roleLabel = new Map(
      settings.instructorRoles.map((r) => [r.id, r.label]),
    );
    const locationName = new Map(
      settings.locations.map((l) => [l.id, l.name]),
    );

    const date = (iso?: string) =>
      iso
        ? new Date(iso).toLocaleDateString("da-DK", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
        : "…";
    const period = team.startDate || team.endDate
      ? `${date(team.startDate)} – ${date(team.endDate)}`
      : undefined;
    const weeks = team.weeks ? `${team.weeks} uger` : undefined;
    const members = team.memberCount !== undefined
      ? team.maxParticipants
        ? `${team.memberCount} af ${team.maxParticipants} pladser`
        : `${team.memberCount}`
      : undefined;

    return page({
      name: team.name,
      slug: team.slug,
      sport: team.sport || "Ikke angivet",
      ageGroup: team.ageGroup,
      status: TEAM_STATUS_LABELS[team.status],
      description: team.description,
      season: [period, weeks].filter(Boolean).join(" · ") || undefined,
      members,
      price: team.price !== undefined
        ? `${team.price.toLocaleString("da-DK")} kr. pr. sæson`
        : undefined,
      image: team.image || "/img/gym.png",
      // Sorted by weekday, then start time.
      sessions: [...team.sessions]
        .sort((a, b) =>
          a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)
        )
        .map((s) => {
          const day = WEEKDAYS.find((d) => d.value === s.weekday)?.label;
          const notes = s.notes ? ` (${s.notes})` : "";
          const place = (s.locationId && locationName.get(s.locationId)) ??
            s.location ?? "Ukendt lokation";
          return `${day} ${s.startTime}–${s.endTime}, ${place}${notes}`;
        }),
      instructors: team.instructors.map((i) => ({
        name: nameById.get(i.userId) ?? "Ukendt bruger",
        role: roleLabel.get(i.role) ?? i.role,
        hoursPerWeek: i.hoursPerWeek,
      })),
    });
  },
});

export default define.page<typeof handler>(
  function TeamDetailsPage({ data: team, state }) {
    return (
      <section class="container">
        <div class="content-box">
          <div class="row row-split row-deck">
            <h2>{team.name}</h2>
            <div class="row">
              {state.user?.role === "admin" && (
                <a href={`/teams/${team.slug}/edit`} class="icon-link">
                  Rediger
                </a>
              )}
              <a href="/teams" class="icon-link">Tilbage til hold</a>
            </div>
          </div>

          <article class="profile-section">
            <div class="profile-info">
              <div class="profile-field">
                <span class="profile-label">Sport:</span>
                <span class="profile-value">{team.sport}</span>
              </div>
              {team.ageGroup && (
                <div class="profile-field">
                  <span class="profile-label">Aldersgruppe:</span>
                  <span class="profile-value">{team.ageGroup}</span>
                </div>
              )}
              <div class="profile-field">
                <span class="profile-label">Status:</span>
                <span class="profile-value">{team.status}</span>
              </div>
              {team.season && (
                <div class="profile-field">
                  <span class="profile-label">Sæson:</span>
                  <span class="profile-value">{team.season}</span>
                </div>
              )}
              {team.members && (
                <div class="profile-field">
                  <span class="profile-label">Medlemmer:</span>
                  <span class="profile-value">{team.members}</span>
                </div>
              )}
              {team.price && (
                <div class="profile-field">
                  <span class="profile-label">Kontingent:</span>
                  <span class="profile-value">{team.price}</span>
                </div>
              )}
              <div class="profile-field">
                <span class="profile-label">Instruktører:</span>
                <span class="profile-value">
                  {team.instructors.length === 0 ? "Ingen" : team.instructors
                    .map((i) =>
                      `${i.name} (${i.role}, ${i.hoursPerWeek} t/uge)`
                    )
                    .join(", ")}
                </span>
              </div>
              <div class="profile-field">
                <span class="profile-label">Træninger:</span>
                <span class="profile-value">
                  {team.sessions.length === 0
                    ? "Ingen"
                    : (
                      <ul class="profile-list">
                        {team.sessions.map((session) => (
                          <li key={session}>{session}</li>
                        ))}
                      </ul>
                    )}
                </span>
              </div>
            </div>
            {team.description && <p>{team.description}</p>}
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
  },
);
