export const TZ = "America/Sao_Paulo";

const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekdayIndex(date: Date, timeZone = TZ) {
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  return SHORT_WEEKDAYS.indexOf(short);
}

export function dateKey(iso: string, timeZone = TZ) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone });
}
