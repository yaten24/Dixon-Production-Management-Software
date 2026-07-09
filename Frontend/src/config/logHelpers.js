/* ===========================================================
   SEARCH
=========================================================== */

export const searchLogs = (logs, keyword = "") => {
  if (!keyword.trim()) return logs;

  const value = keyword.toLowerCase();

  return logs.filter((log) => {
    return (
      log.user?.toLowerCase().includes(value) ||
      log.department?.toLowerCase().includes(value) ||
      log.module?.toLowerCase().includes(value) ||
      log.action?.toLowerCase().includes(value) ||
      log.machine?.toLowerCase().includes(value) ||
      log.hall?.toLowerCase().includes(value) ||
      log.activityId?.toLowerCase().includes(value) ||
      log.description?.toLowerCase().includes(value)
    );
  });
};

/* ===========================================================
   FILTER
=========================================================== */

export const filterLogs = (logs, filters) => {
  return logs.filter((log) => {
    if (filters.user && log.user !== filters.user) return false;

    if (filters.department && log.department !== filters.department)
      return false;

    if (filters.module && log.module !== filters.module) return false;

    if (filters.status && log.status !== filters.status) return false;

    if (filters.hall && log.hall !== filters.hall) return false;

    if (filters.shift && log.shift !== filters.shift) return false;

    return true;
  });
};

/* ===========================================================
   SORT
=========================================================== */

export const sortLogs = (logs, field = "time", direction = "asc") => {
  return [...logs].sort((a, b) => {
    if (a[field] < b[field]) return direction === "asc" ? -1 : 1;

    if (a[field] > b[field]) return direction === "asc" ? 1 : -1;

    return 0;
  });
};

/* ===========================================================
   PAGINATION
=========================================================== */

export const paginateLogs = (logs, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;

  return logs.slice(start, start + pageSize);
};

/* ===========================================================
   TOTAL PAGES
=========================================================== */

export const totalPages = (logs, pageSize = 10) => {
  return Math.ceil(logs.length / pageSize);
};

/* ===========================================================
   FORMAT DATE
=========================================================== */

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ===========================================================
   FORMAT TIME
=========================================================== */

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ===========================================================
   STATUS COLORS
=========================================================== */

export const getStatusColor = (status) => {
  switch (status) {
    case "Success":
      return "green";

    case "Warning":
      return "yellow";

    case "Failed":
      return "red";

    default:
      return "gray";
  }
};

/* ===========================================================
   EXPORT CSV
=========================================================== */

export const exportCSV = (logs) => {
  const headers = Object.keys(logs[0]).join(",");

  const rows = logs.map((log) => Object.values(log).join(","));

  const csv = [headers, ...rows].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "logs.csv";

  a.click();

  URL.revokeObjectURL(url);
};

/* ===========================================================
   EXPORT JSON
=========================================================== */

export const exportJSON = (logs) => {
  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "logs.json";

  a.click();

  URL.revokeObjectURL(url);
};

/* ===========================================================
   LOG STATISTICS
=========================================================== */

export const getLogStatistics = (logs) => {
  return {
    total: logs.length,

    success: logs.filter((l) => l.status === "Success").length,

    warning: logs.filter((l) => l.status === "Warning").length,

    failed: logs.filter((l) => l.status === "Failed").length,

    production: logs.filter((l) => l.department === "Production").length,

    hr: logs.filter((l) => l.department === "HR").length,

    quality: logs.filter((l) => l.department === "Quality").length,
  };
};
