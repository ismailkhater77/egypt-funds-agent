const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function egyptBusinessDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  const year = get("year");
  const month = get("month");
  const day = get("day");
  if (!year || !month || !day) throw new Error("Unable to derive Egypt business date");
  return `${year}-${month}-${day}`;
}

export function getEgyptBusinessDate() {
  const override = process.env.EGYPT_BUSINESS_DATE;
  if (override) {
    if (!DATE_PATTERN.test(override)) throw new Error("EGYPT_BUSINESS_DATE must use YYYY-MM-DD");
    return override;
  }
  return egyptBusinessDate();
}
