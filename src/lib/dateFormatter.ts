export type FormatGameStartOptions = {
  timeZone?: string;
};

export function formatGameStart(isoString: string, options: FormatGameStartOptions = {}): string {
  const date = new Date(isoString);
  const timeZone = options.timeZone;

  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  });

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    ...(timeZone ? { timeZone } : {}),
  });

  return `${dayFormatter.format(date)}, ${timeFormatter.format(date)}`;
}
