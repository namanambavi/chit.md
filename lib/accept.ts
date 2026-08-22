export type Representation = "text/html" | "text/markdown";

type AcceptEntry = { type: string; q: number; specificity: number; position: number };

function parseAccept(header: string): AcceptEntry[] {
  return header.split(",").map((raw, position) => {
    const parts = raw.trim().split(";").map((part) => part.trim());
    const type = (parts[0] || "").toLowerCase();
    let q = 1;
    for (const parameter of parts.slice(1)) {
      const [name, value] = parameter.split("=").map((part) => part.trim());
      if (name.toLowerCase() === "q") {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
      }
    }
    const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
    return { type, q, specificity, position };
  }).filter((entry) => entry.type);
}

function matches(entry: AcceptEntry, candidate: Representation) {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) return candidate.startsWith(entry.type.slice(0, -1));
  return entry.type === candidate;
}

export function preferredRepresentation(header: string | null): Representation | null {
  const produces: Representation[] = ["text/html", "text/markdown"];
  if (!header) return produces[0];
  const entries = parseAccept(header);
  if (!entries.length) return produces[0];
  let best: Representation | null = null;
  let bestQ = -1;
  let bestPosition = Number.POSITIVE_INFINITY;
  for (const candidate of produces) {
    let matched: AcceptEntry | null = null;
    for (const entry of entries) {
      if (!matches(entry, candidate)) continue;
      if (!matched || entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && entry.position < matched.position)) matched = entry;
    }
    if (!matched || matched.q <= 0) continue;
    if (matched.q > bestQ || (matched.q === bestQ && matched.position < bestPosition)) {
      best = candidate;
      bestQ = matched.q;
      bestPosition = matched.position;
    }
  }
  return best;
}

export function appendVaryAccept(headers: Headers) {
  const existing = headers.get("vary");
  if (!existing) return headers.set("vary", "Accept");
  const values = existing.split(",").map((value) => value.trim().toLowerCase());
  if (!values.includes("accept")) headers.set("vary", `${existing}, Accept`);
}
