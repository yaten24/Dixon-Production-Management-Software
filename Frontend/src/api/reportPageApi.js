const BASE_URL = "http://192.168.3.87:5000/api/reports/page";

async function handleResponse(res) {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.error || body.detail || "";
    } catch {
      /* body wasn't JSON — ignore */
    }
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
  return res.json();
}

function buildQuery(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== "")
  );
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

export const reportsApi = {
  // GET /api/reports — catalogue of all report definitions
  listCatalogue(signal) {
    return fetch(BASE_URL, { signal }).then(handleResponse);
  },

  // GET /api/reports/:key?date=&month=&hall=
  getReport(key, { date, month, hall, signal } = {}) {
    const qs = buildQuery({ date, month, hall });
    return fetch(`${BASE_URL}/${key}${qs}`, { signal }).then(handleResponse);
  },
};

export default reportsApi;