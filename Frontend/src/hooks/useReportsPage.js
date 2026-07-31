// frontend/hooks/useReports.js

import { useState, useEffect, useCallback, useRef } from "react";
import { reportsApi } from "../api/reportPageApi";

// ---------------------------------------------------------------
// useReportCatalogue — loads the report list once (names, categories,
// which mode each report belongs to). Feeds the "All Reports" table.
// ---------------------------------------------------------------
export function useReportCatalogue() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    reportsApi
      .listCatalogue(controller.signal)
      .then((res) => setReports(res.reports || []))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { reports, loading, error };
}

// ---------------------------------------------------------------
// useReportData — fetches one report's data on demand (call `run()`
// e.g. from a "View" button), respecting the Daily/Monthly filter
// state. Cancels any in-flight request if a newer one starts, so a
// slow response from a superseded selection can never overwrite
// fresher data.
// ---------------------------------------------------------------
export function useReportData() {
  const [reportKey, setReportKey] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const run = useCallback((key, { mode, date, month, hall } = {}) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setReportKey(key);
    setLoading(true);
    setError(null);

    const params =
      mode === "monthly"
        ? { month, hall, signal: controller.signal }
        : { date, hall, signal: controller.signal };

    reportsApi
      .getReport(key, params)
      .then((res) => {
        if (!controller.signal.aborted) setResult(res);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setReportKey(null);
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { reportKey, result, loading, error, run, clear };
}