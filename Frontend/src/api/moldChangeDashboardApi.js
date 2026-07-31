// API base — adjust to match your Express server / proxy setup
const API_BASE = "http://192.168.3.87:5000/api/Mold/change/dashboard";

// fetch() only rejects on network failure — a 404/500 still resolves
// "successfully" and would otherwise get JSON.parse'd as if it were
// real data. This wrapper turns non-2xx responses into a real error.
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error || "";
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status} ${res.statusText} — ${url}${detail ? ` (${detail})` : ""}`);
  }
  return res.json();
}

// Drops empty/"All" values so the query string only carries filters that
// actually narrow the result.
function buildQueryString(filters = {}) {
  return new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== "All")),
  ).toString();
}

export function getMoldChangeSummary(filters, options) {
  return fetchJson(`${API_BASE}/summary?${buildQueryString(filters)}`, options);
}

export function getMoldChangeHallWise(filters, options) {
  return fetchJson(`${API_BASE}/hall-wise?${buildQueryString(filters)}`, options);
}

export function getMoldChangeReasonDistribution(filters, options) {
  return fetchJson(`${API_BASE}/reason-distribution?${buildQueryString(filters)}`, options);
}

export function getMoldChangeTopMachines(filters, options) {
  return fetchJson(`${API_BASE}/top-machines?${buildQueryString(filters)}`, options);
}

export function getMoldChangeHourlyTrend(filters, options) {
  return fetchJson(`${API_BASE}/hourly-trend?${buildQueryString(filters)}`, options);
}

// Not date/filter-scoped — always the full distinct list of reasons ever
// recorded, used to populate the reason dropdown.
export function getMoldChangeReasons(options) {
  return fetchJson(`${API_BASE}/reasons`, options);
}

// Fetches all five dashboard sections in parallel for a given filter set.
// Pass an AbortSignal so a superseded (stale) request can be cancelled.
export async function getMoldChangeDashboardData(filters, signal) {
  const [summary, hallWise, distribution, topMachines, hourly] = await Promise.all([
    getMoldChangeSummary(filters, { signal }),
    getMoldChangeHallWise(filters, { signal }),
    getMoldChangeReasonDistribution(filters, { signal }),
    getMoldChangeTopMachines(filters, { signal }),
    getMoldChangeHourlyTrend(filters, { signal }),
  ]);

  return {
    ...summary,
    hallWise: hallWise.hallWise ?? [],
    hallsMissing: hallWise.hallsMissing ?? [],
    reasonDistribution: distribution.reasonDistribution ?? [],
    reasonsTracked: distribution.reasonsTracked ?? 0,
    topMachines: topMachines.topMachines ?? [],
    hourlyTrend: hourly.hourlyTrend ?? [],
  };
}