export const logsData = [
  {
    id: 1,
    activityId: "LOG-20260629-001",
    date: "29 Jun 2026",
    time: "09:10 AM",
    timestamp: "2026-06-29T09:10:00",

    user: "Yaten Singh",
    employeeId: "EMP001",
    department: "Production",
    role: "Production Engineer",

    module: "Production",
    action: "Created",

    description: "Created production entry for Hall-4 SMT Line.",

    hall: "Hall-4",
    machine: "SMT-05",

    shift: "A",

    ip: "192.168.0.11",

    browser: "Chrome",

    device: "Windows",

    os: "Windows 11",

    location: "Dehradun Plant",

    status: "Success",

    remarks: "Production entry submitted successfully.",
  },

  {
    id: 2,
    activityId: "LOG-20260629-002",

    date: "29 Jun 2026",
    time: "09:42 AM",
    timestamp: "2026-06-29T09:42:00",

    user: "Admin",
    employeeId: "ADM001",

    department: "HR",
    role: "Administrator",

    module: "Employee",

    action: "Updated",

    description: "Updated employee shift.",

    hall: "Hall-2",

    machine: "-",

    shift: "B",

    ip: "192.168.0.20",

    browser: "Edge",

    device: "Windows",

    os: "Windows 11",

    location: "HR Office",

    status: "Success",

    remarks: "Shift changed successfully.",
  },

  {
    id: 3,
    activityId: "LOG-20260629-003",

    date: "29 Jun 2026",

    time: "10:18 AM",

    timestamp: "2026-06-29T10:18:00",

    user: "Operator-08",

    employeeId: "OP008",

    department: "Production",

    role: "Operator",

    module: "Machine",

    action: "Stopped",

    description: "Machine stopped because of material shortage.",

    hall: "Hall-4",

    machine: "SMT-12",

    shift: "A",

    ip: "192.168.0.61",

    browser: "Chrome",

    device: "Android",

    os: "Android 15",

    location: "Hall-4",

    status: "Warning",

    remarks: "Waiting for material issue.",
  },

  {
    id: 4,

    activityId: "LOG-20260629-004",

    date: "29 Jun 2026",

    time: "11:05 AM",

    timestamp: "2026-06-29T11:05:00",

    user: "Supervisor",

    employeeId: "SUP004",

    department: "Quality",

    role: "Supervisor",

    module: "Inspection",

    action: "Rejected",

    description: "Rejected production batch.",

    hall: "Hall-3",

    machine: "AOI-03",

    shift: "A",

    ip: "192.168.0.71",

    browser: "Chrome",

    device: "Windows",

    os: "Windows 11",

    location: "QA Room",

    status: "Failed",

    remarks: "Inspection failed due to solder defects.",
  },
];
