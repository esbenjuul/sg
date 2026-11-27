import type { ComponentChildren } from "preact";
import type { RoleTone } from "@/api/contracts/settings.ts";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  UsersIcon,
} from "@/components/icons/index.ts";
import { Tag } from "@/components/tag/Tag.tsx";
import { kr, num, pct, signedKr } from "@/utils/teamEconomics.ts";

export interface TeamPageKpi {
  label: string;
  value: string;
  sub?: string;
}

export interface TeamPageInstructor {
  name: string;
  roleLabel: string;
  tone: RoleTone;
  email?: string;
  mobile?: string;
  hoursPerWeek: number;
  /** DKK per hour from the role. */
  rate: number;
  /** DKK per week. */
  weekly: number;
  /** DKK per month, estimated. */
  monthly: number;
  /** Share of the team's weekly instructor hours, 0–1. */
  share: number;
}

export interface TeamPageSession {
  day: string;
  time: string;
  /** Hours, or NaN if unknown. */
  hours: number;
  place: string;
  notes?: string;
}

/** Season economy. A figure is undefined when its inputs are missing. */
export interface TeamPageEconomy {
  income?: number;
  incomeHint?: string;
  wages?: number;
  wagesHint?: string;
  fullIncome?: number;
  freeSpots?: number;
}

export interface TeamPageData {
  name: string;
  slug: string;
  eyebrow: string;
  description?: string;
  active: boolean;
  statusLabel: string;
  kpis: TeamPageKpi[];
  capacity?: { members: number; max: number };
  instructors: TeamPageInstructor[];
  totals: { hours: number; weekly: number; monthly: number };
  practical: { label: string; value: string; icon: "calendar" | "users" }[];
  sessions: TeamPageSession[];
  economy: TeamPageEconomy;
}

function Panel(
  { title, aside, children, class: className }: {
    title: string;
    aside?: ComponentChildren;
    children: ComponentChildren;
    class?: string;
  },
) {
  return (
    <section class={["tp-panel", className].filter(Boolean).join(" ")}>
      <header class="tp-panel-header">
        <h2>{title}</h2>
        {aside && <span class="tp-muted">{aside}</span>}
      </header>
      {children}
    </section>
  );
}

function Meter(
  { ratio, tone }: { ratio: number; tone?: "accent" | "danger" },
) {
  const width = `${Math.min(Math.max(ratio, 0), 1) * 100}%`;
  return (
    <div class={`tp-meter${tone ? ` tp-meter-${tone}` : ""}`}>
      <span style={{ width }} />
    </div>
  );
}

function Hero({ data, isAdmin }: { data: TeamPageData; isAdmin: boolean }) {
  return (
    <>
      <div class="tp-topbar">
        <a href="/teams" class="tp-back">
          <ArrowLeftIcon />
          <span>Alle hold</span>
        </a>
        {isAdmin && (
          <a
            href={`/teams/${data.slug}/edit`}
            class="button button-primary tp-edit"
          >
            <div>
              <PencilIcon />
              <span>Rediger</span>
            </div>
          </a>
        )}
      </div>

      <section class="tp-summary">
        <div class="tp-hero">
          <div>
            <p class="tp-eyebrow">{data.eyebrow}</p>
            <h1>{data.name}</h1>
            {data.description && <p class="tp-lead">{data.description}</p>}
          </div>
          <span class={`tp-status${data.active ? "" : " tp-status-off"}`}>
            {data.statusLabel}
          </span>
        </div>

        <dl class="tp-kpis">
          {data.kpis.map((kpi) => (
            <div key={kpi.label}>
              <dt>{kpi.label}</dt>
              <dd>
                <strong>{kpi.value}</strong>
                {kpi.sub && <span>{kpi.sub}</span>}
              </dd>
            </div>
          ))}
        </dl>

        {data.capacity && (
          <div class="tp-capacity">
            <div class="tp-capacity-label">
              <span>Holdkapacitet</span>
              <strong>
                {data.capacity.members} / {data.capacity.max} pladser
              </strong>
            </div>
            <Meter
              ratio={data.capacity.members / data.capacity.max}
              tone={data.capacity.members > data.capacity.max
                ? "danger"
                : undefined}
            />
          </div>
        )}
      </section>
    </>
  );
}

function Instructors({ data }: { data: TeamPageData }) {
  const { instructors, totals } = data;
  return (
    <Panel
      title="Instruktører"
      class="tp-instructors"
      aside={`${instructors.length} ${
        instructors.length === 1 ? "person" : "personer"
      } · ${num.format(totals.hours)} t/uge samlet`}
    >
      {instructors.length === 0
        ? <p class="tp-empty">Ingen instruktører på holdet endnu.</p>
        : (
          <ul class="tp-instructor-list">
            {instructors.map((i, index) => (
              <li key={index} class="tp-instructor">
                <span class="tp-avatar" aria-hidden="true">
                  {i.name.charAt(0).toUpperCase()}
                </span>
                <div class="tp-instructor-body">
                  <div class="tp-instructor-head">
                    <div>
                      <div class="tp-instructor-name">
                        <strong>{i.name}</strong>
                        <Tag tone={i.tone}>{i.roleLabel}</Tag>
                      </div>
                      <div class="tp-contact">
                        {i.email && (
                          <a href={`mailto:${i.email}`}>
                            <MailIcon />
                            {i.email}
                          </a>
                        )}
                        {i.mobile && (
                          <a href={`tel:${i.mobile}`}>
                            <PhoneIcon />
                            {i.mobile}
                          </a>
                        )}
                      </div>
                    </div>
                    <div class="tp-instructor-week">
                      <span>Uge</span>
                      <strong>{kr.format(i.weekly)} kr.</strong>
                    </div>
                  </div>

                  <dl class="tp-tiles">
                    <div>
                      <dt>Timer/uge</dt>
                      <dd>{num.format(i.hoursPerWeek)} t</dd>
                    </div>
                    <div>
                      <dt>Timepris</dt>
                      <dd>{kr.format(i.rate)} kr.</dd>
                    </div>
                    <div>
                      <dt>Pris/md.</dt>
                      <dd>{kr.format(i.monthly)} kr.</dd>
                    </div>
                  </dl>

                  <div class="tp-share">
                    <Meter ratio={i.share} tone="accent" />
                    <span>{pct.format(i.share)} af ugentlige timer</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

      {instructors.length > 0 && (
        <footer class="tp-instructor-totals">
          <span>
            <ClockIcon />
            Samlet timer/uge: <strong>{num.format(totals.hours)} t</strong>
          </span>
          <span>
            Ugentlig lønudgift: <strong>{kr.format(totals.weekly)} kr.</strong>
          </span>
          <span>
            Månedlig lønudgift: <strong>{kr.format(totals.monthly)} kr.</strong>
          </span>
        </footer>
      )}
    </Panel>
  );
}

function Practical({ data }: { data: TeamPageData }) {
  return (
    <Panel title="Praktisk info">
      {data.practical.length === 0
        ? <p class="tp-empty">Ingen datoer eller aldersgruppe angivet.</p>
        : (
          <dl class="tp-facts">
            {data.practical.map((fact) => (
              <div key={fact.label}>
                <span class="tp-fact-icon" aria-hidden="true">
                  {fact.icon === "calendar" ? <CalendarIcon /> : <UsersIcon />}
                </span>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
    </Panel>
  );
}

function Sessions({ data }: { data: TeamPageData }) {
  return (
    <Panel title="Træningssessioner">
      {data.sessions.length === 0
        ? <p class="tp-empty">Ingen træninger på holdet endnu.</p>
        : (
          <ul class="tp-sessions">
            {data.sessions.map((s, index) => (
              <li key={index}>
                <span class="tp-day">{s.day}</span>
                <div>
                  <div class="tp-session-time">
                    <strong>{s.time}</strong>
                    {Number.isFinite(s.hours) && (
                      <span class="tp-pill">{num.format(s.hours)}t</span>
                    )}
                    {s.notes && <Tag tone="warning">{s.notes}</Tag>}
                  </div>
                  <span class="tp-muted tp-place">
                    <LocationIcon />
                    {s.place}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
    </Panel>
  );
}

function Economy({ data }: { data: TeamPageData }) {
  const { income, incomeHint, wages, wagesHint, fullIncome, freeSpots } =
    data.economy;
  const net = income !== undefined && wages !== undefined
    ? income - wages
    : undefined;

  return (
    <Panel title="Økonomi / sæson">
      <dl class="tp-ledger">
        <div>
          <dt>
            <span class="tp-trend tp-up" aria-hidden="true">↗</span>
            Kontingentindtægt
          </dt>
          <dd>
            {income !== undefined
              ? <strong>{kr.format(income)} kr.</strong>
              : <span class="tp-muted">{incomeHint}</span>}
          </dd>
        </div>
        <div>
          <dt>
            <span class="tp-trend tp-down" aria-hidden="true">↘</span>
            Lønudgifter
          </dt>
          <dd>
            {wages !== undefined
              ? <strong class="tp-negative">−{kr.format(wages)} kr.</strong>
              : <span class="tp-muted">{wagesHint}</span>}
          </dd>
        </div>
        {net !== undefined && (
          <div class="tp-net">
            <dt>Netto</dt>
            <dd>
              <strong class={net < 0 ? "tp-negative" : "tp-positive"}>
                {signedKr.format(net)} kr.
              </strong>
            </dd>
          </div>
        )}
      </dl>

      {net !== undefined && net < 0 && (
        <p class="tp-alert">
          Lønudgifterne overstiger kontingentindtægten for dette hold.
        </p>
      )}

      {(fullIncome !== undefined || freeSpots !== undefined) && (
        <dl class="tp-tiles tp-tiles-two">
          {fullIncome !== undefined && (
            <div>
              <dt>Fuldt belæg</dt>
              <dd>{kr.format(fullIncome)} kr.</dd>
            </div>
          )}
          {freeSpots !== undefined && (
            <div>
              <dt>Ledige pladser</dt>
              <dd>{freeSpots}</dd>
            </div>
          )}
        </dl>
      )}
    </Panel>
  );
}

export function TeamPage(
  { data, isAdmin }: { data: TeamPageData; isAdmin: boolean },
) {
  return (
    <div class="container tp">
      <Hero data={data} isAdmin={isAdmin} />
      <div class="tp-grid">
        <Instructors data={data} />
        <aside class="tp-side">
          <Practical data={data} />
          <Sessions data={data} />
          <Economy data={data} />
        </aside>
      </div>
    </div>
  );
}
