/**
 * Formatting and season arithmetic shared by the team editor and the team
 * page. Pure functions only, so islands can import it.
 */

/** Average weeks per month, used for monthly estimates. */
export const WEEKS_PER_MONTH = 4.33;

export const kr = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 });
export const signedKr = new Intl.NumberFormat("da-DK", {
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});
export const pct = new Intl.NumberFormat("da-DK", {
  style: "percent",
  maximumFractionDigits: 0,
});
export const num = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 1 });

/** Calendar weeks from start to end date, both included. */
export function weeksBetween(start: string, end: string): number | undefined {
  if (!start || !end) return undefined;
  const days = (Date.parse(end) - Date.parse(start)) / 86_400_000;
  if (!(days >= 0)) return undefined;
  return Math.ceil((days + 1) / 7);
}

/** Minutes between two "HH:MM" times, or NaN if either is missing. */
export function minutesBetween(start: string, end: string): number {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  if (!start || !end) return NaN;
  return toMinutes(end) - toMinutes(start);
}
