export const dummyMachines = [
  {
    id: 1,
    machineCode: "IM-01",
    machineName: "Injection Machine 01",
    hall: "Hall 1",
    shift: "A",

    status: "Running",

    operatorId: "OP001",
    operatorName: "Rahul",

    partNumber: "PN1001",
    partName: "Back Cover",

    target: 3500,
    actual: 2420,
    reject: 12,

    cycleTime: 45,
    currentCycle: 43,

    efficiency: 96,
    oee: 94,

    lossTime: 5,

    lastUpdate: "10:35 AM"
  },

  {
    id: 2,
    machineCode: "IM-02",
    machineName: "Injection Machine 02",
    hall: "Hall 1",
    shift: "A",

    status: "Idle",

    operatorId: "",

    operatorName: "",

    partNumber: "",

    partName: "",

    target: 0,
    actual: 0,
    reject: 0,

    cycleTime: 0,

    currentCycle: 0,

    efficiency: 0,

    oee: 0,

    lossTime: 65,

    lastUpdate: "09:50 AM"
  },

  {
    id: 3,
    machineCode: "IM-03",
    machineName: "Injection Machine 03",
    hall: "Hall 1",
    shift: "A",

    status: "Breakdown",

    operatorId: "OP008",

    operatorName: "Aman",

    partNumber: "PN1004",

    partName: "Camera Ring",

    target: 4200,

    actual: 1600,

    reject: 45,

    cycleTime: 40,

    currentCycle: 0,

    efficiency: 38,

    oee: 42,

    lossTime: 80,

    lastUpdate: "09:20 AM"
  }
];