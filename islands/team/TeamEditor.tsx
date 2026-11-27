import { useMemo, useState } from "preact/hooks";
import { fetchApi } from "@/api/client.ts";
import type { ApiErrorBody, InputOf } from "@/api/contract.ts";
import {
  createTeam,
  deleteTeam,
  type InstructorRole,
  MAX_SESSIONS,
  SPORTS,
  TEAM_STATUS_LABELS,
  type TeamDto,
  type TeamStatus,
  updateTeam,
  WEEKDAYS,
} from "@/api/contracts/team.ts";
import {
  type InstructorRoleSetting,
  LOCATION_TYPE_LABELS,
  type LocationSetting,
} from "@/api/contracts/settings.ts";
import { Avatar } from "@/components/avatar/avatar.tsx";
import { Button } from "@/components/button/button.tsx";
import Dialog, { type CloseReason } from "@/components/dialog/dialog.tsx";
import {
  ArrowLeftIcon,
  BinIcon,
  CloseIcon,
  PlusIcon,
} from "@/components/icons/index.ts";
import { Input } from "@/components/Input/Input.tsx";
import { Select } from "@/components/select/select.tsx";
import { Tag } from "@/components/tag/Tag.tsx";
import { Textarea } from "@/components/textarea/Textarea.tsx";
import {
  kr,
  minutesBetween,
  num,
  pct,
  signedKr,
  WEEKS_PER_MONTH,
  weeksBetween,
} from "@/utils/teamEconomics.ts";
import "./team-editor.css";

export interface InstructorOption {
  id: string;
  name: string;
}

export interface TeamEditorProps {
  /** The team to edit. Omit to create a new one. */
  team?: TeamDto | null;
  instructors: InstructorOption[];
  /** Role names and hourly rates from the admin settings, in display order. */
  roles: InstructorRoleSetting[];
  /** Locations from the admin settings, for the training sessions. */
  locations: LocationSetting[];
}

interface Row {
  /** Stable key for rendering; not sent to the server. */
  key: number;
  userId: string;
  role: InstructorRole;
  /** Kept as typed so an empty field stays empty. */
  hours: string;
}

function hoursOf(row: Row): number {
  const hours = Number(row.hours.replace(",", "."));
  return row.hours.trim() === "" || Number.isNaN(hours) ? NaN : hours;
}

/** "" → undefined; anything unparseable → NaN, which the contract rejects. */
function optionalNumber(value: string): number | undefined {
  const trimmed = value.trim().replace(",", ".");
  return trimmed === "" ? undefined : Number(trimmed);
}

function isNumber(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value);
}

const str = (value: number | undefined) =>
  value === undefined ? "" : String(value);

interface SessionRow {
  /** Stable key for rendering; not sent to the server. */
  key: number;
  /** "" until a location is picked. */
  locationId: string;
  /** Free text saved before locations existed, shown until one is picked. */
  legacyLocation?: string;
  /** "" until a day is picked. */
  weekday: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const weekdayLabel = (weekday: string) =>
  WEEKDAYS.find((d) => String(d.value) === weekday)?.label;

let nextKey = 0;

export default function TeamEditor(
  { team, instructors, roles, locations }: TeamEditorProps,
) {
  // A role deleted from settings after this page loaded falls back to its id.
  const roleOf = (id: InstructorRole): InstructorRoleSetting =>
    roles.find((r) => r.id === id) ??
      { id, label: id, rate: 0, tone: "info" };

  const isEdit = Boolean(team);
  const backHref = team ? `/teams/${team.slug}` : "/teams";

  const [name, setName] = useState(team?.name ?? "");
  const [sport, setSport] = useState(team?.sport ?? "");
  const [ageGroup, setAgeGroup] = useState(team?.ageGroup ?? "");
  const [status, setStatus] = useState<TeamStatus>(team?.status ?? "active");
  const [description, setDescription] = useState(team?.description ?? "");
  const [rows, setRows] = useState<Row[]>(
    () =>
      (team?.instructors ?? []).map((i) => ({
        key: nextKey++,
        userId: i.userId,
        role: i.role,
        hours: String(i.hoursPerWeek),
      })),
  );

  const [memberCount, setMemberCount] = useState(str(team?.memberCount));
  const [maxParticipants, setMaxParticipants] = useState(
    str(team?.maxParticipants),
  );
  const [price, setPrice] = useState(str(team?.price));
  const [startDate, setStartDate] = useState(team?.startDate ?? "");
  const [endDate, setEndDate] = useState(team?.endDate ?? "");
  const [weeks, setWeeks] = useState(str(team?.weeks));
  // While false, the week count follows the dates. Typing a number of weeks
  // (e.g. to skip holidays) turns that off; clearing the field turns it on.
  const [weeksTouched, setWeeksTouched] = useState(
    team?.weeks !== undefined &&
      team.weeks !== weeksBetween(team.startDate ?? "", team.endDate ?? ""),
  );

  const [sessions, setSessions] = useState<SessionRow[]>(
    () =>
      (team?.sessions ?? []).map((session) => ({
        key: nextKey++,
        // Old free-text sessions are matched to a location by name.
        locationId: session.locationId ??
          locations.find((l) =>
            l.name.trim().toLowerCase() ===
              session.location?.trim().toLowerCase()
          )?.id ??
          "",
        legacyLocation: session.locationId ? undefined : session.location,
        weekday: String(session.weekday),
        startTime: session.startTime,
        endTime: session.endTime,
        notes: session.notes ?? "",
      })),
  );

  const [error, setError] = useState<ApiErrorBody["error"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const nameById = useMemo(
    () => new Map(instructors.map((i) => [i.id, i.name])),
    [instructors],
  );
  const field = (path: string) => error?.fields?.[path]?.[0];

  const updateRow = (key: number, change: Partial<Row>) =>
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, ...change } : r));

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        key: nextKey++,
        userId: "",
        // Roles are listed most senior first: give the first row the first
        // role and later rows the second.
        role: (prev.some((r) => r.role === roles[0]?.id)
          ? roles[1] ?? roles[0]
          : roles[0])?.id ?? "",
        hours: "",
      },
    ]);

  const updateSession = (key: number, change: Partial<SessionRow>) =>
    setSessions((prev) =>
      prev.map((s) => s.key === key ? { ...s, ...change } : s)
    );

  const addSession = () =>
    setSessions((prev) => [
      ...prev,
      {
        key: nextKey++,
        // Teams usually train in the same hall, so start from the last one.
        locationId: prev.at(-1)?.locationId ?? "",
        weekday: "",
        startTime: "",
        endTime: "",
        notes: "",
      },
    ]);

  const locationById = new Map(locations.map((l) => [l.id, l]));
  const locationOptions = locations.map((l) => ({
    value: l.id,
    label: `${l.name} (${LOCATION_TYPE_LABELS[l.type].toLowerCase()})`,
  }));

  const removeSession = (key: number) =>
    setSessions((prev) => prev.filter((s) => s.key !== key));

  const sessionMinutes = sessions.reduce((sum, s) => {
    const minutes = minutesBetween(s.startTime, s.endTime);
    return minutes > 0 ? sum + minutes : sum;
  }, 0);

  const removeRow = (key: number) =>
    setRows((prev) => prev.filter((r) => r.key !== key));

  const totals = rows.reduce(
    (sum, row) => {
      const hours = hoursOf(row);
      if (Number.isNaN(hours)) return sum;
      return {
        hours: sum.hours + hours,
        weekly: sum.weekly + hours * roleOf(row.role).rate,
      };
    },
    { hours: 0, weekly: 0 },
  );

  const changeDates = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (!weeksTouched) setWeeks(str(weeksBetween(start, end)));
  };

  // Season economics. Each figure is shown only once its inputs are filled.
  const members = optionalNumber(memberCount);
  const capacity = optionalNumber(maxParticipants);
  const fee = optionalNumber(price);
  const seasonWeeks = optionalNumber(weeks);
  const suggestedWeeks = weeksBetween(startDate, endDate);
  const income = isNumber(members) && isNumber(fee) ? members * fee : undefined;
  const fullIncome = isNumber(capacity) && isNumber(fee)
    ? capacity * fee
    : undefined;
  const wages = isNumber(seasonWeeks) && totals.weekly > 0
    ? totals.weekly * seasonWeeks
    : undefined;
  const overbooked = isNumber(members) && isNumber(capacity) &&
      members > capacity
    ? members - capacity
    : 0;

  const submit = async (e: Event) => {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);

    const fields: InputOf<typeof createTeam> = {
      name,
      // Checked against the sport picklist by the contract.
      sport: sport as InputOf<typeof createTeam>["sport"],
      ageGroup,
      status,
      description,
      instructors: rows.map((row) => ({
        userId: row.userId,
        role: row.role,
        hoursPerWeek: hoursOf(row),
      })),
      memberCount: members,
      maxParticipants: capacity,
      price: fee,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      weeks: seasonWeeks,
      sessions: sessions.map((s) => ({
        locationId: s.locationId,
        // "" → NaN, which the contract rejects with "Vælg en ugedag".
        weekday: s.weekday === "" ? NaN : Number(s.weekday),
        startTime: s.startTime,
        endTime: s.endTime,
        notes: s.notes,
      })),
    };

    const res = team
      ? await fetchApi(updateTeam, { id: team.id, ...fields })
      : await fetchApi(createTeam, fields);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    globalThis.location.assign(`/teams/${res.data.team.slug}`);
  };

  const handleDeleteClose = async (reason: CloseReason) => {
    if (reason === "cancel" || !team) {
      setDeleteOpen(false);
      return;
    }
    setDeleting(true);
    const res = await fetchApi(deleteTeam, { id: team.id });
    if (!res.ok) {
      setDeleting(false);
      setDeleteOpen(false);
      setError(res.error);
      return;
    }
    globalThis.location.assign("/teams");
  };

  // Errors that aren't tied to a field shown in the form.
  const formError = error && (!error.fields || field("instructors"))
    ? field("instructors") ?? error.message
    : null;

  return (
    <div class="container team-editor">
      <header class="team-editor-header">
        <a href={backHref} class="team-editor-back" aria-label="Tilbage">
          <ArrowLeftIcon />
        </a>
        <div>
          <h1>{team ? `Rediger: ${team.name}` : "Opret hold"}</h1>
          <p class="page-header-subtitle">Udfyld informationerne for holdet</p>
        </div>
        {isEdit && (
          <Button
            buttonType="danger"
            onClick={() => setDeleteOpen(true)}
          >
            <BinIcon />
            <span>Slet</span>
          </Button>
        )}
      </header>

      <form onSubmit={submit} noValidate>
        {formError && <div class="error-message">{formError}</div>}

        <section class="team-panel team-panel-basic">
          <h2>Grundlæggende information</h2>
          <div class="team-form-grid">
            <Input
              id="team-name"
              type="text"
              name="name"
              label="Holdnavn"
              required
              placeholder="Fx Ungdomsgymnastik U10"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              error={field("name")}
            />
            <Select
              id="team-sport"
              name="sport"
              label="Sport"
              required
              placeholder="Vælg sport"
              options={SPORTS.map((s) => ({ value: s, label: s }))}
              value={sport}
              onChange={setSport}
              error={field("sport")}
            />
            <Input
              id="team-age-group"
              type="text"
              name="ageGroup"
              label="Aldersgruppe"
              placeholder="Fx 7–10 år"
              value={ageGroup}
              onInput={(e) => setAgeGroup((e.target as HTMLInputElement).value)}
              error={field("ageGroup")}
            />
            <Select
              id="team-status"
              name="status"
              label="Status"
              options={Object.entries(TEAM_STATUS_LABELS).map((
                [value, label],
              ) => ({ value, label }))}
              value={status}
              onChange={(value) => setStatus(value as TeamStatus)}
              error={field("status")}
            />
            <div class="team-form-wide">
              <Textarea
                id="team-description"
                name="description"
                label="Beskrivelse"
                placeholder="Hvad træner holdet, og hvem er det for?"
                value={description}
                onInput={setDescription}
                error={field("description")}
              />
            </div>
          </div>
        </section>

        <section class="team-panel">
          <div class="team-panel-header">
            <h2>Instruktører</h2>
            <Button buttonType="tertery" onClick={addRow}>
              <PlusIcon />
              <span>Tilføj instruktør</span>
            </Button>
          </div>
          <ul class="team-role-legend" aria-label="Roller og timesatser">
            {roles.map((role, index) => (
              <li key={role.id}>
                <Tag tone={role.tone}>
                  Rolle {index + 1}: {role.label} · {role.rate} kr./t
                </Tag>
              </li>
            ))}
          </ul>

          {rows.length === 0 && (
            <p class="team-empty">
              Ingen instruktører på holdet endnu.
            </p>
          )}

          <ol class="instructor-list">
            {rows.map((row, index) => {
              const role = roleOf(row.role);
              const hours = hoursOf(row);
              const weekly = hours * role.rate;
              const rowName = nameById.get(row.userId);
              const taken = new Set(
                rows.filter((r) => r.key !== row.key).map((r) => r.userId),
              );
              const id = `instructor-${row.key}`;
              return (
                <li key={row.key} class="instructor-row">
                  <header>
                    {rowName
                      ? <Avatar name={rowName} />
                      : (
                        <span class="instructor-placeholder">
                          Ny instruktør
                        </span>
                      )}
                    <Tag tone={role.tone}>{role.label}</Tag>
                    <button
                      type="button"
                      class="reset-button instructor-remove"
                      onClick={() => removeRow(row.key)}
                      aria-label={`Fjern ${rowName ?? "instruktør"}`}
                    >
                      <CloseIcon />
                    </button>
                  </header>
                  <div class="instructor-fields">
                    <Select
                      id={`${id}-user`}
                      label="Instruktør"
                      placeholder="Vælg instruktør"
                      required
                      options={instructors.map((i) => ({
                        value: i.id,
                        label: i.name,
                        disabled: taken.has(i.id),
                      }))}
                      value={row.userId}
                      onChange={(userId) => updateRow(row.key, { userId })}
                      error={field(`instructors.${index}.userId`)}
                    />
                    <Select
                      id={`${id}-role`}
                      label="Rolle"
                      options={roles.map((r, i) => ({
                        value: r.id,
                        label: `Rolle ${i + 1} — ${r.label} (${r.rate} kr./t)`,
                      }))}
                      value={row.role}
                      onChange={(value) =>
                        updateRow(row.key, { role: value as InstructorRole })}
                      error={field(`instructors.${index}.role`)}
                    />
                    <Input
                      id={`${id}-hours`}
                      type="number"
                      name="hoursPerWeek"
                      label="Timer/uge"
                      min={0}
                      max={40}
                      step={0.5}
                      suffix="t"
                      value={row.hours}
                      onInput={(e) =>
                        updateRow(row.key, {
                          hours: (e.target as HTMLInputElement).value,
                        })}
                      error={field(`instructors.${index}.hoursPerWeek`)}
                    />
                  </div>
                  <p class="instructor-cost">
                    {Number.isNaN(hours) ? "Angiv timer for at beregne løn" : (
                      <>
                        {num.format(hours)} t × {role.rate} kr. ={" "}
                        <strong>
                          {kr.format(weekly)} kr./uge ·{" "}
                          {kr.format(weekly * WEEKS_PER_MONTH)} kr./md.
                        </strong>
                      </>
                    )}
                  </p>
                </li>
              );
            })}
          </ol>

          {rows.length > 0 && (
            <p class="team-total">
              I alt {num.format(totals.hours)} t/uge ·{" "}
              <strong>
                {kr.format(totals.weekly)} kr./uge ·{" "}
                {kr.format(totals.weekly * WEEKS_PER_MONTH)} kr./md.
              </strong>
            </p>
          )}
        </section>

        <section class="team-panel">
          <h2>Datoer og lokationer</h2>
          <div class="team-form-grid team-form-grid-3">
            <Input
              id="team-start-date"
              type="date"
              name="startDate"
              label="Startdato"
              value={startDate}
              onInput={(e) =>
                changeDates((e.target as HTMLInputElement).value, endDate)}
              error={field("startDate")}
            />
            <Input
              id="team-end-date"
              type="date"
              name="endDate"
              label="Slutdato"
              value={endDate}
              onInput={(e) =>
                changeDates(startDate, (e.target as HTMLInputElement).value)}
              error={field("endDate")}
            />
            <Input
              id="team-weeks"
              type="number"
              name="weeks"
              label="Antal uger"
              min={1}
              max={60}
              step={1}
              suffix="uger"
              placeholder="Beregnes ud fra datoer"
              value={weeks}
              onInput={(e) => {
                const value = (e.target as HTMLInputElement).value;
                setWeeks(value);
                setWeeksTouched(value.trim() !== "");
              }}
              error={field("weeks")}
            />
          </div>
          {weeksTouched && suggestedWeeks !== undefined &&
            seasonWeeks !== suggestedWeeks && (
            <p class="team-hint">
              Perioden fra start til slut er {suggestedWeeks} uger.{" "}
              <button
                type="button"
                class="reset-button team-link-button"
                onClick={() => {
                  setWeeks(String(suggestedWeeks));
                  setWeeksTouched(false);
                }}
              >
                Brug {suggestedWeeks} uger
              </button>
            </p>
          )}
        </section>

        <section class="team-panel">
          <h2>Medlemmer og kontingent</h2>
          <div class="team-form-grid team-form-grid-3">
            <Input
              id="team-member-count"
              type="number"
              name="memberCount"
              label="Aktuelle medlemmer"
              min={0}
              step={1}
              placeholder="0"
              value={memberCount}
              onInput={(e) =>
                setMemberCount((e.target as HTMLInputElement).value)}
              error={field("memberCount")}
            />
            <Input
              id="team-max-participants"
              type="number"
              name="maxParticipants"
              label="Maks. deltagere"
              min={1}
              step={1}
              placeholder="Fx 24"
              value={maxParticipants}
              onInput={(e) =>
                setMaxParticipants((e.target as HTMLInputElement).value)}
              error={field("maxParticipants")}
            />
            <Input
              id="team-price"
              type="number"
              name="price"
              label="Kontingent pr. sæson"
              min={0}
              step={1}
              suffix="kr."
              placeholder="Fx 1200"
              value={price}
              onInput={(e) => setPrice((e.target as HTMLInputElement).value)}
              error={field("price")}
            />
          </div>
          {overbooked > 0 && (
            <p class="team-warning">
              Holdet har {overbooked} flere medlemmer end der er pladser.
            </p>
          )}

          <dl class="season-summary">
            <div>
              <dt>Indtægt for sæsonen</dt>
              <dd>
                {income === undefined ? "Angiv medlemmer og kontingent" : (
                  <>
                    {members} × {kr.format(fee!)} kr. ={" "}
                    <strong>{kr.format(income)} kr.</strong>
                  </>
                )}
              </dd>
            </div>
            {fullIncome !== undefined && (
              <div>
                <dt>Ved fuldt hold</dt>
                <dd>
                  {capacity} × {kr.format(fee!)} kr. ={" "}
                  <strong>{kr.format(fullIncome)} kr.</strong>
                  {isNumber(members) && (
                    <span class="season-muted">
                      {` · ${
                        pct.format(members / capacity!)
                      } af pladserne er besat`}
                    </span>
                  )}
                </dd>
              </div>
            )}
            <div>
              <dt>Instruktørløn for sæsonen</dt>
              <dd>
                {wages !== undefined
                  ? (
                    <>
                      {kr.format(totals.weekly)} kr./uge × {seasonWeeks} uger =
                      {" "}
                      <strong>{kr.format(wages)} kr.</strong>
                    </>
                  )
                  : totals.weekly > 0
                  ? "Angiv antal uger ovenfor for at beregne"
                  : "Ingen instruktørtimer angivet"}
              </dd>
            </div>
            {income !== undefined && wages !== undefined && (
              <div class="season-result">
                <dt>Resultat for sæsonen</dt>
                <dd
                  class={income - wages < 0
                    ? "season-negative"
                    : "season-positive"}
                >
                  <strong>{signedKr.format(income - wages)} kr.</strong>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section class="team-panel">
          <div class="team-panel-header">
            <h2>Træninger</h2>
            <Button
              buttonType="tertery"
              onClick={addSession}
              disabled={sessions.length >= MAX_SESSIONS ||
                locations.length === 0}
            >
              <PlusIcon />
              <span>Tilføj træning</span>
            </Button>
          </div>

          {locations.length === 0 && (
            <p class="team-warning">
              Der er ingen lokationer endnu.{" "}
              <a href="/settings">Opret lokationer under Indstillinger</a>{" "}
              for at kunne tilføje træninger.
            </p>
          )}

          {sessions.length === 0 && (
            <p class="team-empty">Ingen træninger på holdet endnu.</p>
          )}

          <ol class="session-list">
            {sessions.map((session, index) => {
              const id = `session-${session.key}`;
              const day = weekdayLabel(session.weekday);
              const location = locationById.get(session.locationId);
              // Compare with the team's max size, else its current members.
              const teamSize = isNumber(capacity) ? capacity : members;
              const tooSmall = location && isNumber(teamSize) &&
                teamSize > location.capacity;
              const minutes = minutesBetween(
                session.startTime,
                session.endTime,
              );
              const summary = [
                day,
                session.startTime && session.endTime
                  ? `${session.startTime}–${session.endTime}`
                  : undefined,
                location?.name,
              ].filter(Boolean).join(" · ");
              return (
                <li key={session.key} class="session-row">
                  <header>
                    <span class="session-title">
                      {summary || "Ny træning"}
                    </span>
                    {minutes > 0 && (
                      <Tag tone="info">{num.format(minutes / 60)} t</Tag>
                    )}
                    <button
                      type="button"
                      class="reset-button instructor-remove"
                      onClick={() => removeSession(session.key)}
                      aria-label={`Fjern træning ${summary}`}
                    >
                      <CloseIcon />
                    </button>
                  </header>
                  <div class="session-fields">
                    <div class="session-location">
                      <Select
                        id={`${id}-location`}
                        label="Lokation"
                        required
                        placeholder="Vælg lokation"
                        options={locationOptions}
                        value={session.locationId}
                        onChange={(locationId) =>
                          updateSession(session.key, { locationId })}
                        error={field(`sessions.${index}.locationId`)}
                      />
                      {session.legacyLocation && !session.locationId && (
                        <p class="session-hint">
                          Tidligere angivet som "{session.legacyLocation}". Vælg
                          den lokation, det svarer til.
                        </p>
                      )}
                      {location && (
                        <p class={tooSmall ? "team-warning" : "session-hint"}>
                          {location.place} ·{" "}
                          {LOCATION_TYPE_LABELS[location.type]} · plads til{" "}
                          {location.capacity}
                          {tooSmall &&
                            ` – holdet kan have op til ${teamSize} deltagere`}
                        </p>
                      )}
                    </div>
                    <Select
                      id={`${id}-weekday`}
                      label="Ugedag"
                      required
                      placeholder="Vælg dag"
                      options={WEEKDAYS.map((d) => ({
                        value: String(d.value),
                        label: d.label,
                      }))}
                      value={session.weekday}
                      onChange={(weekday) =>
                        updateSession(session.key, { weekday })}
                      error={field(`sessions.${index}.weekday`)}
                    />
                    <Input
                      id={`${id}-start`}
                      type="time"
                      name="startTime"
                      label="Fra"
                      required
                      step={300}
                      value={session.startTime}
                      onInput={(e) =>
                        updateSession(session.key, {
                          startTime: (e.target as HTMLInputElement).value,
                        })}
                      error={field(`sessions.${index}.startTime`)}
                    />
                    <Input
                      id={`${id}-end`}
                      type="time"
                      name="endTime"
                      label="Til"
                      required
                      step={300}
                      value={session.endTime}
                      onInput={(e) =>
                        updateSession(session.key, {
                          endTime: (e.target as HTMLInputElement).value,
                        })}
                      error={field(`sessions.${index}.endTime`)}
                    />
                    <div class="session-notes">
                      <Input
                        id={`${id}-notes`}
                        type="text"
                        name="notes"
                        label="Noter"
                        maxLength={200}
                        placeholder="Fx styrketræning, springtræning"
                        value={session.notes}
                        onInput={(e) =>
                          updateSession(session.key, {
                            notes: (e.target as HTMLInputElement).value,
                          })}
                        error={field(`sessions.${index}.notes`)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {sessionMinutes > 0 && (
            <p class="team-total">
              I alt{" "}
              <strong>
                {num.format(sessionMinutes / 60)} t træning om ugen
              </strong>{" "}
              fordelt på {sessions.length}{" "}
              {sessions.length === 1 ? "træning" : "træninger"}
            </p>
          )}
        </section>

        <footer class="team-editor-actions">
          <a href={backHref} class="button button-secondary">
            <div>Annuller</div>
          </a>
          <Button type="submit" buttonType="primary" disabled={saving}>
            {saving ? "Gemmer…" : isEdit ? "Gem ændringer" : "Opret hold"}
          </Button>
        </footer>
      </form>

      {team && (
        <Dialog
          isOpen={isDeleteOpen}
          onClose={handleDeleteClose}
          title="Slet hold"
          confirmText={deleting ? "Sletter…" : "Slet hold"}
          canClose={!deleting}
        >
          <p>
            Er du sikker på, at du vil slette{" "}
            <strong>{team.name}</strong>? Det kan ikke fortrydes.
          </p>
        </Dialog>
      )}
    </div>
  );
}
