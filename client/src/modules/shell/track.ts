export function track(type: "directory_open" | "call_click" | "help_offer") {
  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => undefined)
}
