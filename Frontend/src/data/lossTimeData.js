const halls = ["Hall-1", "Hall-2", "Hall-3", "Hall-4"];

const machines = {
  "Hall-1": [
    "MC-101",
    "MC-102",
    "MC-103",
    "MC-104",
    "MC-105",
    "MC-106",
    "MC-107",
    "MC-108",
  ],

  "Hall-2": [
    "MC-201",
    "MC-202",
    "MC-203",
    "MC-204",
    "MC-205",
    "MC-206",
    "MC-207",
    "MC-208",
  ],

  "Hall-3": [
    "MC-301",
    "MC-302",
    "MC-303",
    "MC-304",
    "MC-305",
    "MC-306",
    "MC-307",
    "MC-308",
  ],

  "Hall-4": [
    "MC-401",
    "MC-402",
    "MC-403",
    "MC-404",
    "MC-405",
    "MC-406",
    "MC-407",
    "MC-408",
  ],
};

const operators = [
  "Rakesh",
  "Mohit",
  "Deepak",
  "Rahul",
  "Sumit",
  "Amit",
  "Ankit",
  "Rohit",
  "Vikas",
  "Manoj",
  "Sandeep",
  "Lokesh",
];

const parts = [
  "Front Cover",
  "Rear Cover",
  "Battery Cover",
  "Middle Frame",
  "Top Housing",
  "Bottom Housing",
  "Panel",
  "Side Frame",
];

const shifts = ["A", "B", "C"];

const reasons = [
  "Breakdown - Machine Breakdown",
  "Breakdown - Mould Breakdown",
  "Breakdown - Process Trouble",
  "Setup Adjustment - Mould Change",
  "Tool Change - Mould Polishing Cleaning",
  "Tool Change - Nozzle Change",
  "Tool Change - Insert Ejector Pin Slider Pin Spring Coupler Copper Electrode Change",
  "Start-up Loss - Shift Start Delay",
  "Minor Stoppages - Under 10 Min",
  "Speed Loss - Unskilled Manpower Actual Speed Low",
  "Defect Rework Loss",
  "Schedule Down Time - Planned Stoppage",
  "Management Loss - No Manpower",
  "Management Loss - No Power",
  "Management Loss - Raw Material Shortage",
  "Management Loss - Conveyor Stop",
  "Management Loss - Bin Trolly Short",
  "Operating Motion Loss",
  "Other",
];

const remarks = [
  "Hydraulic Leakage",
  "Routine Maintenance",
  "Material Delay",
  "Model Change",
  "Operator Shift Change",
  "Power Cut",
  "QC Hold",
  "Sensor Replacement",
  "Robot Calibration",
  "Tool Cleaning",
  "Oil Leakage",
  "Machine Restart",
];

const random = (array) =>
  array[Math.floor(Math.random() * array.length)];

const pad = (num) => num.toString().padStart(2, "0");

const generateTime = () => {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);

  return `${pad(hour)}:${pad(minute)}`;
};

const addMinutes = (time, mins) => {
  const [h, m] = time.split(":").map(Number);

  const total = h * 60 + m + mins;

  const hour = Math.floor((total % (24 * 60)) / 60);

  const minute = total % 60;

  return `${pad(hour)}:${pad(minute)}`;
};

export const lossTimeData = [];

for (let i = 1; i <= 120; i++) {
  const hall = random(halls);

  const machine = random(machines[hall]);

  const part = random(parts);

  const operator = random(operators);

  const shift = random(shifts);

  const reason = random(reasons);

  const startTime = generateTime();

  const lossMinutes = Math.floor(Math.random() * 56) + 5;

  const endTime = addMinutes(startTime, lossMinutes);

  const productionLoss = lossMinutes * (Math.floor(Math.random() * 8) + 5);

  const day = Math.floor(Math.random() * 30) + 1;

  const date = `2026-06-${pad(day)}`;

  lossTimeData.push({
    id: i,

    date,

    hall,

    machine,

    part,

    shift,

    operator,

    reason,

    startTime,

    endTime,

    lossMinutes,

    productionLoss,

    remarks: random(remarks),
  });
}