import { HttpError, page } from "fresh";
import { TEAM_STATUS_LABELS, WEEKDAYS } from "@/api/contracts/team.ts";
import {
  TeamPage,
  type TeamPageData,
  type TeamPageKpi,
} from "@/components/team/TeamPage.tsx";
import { getSettings } from "@/models/settings/index.ts";
import { getTeamBySlug, type TeamDetails } from "@/models/team/index.ts";
import { getUsers } from "@/models/user/index.ts";
import {
  kr,
  minutesBetween,
  pct,
  WEEKS_PER_MONTH,
} from "@/utils/teamEconomics.ts";
import { define } from "@/utils/state.ts";

const DAY_MS = 86_400_000;

/** "18. august 2025" */
const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Time left in the season, relative to today. */
function remainingKpi(team: TeamDetails, today: string): TeamPageKpi {
  const label = "Resterende";
  const until = (iso: string) => {
    const days = Math.ceil((Date.parse(iso) - Date.parse(today)) / DAY_MS);
    return days < 14
      ? `${days} ${days === 1 ? "dag" : "dage"}`
      : `${Math.ceil(days / 7)} uger`;
  };

  if (team.startDate && today < team.startDate) {
    return { label, value: until(team.startDate), sub: "til sæsonstart" };
  }
  if (!team.endDate) return { label, value: "–", sub: "ingen slutdato" };
  if (today > team.endDate) {
    return { label, value: "Afsluttet", sub: "sæsonen er slut" };
  }
  return { label, value: until(team.endDate), sub: "til sæsonslut" };
}

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

    const userById = new Map(users.map((user) => [user._id, user]));
    const roleById = new Map(settings.instructorRoles.map((r) => [r.id, r]));
    const locationName = new Map(
      settings.locations.map((l) => [l.id, l.name]),
    );
    const today = new Date().toISOString().slice(0, 10);

    const { memberCount: members, maxParticipants: max, price } = team;

    // Instructors. A role deleted from settings falls back to its id, rate 0.
    const rows = team.instructors.map((i) => {
      const user = userById.get(i.userId);
      const role = roleById.get(i.role) ??
        { id: i.role, label: i.role, rate: 0, tone: "info" as const };
      const weekly = i.hoursPerWeek * role.rate;
      return {
        name: user?.name ?? "Ukendt bruger",
        roleLabel: role.label,
        tone: role.tone,
        email: user?.email,
        mobile: user?.mobile,
        hoursPerWeek: i.hoursPerWeek,
        rate: role.rate,
        weekly,
        monthly: weekly * WEEKS_PER_MONTH,
      };
    });
    const totalHours = rows.reduce((sum, r) => sum + r.hoursPerWeek, 0);
    const totalWeekly = rows.reduce((sum, r) => sum + r.weekly, 0);

    const kpis: TeamPageKpi[] = [
      {
        label: "Medlemmer",
        value: members === undefined
          ? "–"
          : max
          ? `${members}/${max}`
          : `${members}`,
        sub: members !== undefined && max
          ? `${pct.format(members / max)} fyldt`
          : max
          ? `${max} pladser`
          : undefined,
      },
      {
        label: "Kontingent",
        value: price === undefined ? "–" : `${kr.format(price)} kr.`,
        sub: "pr. person/sæson",
      },
      {
        label: "Start",
        value: team.startDate ? longDate(team.startDate) : "–",
        sub: "aktivitetsstart",
      },
      remainingKpi(team, today),
    ];

    const practical: TeamPageData["practical"] = [];
    if (team.startDate) {
      practical.push({
        label: "Startdato",
        value: longDate(team.startDate),
        icon: "calendar",
      });
    }
    if (team.endDate) {
      practical.push({
        label: "Slutdato",
        value: longDate(team.endDate),
        icon: "calendar",
      });
    }
    if (team.weeks) {
      practical.push({
        label: "Sæsonlængde",
        value: `${team.weeks} uger`,
        icon: "calendar",
      });
    }
    if (team.ageGroup) {
      practical.push({
        label: "Aldersgruppe",
        value: team.ageGroup,
        icon: "users",
      });
    }

    // Sorted by weekday, then start time.
    const sessions = [...team.sessions]
      .sort((a, b) =>
        a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)
      )
      .map((s) => ({
        day: WEEKDAYS.find((d) => d.value === s.weekday)?.label.slice(0, 3) ??
          "?",
        time: `${s.startTime}–${s.endTime}`,
        hours: minutesBetween(s.startTime, s.endTime) / 60,
        place: (s.locationId && locationName.get(s.locationId)) ??
          s.location ?? "Ukendt lokation",
        notes: s.notes,
      }));

    // Season economy, computed as in the team editor.
    const income = members !== undefined && price !== undefined
      ? members * price
      : undefined;
    const wages = team.weeks && totalWeekly > 0
      ? totalWeekly * team.weeks
      : undefined;

    const data: TeamPageData = {
      name: team.name,
      slug: team.slug,
      eyebrow: [team.sport || "Ingen sport", team.ageGroup]
        .filter(Boolean)
        .join(" · "),
      description: team.description,
      active: team.status === "active",
      statusLabel: team.status === "active"
        ? "Aktiv sæson"
        : TEAM_STATUS_LABELS[team.status],
      kpis,
      capacity: members !== undefined && max ? { members, max } : undefined,
      instructors: rows.map((r) => ({
        ...r,
        share: totalHours > 0 ? r.hoursPerWeek / totalHours : 0,
      })),
      totals: {
        hours: totalHours,
        weekly: totalWeekly,
        monthly: totalWeekly * WEEKS_PER_MONTH,
      },
      practical,
      sessions,
      economy: {
        income,
        incomeHint: "Angiv medlemmer og kontingent",
        wages,
        wagesHint: totalWeekly > 0
          ? "Angiv antal uger"
          : "Ingen instruktørtimer",
        fullIncome: max && price !== undefined ? max * price : undefined,
        freeSpots: max && members !== undefined
          ? Math.max(max - members, 0)
          : undefined,
      },
    };

    return page(data);
  },
});

export default define.page<typeof handler>(
  function TeamDetailsPage({ data, state }) {
    return <TeamPage data={data} isAdmin={state.user?.role === "admin"} />;
  },
);
