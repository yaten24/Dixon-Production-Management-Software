// src/services/operatorService.js
//
// All calls go to `${API_BASE}/api/operators...`.
// Set REACT_APP_API_URL in your .env if the backend isn't on the same origin,
// e.g. REACT_APP_API_URL=http://localhost:5000

const API_BASE = "http://localhost:5000";
const OPERATORS_URL = `${API_BASE}/api/operators`;

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch (_) {
      /* ignore parse errors */
    }
    throw new Error(message);
  }
  return res.json();
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
}

// Strips UI-only "All" values so they don't get sent as real filters.
function cleanFilters({ search, shift, hall, page, limit } = {}) {
  return {
    search: search || undefined,
    shift: shift && shift !== "All" ? shift : undefined,
    hall: hall && hall !== "All" ? hall : undefined,
    page,
    limit,
  };
}

export async function getOperators({
  search,
  shift,
  hall,
  page = 1,
  limit = 100,
} = {}) {
  const query = buildQuery(cleanFilters({ search, shift, hall, page, limit }));
  const res = await fetch(`${OPERATORS_URL}${query}`);
  return handleResponse(res);
}

export async function getOperatorMeta() {
  const res = await fetch(`${OPERATORS_URL}/meta`);
  return handleResponse(res);
}

export async function getTopPerformers(limit = 5) {
  const res = await fetch(
    `${OPERATORS_URL}/top-performers${buildQuery({ limit })}`,
  );
  return handleResponse(res);
}

export async function getOperator(id) {
  const res = await fetch(`${OPERATORS_URL}/${id}`);
  return handleResponse(res);
}

export async function addOperator(data) {
  const res = await fetch(OPERATORS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteOperator(id) {
  const res = await fetch(`${OPERATORS_URL}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

// Downloads the .xlsx export for the currently active filters.
// If no filters are passed, the backend exports every operator.
export async function exportOperators({ search, shift, hall } = {}) {
  const query = buildQuery(cleanFilters({ search, shift, hall }));
  const res = await fetch(`${OPERATORS_URL}/export${query}`);

  if (!res.ok) {
    throw new Error(`Export failed (${res.status})`);
  }

  const blob = await res.blob();

  // Pull the filename the backend suggested, fall back to a default.
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `operators_export_${Date.now()}.xlsx`;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
