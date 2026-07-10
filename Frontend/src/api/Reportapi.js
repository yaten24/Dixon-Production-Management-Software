import api from "./axios";
// The response shape below matches getAllProductionEntries():
// { success, message, data }

/**
 * Fetch the filtered production report + all stats/breakdowns in one call.
 *
 * @param {Object} filters
 * @param {string} [filters.fromDate]      "YYYY-MM-DD"
 * @param {string} [filters.toDate]        "YYYY-MM-DD"
 * @param {string} [filters.hall]          "All" | "Hall-1" | "Hall-1,Hall-2"
 * @param {string} [filters.shift]         "All" | "A" | "B"
 * @param {number} [filters.machineId]
 * @param {number} [filters.operatorId]
 * @param {number} [filters.partId]
 * @param {number} [filters.rejectReasonId]
 * @param {number} [filters.lossReasonId]
 * @param {string} [filters.mouldChange]   "yes" | "no"
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 */
export const getProductionReport = async (filters = {}) => {
  try {
    // Strip empty/undefined/"All" values so the query string stays clean
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value;
      }
    });

    const response = await api.get("/reports/production", { params });
    return response.data; // { success, message, data }
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message || "Failed to load report data. Please try again.",
    };
  }
};

export const getRejectionReasonsList = async () => {
  try {
    const response = await api.get("/rejection-reasons");
    return response.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to load rejection reasons.",
    };
  }
};

export const getLossReasonsList = async () => {
  try {
    const response = await api.get("/loss-reasons");
    return response.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Failed to load loss reasons.",
    };
  }
};