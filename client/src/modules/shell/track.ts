export type TrackType = "directory_open" | "call_click" | "help_offer" | "visit" | "mood" | "help" | "distraction" | "agenda"

export function track(type: TrackType, extra?: { tone?: string }) {
  const body: { type: TrackType; tone?: string } = { type }
  if (extra?.tone) body.tone = extra.tone
  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => undefined)
}
