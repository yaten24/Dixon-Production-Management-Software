import api from "./partApi"; // reuse the shared axios instance

export const getHourlyMachineTracking = (dailyPlanId) =>
  api.get(`/hourly-tracking/${dailyPlanId}/hourly-tracking`).then((res) => res.data);