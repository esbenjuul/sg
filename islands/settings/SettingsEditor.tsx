import { useState } from "preact/hooks";
import { fetchApi } from "@/api/client.ts";
import type { ApiErrorBody } from "@/api/contract.ts";
import {
  type AppSettingsDto,
  LOCATION_TYPE_LABELS,
  type LocationType,
  MAX_INSTRUCTOR_ROLES,
  MAX_LOCATIONS,
  ROLE_TONE_LABELS,
  type RoleTone,
  updateSettings,
} from "@/api/contracts/settings.ts";
import { Button } from "@/components/button/button.tsx";
import { BinIcon, PlusIcon } from "@/components/icons/index.ts";
import { Input } from "@/components/Input/Input.tsx";
import { Select } from "@/components/select/select.tsx";
import { Tag } from "@/components/tag/Tag.tsx";
import "./settings.css";

export interface SettingsEditorProps {
  settings: AppSettingsDto;
  /** Role id → names of the teams that use it. Used roles can't be deleted. */
  roleUsage: Record<string, string[]>;
  /** Location id → names of teams training there. Used ones can't be deleted. */
  locationUsage: Record<string, string[]>;
}

interface RoleRow {
  id: string;
  label: string;
  /** Kept as typed so an empty field stays empty. */
  rate: string;
  tone: RoleTone;
}

const toRows = (settings: AppSettingsDto): RoleRow[] =>
  settings.instructorRoles.map((r) => ({ ...r, rate: String(r.rate) }));

interface LocationRow {
  id: string;
  name: string;
  place: string;
  /** "" until a type is picked. */
  type: LocationType | "";
  /** Kept as typed so an empty field stays empty. */
  capacity: string;
}

const toLocationRows = (settings: AppSettingsDto): LocationRow[] =>
  settings.locations.map((l) => ({ ...l, capacity: String(l.capacity) }));

/** Ids may be stored elsewhere, so they're random and never change. */
const newId = (prefix: string) =>
  `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

/** "" → NaN, which the contract rejects with its "required" message. */
const toNumber = (value: string) =>
  value.trim() === "" ? NaN : Number(value.replace(",", "."));

const LOCATION_TYPE_OPTIONS = Object.entries(LOCATION_TYPE_LABELS).map((
  [value, label],
) => ({ value, label }));

const TONE_OPTIONS = Object.entries(ROLE_TONE_LABELS).map((
  [value, label],
) => ({ value, label }));

function formatSaved(iso?: string) {
  if (!iso) return "Standardværdier – ikke gemt endnu";
  return `Sidst gemt ${
    new Date(iso).toLocaleString("da-DK", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }`;
}

function usedOnText(teams: string[]) {
  const shown = teams.slice(0, 3).join(", ");
  const rest = teams.length > 3 ? ` og ${teams.length - 3} andre` : "";
  return `Bruges på ${teams.length} hold: ${shown}${rest}`;
}

export default function SettingsEditor(
  { settings, roleUsage, locationUsage }: SettingsEditorProps,
) {
  const [roles, setRoles] = useState(() => toRows(settings));
  const [locations, setLocations] = useState(() => toLocationRows(settings));
  const [updatedAt, setUpdatedAt] = useState(settings.updatedAt);
  const [error, setError] = useState<ApiErrorBody["error"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const field = (path: string) => error?.fields?.[path]?.[0];

  const markDirty = () => {
    setSaved(false);
    setDirty(true);
  };

  const change = (update: (prev: RoleRow[]) => RoleRow[]) => {
    markDirty();
    setRoles(update);
  };

  const changeLocations = (
    update: (prev: LocationRow[]) => LocationRow[],
  ) => {
    markDirty();
    setLocations(update);
  };

  const updateLocation = (id: string, patch: Partial<LocationRow>) =>
    changeLocations((prev) =>
      prev.map((l) => l.id === id ? { ...l, ...patch } : l)
    );

  const addLocation = () =>
    changeLocations((prev) => [
      ...prev,
      { id: newId("l"), name: "", place: "", type: "", capacity: "" },
    ]);

  const removeLocation = (id: string) =>
    changeLocations((prev) => prev.filter((l) => l.id !== id));

  const updateRole = (id: string, patch: Partial<RoleRow>) =>
    change((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));

  const addRole = () =>
    change((prev) => [
      ...prev,
      { id: newId("r"), label: "", rate: "", tone: "info" },
    ]);

  const removeRole = (id: string) =>
    change((prev) => prev.filter((r) => r.id !== id));

  const submit = async (e: Event) => {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaved(false);
    setSaving(true);

    const res = await fetchApi(updateSettings, {
      instructorRoles: roles.map((role) => ({
        id: role.id,
        label: role.label,
        rate: toNumber(role.rate),
        tone: role.tone,
      })),
      locations: locations.map((location) => ({
        id: location.id,
        name: location.name,
        place: location.place,
        // "" is rejected by the contract with "Vælg en type".
        type: location.type as LocationType,
        capacity: toNumber(location.capacity),
      })),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRoles(toRows(res.data.settings));
    setLocations(toLocationRows(res.data.settings));
    setUpdatedAt(res.data.settings.updatedAt);
    setSaved(true);
    setDirty(false);
  };

  // Errors that aren't tied to one input (e.g. a used role was removed).
  const listError = field("instructorRoles") ?? field("locations");
  const formError = error && (!error.fields || listError)
    ? listError ?? error.message
    : null;

  return (
    <form class="settings-form" onSubmit={submit} noValidate>
      {formError && <div class="error-message">{formError}</div>}

      <section class="settings-panel" aria-labelledby="settings-roles">
        <header class="settings-panel-header">
          <div>
            <h2 id="settings-roles">Instruktørroller</h2>
            <p>
              Roller og timesatser, der kan vælges, når du tilføjer instruktører
              til et hold. Ændrede satser bruges med det samme i lønberegningen
              på alle hold. En rolle, der bruges på et hold, kan ikke slettes.
            </p>
          </div>
          <Button
            buttonType="tertery"
            onClick={addRole}
            disabled={roles.length >= MAX_INSTRUCTOR_ROLES}
          >
            <PlusIcon />
            <span>Tilføj rolle</span>
          </Button>
        </header>

        <ol class="settings-row-list">
          {roles.map((role, index) => {
            const teams = roleUsage[role.id] ?? [];
            const inUse = teams.length > 0;
            return (
              <li key={role.id} class="settings-row">
                <div class="settings-row-number">
                  <span>Rolle {index + 1}</span>
                  <Tag tone={role.tone}>{role.label || "Ny rolle"}</Tag>
                </div>
                <Input
                  id={`role-${role.id}-label`}
                  type="text"
                  name="label"
                  label="Betegnelse"
                  required
                  maxLength={40}
                  placeholder="Fx Cheftræner"
                  value={role.label}
                  onInput={(e) =>
                    updateRole(role.id, {
                      label: (e.target as HTMLInputElement).value,
                    })}
                  error={field(`instructorRoles.${index}.label`)}
                />
                <Input
                  id={`role-${role.id}-rate`}
                  type="number"
                  name="rate"
                  label="Timesats"
                  required
                  min={0}
                  step={5}
                  suffix="kr./t"
                  value={role.rate}
                  onInput={(e) =>
                    updateRole(role.id, {
                      rate: (e.target as HTMLInputElement).value,
                    })}
                  error={field(`instructorRoles.${index}.rate`)}
                />
                <Select
                  id={`role-${role.id}-tone`}
                  label="Farve"
                  options={TONE_OPTIONS}
                  value={role.tone}
                  onChange={(tone) =>
                    updateRole(role.id, { tone: tone as RoleTone })}
                />
                <div class="settings-row-delete">
                  <Button
                    buttonType="danger"
                    onClick={() => removeRole(role.id)}
                    disabled={inUse || roles.length === 1}
                    aria-label={`Slet ${role.label || "rolle"}`}
                    title={inUse
                      ? `${usedOnText(teams)}. Rollen kan ikke slettes.`
                      : roles.length === 1
                      ? "Der skal være mindst én rolle"
                      : undefined}
                  >
                    <BinIcon />
                  </Button>
                </div>
                {inUse && <p class="settings-row-usage">{usedOnText(teams)}</p>}
              </li>
            );
          })}
        </ol>
      </section>

      <section class="settings-panel" aria-labelledby="settings-locations">
        <header class="settings-panel-header">
          <div>
            <h2 id="settings-locations">Lokationer</h2>
            <p>
              Steder, hvor holdene træner. Kapacitet er det største antal
              personer, der kan være der på én gang.
            </p>
          </div>
          <Button
            buttonType="tertery"
            onClick={addLocation}
            disabled={locations.length >= MAX_LOCATIONS}
          >
            <PlusIcon />
            <span>Tilføj lokation</span>
          </Button>
        </header>

        {locations.length === 0 && (
          <p class="settings-empty">Ingen lokationer endnu.</p>
        )}

        <ol class="settings-row-list">
          {locations.map((location, index) => {
            const teams = locationUsage[location.id] ?? [];
            const inUse = teams.length > 0;
            return (
              <li key={location.id} class="settings-row settings-location">
                <Input
                  id={`location-${location.id}-name`}
                  type="text"
                  name="name"
                  label="Navn"
                  required
                  maxLength={80}
                  placeholder="Fx Svendborg Idrætshal, sal 2"
                  value={location.name}
                  onInput={(e) =>
                    updateLocation(location.id, {
                      name: (e.target as HTMLInputElement).value,
                    })}
                  error={field(`locations.${index}.name`)}
                />
                <Input
                  id={`location-${location.id}-place`}
                  type="text"
                  name="place"
                  label="Sted"
                  required
                  maxLength={120}
                  placeholder="Adresse eller område"
                  value={location.place}
                  onInput={(e) =>
                    updateLocation(location.id, {
                      place: (e.target as HTMLInputElement).value,
                    })}
                  error={field(`locations.${index}.place`)}
                />
                <Select
                  id={`location-${location.id}-type`}
                  label="Type"
                  required
                  placeholder="Vælg type"
                  options={LOCATION_TYPE_OPTIONS}
                  value={location.type}
                  onChange={(type) =>
                    updateLocation(location.id, { type: type as LocationType })}
                  error={field(`locations.${index}.type`)}
                />
                <Input
                  id={`location-${location.id}-capacity`}
                  type="number"
                  name="capacity"
                  label="Kapacitet"
                  required
                  min={1}
                  step={1}
                  suffix="pers."
                  value={location.capacity}
                  onInput={(e) =>
                    updateLocation(location.id, {
                      capacity: (e.target as HTMLInputElement).value,
                    })}
                  error={field(`locations.${index}.capacity`)}
                />
                <div class="settings-row-delete">
                  <Button
                    buttonType="danger"
                    onClick={() => removeLocation(location.id)}
                    disabled={inUse}
                    aria-label={`Slet ${location.name || "lokation"}`}
                    title={inUse
                      ? `${usedOnText(teams)}. Lokationen kan ikke slettes.`
                      : undefined}
                  >
                    <BinIcon />
                  </Button>
                </div>
                {inUse && <p class="settings-row-usage">{usedOnText(teams)}</p>}
              </li>
            );
          })}
        </ol>
      </section>

      <footer class="settings-actions">
        <span class="settings-saved" role="status">
          {saved
            ? "Indstillingerne er gemt."
            : dirty
            ? "Du har ændringer, der ikke er gemt."
            : formatSaved(updatedAt)}
        </span>
        <Button type="submit" buttonType="primary" disabled={saving}>
          {saving ? "Gemmer…" : "Gem indstillinger"}
        </Button>
      </footer>
    </form>
  );
}
