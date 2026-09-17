const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

/** "2025-07" to "Jul 2025"; a bare "2025" stays as it is. */
export const formatMonth = (isoMonth: string) =>
  isoMonth.length === 4 ? isoMonth : monthFormat.format(new Date(`${isoMonth}-01T00:00:00Z`));

export const formatRange = (start: string, end: string | null) =>
  `${formatMonth(start)} to ${end ? formatMonth(end) : "now"}`;

/** Whole years since an ISO month or year, for "3+ years" style copy that must not go stale. */
export const yearsSince = (iso: string) => {
  const start = new Date(`${iso.length === 4 ? `${iso}-01` : iso}-01T00:00:00Z`);
  const now = new Date();
  const months = (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + now.getUTCMonth() - start.getUTCMonth();
  return Math.floor(months / 12);
};
