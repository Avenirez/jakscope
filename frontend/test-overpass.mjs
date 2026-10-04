// Detailed diagnostic: check exact error responses from each mirror
const mirrors = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

const query = `[out:json][timeout:10];node["amenity"="school"](around:500,-6.2114,106.8446);out center;`;

for (const url of mirrors) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "JakScope/1.0 (educational-project)",
      },
      signal: AbortSignal.timeout(20000),
    });
    const text = await res.text();
    if (!res.ok) {
      console.log(`[FAIL] ${url}`);
      console.log(`  Status: ${res.status} ${res.statusText}`);
      console.log(`  Body: ${text.substring(0, 200)}`);
      console.log(`  Time: ${Date.now() - start}ms`);
      continue;
    }
    const data = JSON.parse(text);
    console.log(`[OK]   ${url} => ${data.elements?.length ?? 0} elements (${Date.now() - start}ms)`);
  } catch (e) {
    console.log(`[FAIL] ${url} => ${e.message} (${Date.now() - start}ms)`);
  }
}
