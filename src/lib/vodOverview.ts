export interface PositionedEvent {
  id: string;
  offsetSeconds: number;
}

export interface MarkerGroup<T extends PositionedEvent> {
  percent: number;
  events: T[];
}

export function getEventGroups<T extends PositionedEvent>(events: T[], viewStart: number, viewEnd: number, width: number): MarkerGroup<T>[] {
  const duration = viewEnd - viewStart;
  if (!Number.isFinite(duration) || duration <= 0 || width <= 0) return [];
  const groupCount = Math.max(1, Math.floor(width / 46));
  const buckets = new Map<number, T[]>();
  for (const event of events) {
    if (!Number.isFinite(event.offsetSeconds) || event.offsetSeconds < viewStart || event.offsetSeconds > viewEnd) continue;
    const bucket = Math.min(groupCount - 1, Math.floor((event.offsetSeconds - viewStart) / duration * groupCount));
    buckets.set(bucket, [...(buckets.get(bucket) || []), event]);
  }
  return [...buckets.entries()]
    .sort(([left], [right]) => left - right)
    .map(([bucket, items]) => ({ percent: (bucket + 0.5) / groupCount * 100, events: [...items].sort((a, b) => a.offsetSeconds - b.offsetSeconds) }));
}

export function clipSongSpan(start: number, duration: number, viewStart: number, viewEnd: number): { left: number; width: number } | null {
  const length = viewEnd - viewStart;
  if (length <= 0 || duration <= 0 || !Number.isFinite(length) || !Number.isFinite(duration) || !Number.isFinite(start) || !Number.isFinite(viewStart) || !Number.isFinite(viewEnd)) return null;
  const visibleStart = Math.max(start, viewStart);
  const visibleEnd = Math.min(start + duration, viewEnd);
  if (visibleEnd <= visibleStart) return null;
  return { left: (visibleStart - viewStart) / length * 100, width: (visibleEnd - visibleStart) / length * 100 };
}
