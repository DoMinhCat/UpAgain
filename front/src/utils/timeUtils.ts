import type { TFunction } from "i18next";

export function getTimeAgo(dateString: string, t: TFunction) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now.getTime() - past.getTime();

  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return t("time.just_now");
  if (diffInMins < 60) return t("time.minutes_ago", { count: diffInMins });
  if (diffInHours < 24) return t("time.hours_ago", { count: diffInHours });
  if (diffInDays === 1) return t("time.yesterday");
  return t("time.days_ago", { count: diffInDays });
}
