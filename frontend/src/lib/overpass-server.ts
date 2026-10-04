/**
 * Server-side helper for querying the OpenStreetMap Overpass API.
 *
 * Strategy:
 * 1. Fire the query at ALL mirrors simultaneously (Promise.any)
 * 2. Return whichever mirror responds first
 * 3. If all fail, return empty result instead of throwing — the dashboard
 *    should still render (without facility markers) rather than crash.
 */

export const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

export async function queryOverpass(query: string, timeoutMs = 25000): Promise<any> {
  const controllers = OVERPASS_MIRRORS.map(() => new AbortController());

  const attempts = OVERPASS_MIRRORS.map((url, i) =>
    fetch(url, {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "JakScope/1.0 (educational-project)",
      },
      signal: controllers[i].signal,
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`Overpass mirror ${new URL(url).hostname} returned status ${res.status}`);
      }
      const data = await res.json();
      // Overpass returns 200 but puts errors/timeouts in "remark"
      if (data.remark) {
        throw new Error(`Overpass remark: ${data.remark}`);
      }
      return data;
    })
  );

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Semua server peta tidak merespons dalam waktu yang wajar")), timeoutMs);
  });

  try {
    const result = await Promise.race([Promise.any(attempts), timeoutPromise]);
    controllers.forEach((c) => c.abort());
    return result;
  } catch (err: any) {
    controllers.forEach((c) => c.abort());
    if (err instanceof AggregateError) {
      const messages = err.errors.map((e: any) => e?.message || String(e)).join("; ");
      throw new Error(`Semua mirror Overpass gagal: ${messages}`);
    }
    throw err;
  }
}

