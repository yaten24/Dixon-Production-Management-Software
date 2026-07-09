// ============================================
// FILTER DATA
// ============================================

export const filterLossTimeData = (data, filters) => {
  return data.filter((item) => {
    const { fromDate, toDate, hall, machine, shift, reason } = filters;

    const matchFrom = !fromDate || item.date >= fromDate;

    const matchTo = !toDate || item.date <= toDate;

    const matchHall = !hall || item.hall === hall;

    const matchMachine = !machine || item.machine === machine;

    const matchShift = !shift || item.shift === shift;

    const matchReason = !reason || item.reason === reason;

    return (
      matchFrom &&
      matchTo &&
      matchHall &&
      matchMachine &&
      matchShift &&
      matchReason
    );
  });
};

// ============================================
// SUMMARY
// ============================================

export const getTotalLossMinutes = (data) =>
  data.reduce((sum, item) => sum + item.lossMinutes, 0);

export const getProductionLoss = (data) =>
  data.reduce((sum, item) => sum + item.productionLoss, 0);

export const getAverageDowntime = (data) => {
  if (!data.length) return 0;

  return (getTotalLossMinutes(data) / data.length).toFixed(1);
};

export const getTotalEvents = (data) => data.length;

// ============================================
// LOSS %
// ============================================

export const getLossPercentage = (data) => {
  if (!data.length) return 0;

  const productionLoss = getProductionLoss(data);

  const totalProduction = productionLoss + 50000;

  return ((productionLoss / totalProduction) * 100).toFixed(2);
};

// ============================================
// COMMON GROUP FUNCTION
// ============================================

const groupBy = (data, key, valueKey) => {
  return data.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + item[valueKey];

    return acc;
  }, {});
};

// ============================================
// HIGHEST HALL
// ============================================

export const getHighestHall = (data) => {
  const grouped = groupBy(data, "hall", "lossMinutes");

  const highest = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];

  return highest
    ? {
        hall: highest[0],
        lossMinutes: highest[1],
      }
    : {};
};

// ============================================
// HIGHEST MACHINE
// ============================================

export const getHighestMachine = (data) => {
  const grouped = groupBy(data, "machine", "lossMinutes");

  const highest = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];

  return highest
    ? {
        machine: highest[0],
        lossMinutes: highest[1],
      }
    : {};
};

// ============================================
// HIGHEST REASON
// ============================================

export const getHighestReason = (data) => {
  const grouped = groupBy(data, "reason", "lossMinutes");

  const highest = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];

  return highest
    ? {
        reason: highest[0],
        lossMinutes: highest[1],
      }
    : {};
};

// ============================================
// HALL WISE
// ============================================

export const getHallWiseLoss = (data) => {
  const grouped = {};

  data.forEach((item) => {
    grouped[item.hall] = (grouped[item.hall] || 0) + item.lossMinutes;
  });

  return Object.entries(grouped).map(([hall, lossMinutes]) => ({
    hall,
    lossMinutes,
  }));
};

// ============================================
// MACHINE WISE
// ============================================

export const getMachineWiseLoss = (data) => {
  const grouped = {};

  data.forEach((item) => {
    grouped[item.machine] = (grouped[item.machine] || 0) + item.lossMinutes;
  });

  return Object.entries(grouped)
    .map(([machine, lossMinutes]) => ({
      machine,
      lossMinutes,
    }))
    .sort((a, b) => b.lossMinutes - a.lossMinutes);
};

// ============================================
// SHIFT WISE
// ============================================

export const getShiftWiseLoss = (data) => {
  const grouped = {};

  data.forEach((item) => {
    grouped[item.shift] = (grouped[item.shift] || 0) + item.lossMinutes;
  });

  return Object.entries(grouped).map(([shift, lossMinutes]) => ({
    shift,
    lossMinutes,
  }));
};

// ============================================
// REASON WISE
// ============================================

export const getReasonWiseLoss = (data) => {
  const grouped = {};

  data.forEach((item) => {
    grouped[item.reason] = (grouped[item.reason] || 0) + item.lossMinutes;
  });

  return Object.entries(grouped).map(([reason, lossMinutes]) => ({
    reason,
    lossMinutes,
  }));
};

// ============================================
// TREND
// ============================================

export const getTrendData = (data) => {
  const grouped = {};

  data.forEach((item) => {
    grouped[item.date] = (grouped[item.date] || 0) + item.lossMinutes;
  });

  return Object.entries(grouped)
    .sort()
    .map(([date, lossMinutes]) => ({
      date,
      lossMinutes,
    }));
};

// ============================================
// TOP LOSS MACHINES
// ============================================

export const getTopLossMachines = (data) => {
  const grouped = {};

  data.forEach((item) => {
    if (!grouped[item.machine]) {
      grouped[item.machine] = {
        machine: item.machine,
        hall: item.hall,
        events: 0,
        lossMinutes: 0,
        productionLoss: 0,
      };
    }

    grouped[item.machine].events++;

    grouped[item.machine].lossMinutes += item.lossMinutes;

    grouped[item.machine].productionLoss += item.productionLoss;
  });

  return Object.values(grouped)
    .sort((a, b) => b.lossMinutes - a.lossMinutes)
    .slice(0, 10);
};

// ============================================
// RECENT EVENTS
// ============================================

export const getRecentEvents = (data) => {
  return [...data]
    .sort((a, b) => {
      return (
        new Date(`${b.date} ${b.startTime}`) -
        new Date(`${a.date} ${a.startTime}`)
      );
    })
    .slice(0, 10);
};

// ============================================
// HEAT MAP
// ============================================

export const getHeatMapData = (data) => {
  return data.map((item) => ({
    machine: item.machine,
    hour: Number(item.startTime.split(":")[0]),
    lossMinutes: item.lossMinutes,
  }));
};

// ============================================
// FILTER OPTIONS
// ============================================

export const getUniqueHalls = (data) => [
  ...new Set(data.map((item) => item.hall)),
];

export const getUniqueMachines = (data) => [
  ...new Set(data.map((item) => item.machine)),
];

export const getUniqueReasons = (data) => [
  ...new Set(data.map((item) => item.reason)),
];

export const getUniqueOperators = (data) => [
  ...new Set(data.map((item) => item.operator)),
];

export const getUniqueParts = (data) => [
  ...new Set(data.map((item) => item.part)),
];
