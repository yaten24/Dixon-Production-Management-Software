// Reason Wise Data

export const getReasonWiseData = (data) => {
  return Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.reason]) {
        acc[item.reason] = {
          reason: item.reason,
          qty: 0,
        };
      }

      acc[item.reason].qty += Number(item.rejectQty || 0);

      return acc;
    }, {})
  );
};

// Hall Wise Data

export const getHallWiseData = (data) => {
  return Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.hall]) {
        acc[item.hall] = {
          hall: item.hall,
          qty: 0,
        };
      }

      acc[item.hall].qty += Number(item.rejectQty || 0);

      return acc;
    }, {})
  );
};

// Machine Wise Data

export const getMachineWiseData = (data) => {
  return Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.machine]) {
        acc[item.machine] = {
          machine: item.machine,
          qty: 0,
        };
      }

      acc[item.machine].qty += Number(item.rejectQty || 0);

      return acc;
    }, {})
  );
};

// Trend Data

export const getTrendData = (data) => {
  return Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          date: item.date,
          qty: 0,
        };
      }

      acc[item.date].qty += Number(item.rejectQty || 0);

      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Total Reject Qty

export const getTotalRejectQty = (data) => {
  return data.reduce((sum, item) => sum + Number(item.rejectQty || 0), 0);
};

// Highest Reason

export const getHighestReason = (reasonWiseData) => {
  if (!reasonWiseData.length) return null;

  return [...reasonWiseData].sort((a, b) => b.qty - a.qty)[0];
};

// Highest Hall

export const getHighestHall = (hallWiseData) => {
  if (!hallWiseData.length) return null;

  return [...hallWiseData].sort((a, b) => b.qty - a.qty)[0];
};

// Highest Machine

export const getHighestMachine = (machineWiseData) => {
  if (!machineWiseData.length) return null;

  return [...machineWiseData].sort((a, b) => b.qty - a.qty)[0];
};

// Rejection Percentage

export const getRejectionPercentage = (rejectQty, productionQty) => {
  if (!productionQty) return 0;

  return ((rejectQty / productionQty) * 100).toFixed(2);
};

// Top 5 Rejection Reasons

export const getTopReasons = (reasonWiseData) => {
  return [...reasonWiseData].sort((a, b) => b.qty - a.qty).slice(0, 5);
};

// Top 5 Machines

export const getTopMachines = (machineWiseData) => {
  return [...machineWiseData].sort((a, b) => b.qty - a.qty).slice(0, 5);
};

// Top 5 Halls

export const getTopHalls = (hallWiseData) => {
  return [...hallWiseData].sort((a, b) => b.qty - a.qty).slice(0, 5);
};
