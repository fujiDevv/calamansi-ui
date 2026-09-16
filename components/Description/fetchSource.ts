export const SOURCE_LOADING = "// Loading…";
export const SOURCE_ERROR = "// Unable to load source.";

export async function fetchSource(registry: string) {
  try {
    const res = await fetch(`/r/${encodeURIComponent(registry)}.json`);
    if (!res.ok) return SOURCE_ERROR;
    const data = await res.json();
    return data?.files?.[0]?.content ?? SOURCE_ERROR;
  } catch {
    return SOURCE_ERROR;
  }
}
