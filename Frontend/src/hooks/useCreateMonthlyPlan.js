import { useState } from "react";
import { createFullMonthlyPlan, generatePlanNumber } from "../api/monthlyPlan";

export default function useCreateMonthlyPlan() {
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const createPlan = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      return await createFullMonthlyPlan(payload);
    } catch (err) {
      const msg = err.response?.data?.message || "Plan create nahi hua";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const autoGenerateNumber = async (month, year) => {
    setGenerating(true);
    try {
      const res = await generatePlanNumber(month, year);
      return res.planNumber;
    } finally {
      setGenerating(false);
    }
  };

  return { createPlan, autoGenerateNumber, submitting, generating, error };
}