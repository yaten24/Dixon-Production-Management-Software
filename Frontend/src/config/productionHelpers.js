import { hours, hallHourlyData } from "../data/productionData";

export const overallHourlyData = hours.map((hour) => {
  const row = {
    hour,
    target: 0,
    actual: 0,
  };

  Object.values(hallHourlyData).forEach((hallRows) => {
    const match = hallRows.find((item) => item.hour === hour);

    if (match) {
      row.target += match.target;
      row.actual += match.actual;
    }
  });

  return row;
});