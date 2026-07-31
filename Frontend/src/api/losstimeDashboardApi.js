const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/losstime/dashboard`
  : "/api/losstime/dashboard";

async function handleResponse(res) {
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return json.data;
}

export async function fetchLossReasons() {
  const res = await fetch(`${API_BASE}/reasons`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}

// filters: { filterType: 'daily'|'monthly', date, month, reasonId }
export async function fetchLossSummary(filters) {
  const params = new URLSearchParams();
  params.set("filterType", filters.filterType || "daily");
  if (filters.filterType === "monthly") {
    if (filters.month) params.set("month", filters.month);
  } else if (filters.date) {
    params.set("date", filters.date);
  }
  if (filters.reasonId) params.set("reasonId", filters.reasonId);

  const res = await fetch(`${API_BASE}/summary?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}