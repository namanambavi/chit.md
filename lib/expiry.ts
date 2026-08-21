export function formatExpiryRemaining(milliseconds: number) {
  if (milliseconds <= 0) return "Expired";

  const seconds = Math.ceil(milliseconds / 1_000);
  if (seconds < 60) return `Expires in ${seconds} second${seconds === 1 ? "" : "s"}`;

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `Expires in ${minutes} minute${minutes === 1 ? "" : "s"}`;

  const hours = Math.ceil(minutes / 60);
  return `Expires in ${hours} hour${hours === 1 ? "" : "s"}`;
}

export function formatExpiryCompact(milliseconds: number) {
  if (milliseconds <= 0) return "Expired";
  const seconds = Math.ceil(milliseconds / 1_000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.ceil(minutes / 60)}h`;
}
