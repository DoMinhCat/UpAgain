// 1. Time computation helper
export function getTimeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now.getTime() - past.getTime();

  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return "Yesterday";
  return `${diffInDays} days ago`;
}
