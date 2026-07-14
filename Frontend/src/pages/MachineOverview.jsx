import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  RefreshCw,
  X,
  User,
  Package,
  Clock,
  AlertTriangle,
  Factory,
  ChevronRight,
  Gauge,
  Wrench,
  Settings2,
  Timer,
  CircleDot,
  LayoutGrid,
  LayoutList,
  Check,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Static reference data                                              */
/* ------------------------------------------------------------------ */

const STATUS_META = {
  running: {
    label: "Running",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    chip: "bg-emerald-500/10 border-emerald-500/30",
    ring: "#10b981",
  },
  idle: {
    label: "Idle",
    dot: "bg-slate-400",
    text: "text-slate-300",
    chip: "bg-slate-500/10 border-slate-500/30",
    ring: "#94a3b8",
  },
  breakdown: {
    label: "Breakdown",
    dot: "bg-red-500",
    text: "text-red-400",
    chip: "bg-red-500/10 border-red-500/30",
    ring: "#ef4444",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-amber-500",
    text: "text-amber-400",
    chip: "bg-amber-500/10 border-amber-500/30",
    ring: "#f59e0b",
  },
  setup: {
    label: "Setup",
    dot: "bg-blue-500",
    text: "text-blue-400",
    chip: "bg-blue-500/10 border-blue-500/30",
    ring: "#3b82f6",
  },
};

const HALLS = [1, 2, 3, 4];
const SHIFTS = ["A", "B"];
const OPERATOR_NAMES = [
  "Rahul",
  "Suresh",
  "Amit",
  "Vijay",
  "Sanjay",
  "Ramesh",
  "Deepak",
  "Manoj",
  "Ravi",
  "Ashok",
  "Vikram",
  "Anil",
  "Sunil",
  "Prakash",
  "Rajesh",
  "Naveen",
  "Kiran",
  "Mahesh",
  "Yogesh",
  "Pankaj",
];
const PARTS = [
  { number: "PN1001", name: "Back Cover" },
  { number: "PN1002", name: "Front Panel" },
  { number: "PN1003", name: "Battery Case" },
  { number: "PN1004", name: "Side Bracket" },
  { number: "PN1005", name: "Hinge Cover" },
  { number: "PN1006", name: "Base Plate" },
  { number: "PN1007", name: "Top Lid" },
  { number: "PN1008", name: "Handle Grip" },
];
const REJECT_REASONS = [
  "Scratch",
  "Flow Mark",
  "Short Shot",
  "Burn",
  "Flash",
  "Others",
];
const LOSS_REASON_POOL = [
  "Mould Change",
  "Material Shortage",
  "Power Failure",
  "Operator Break",
  "Machine Setup",
  "Quality Check",
  "Tool Change",
];
const HOURS = ["08", "09", "10", "11", "12", "13", "14"];

// per-hall status recipe -> keeps totals realistic across the hall & plant
const HALL_STATUS_PLAN = {
  1: { running: 15, idle: 1, breakdown: 0, maintenance: 1, setup: 1 },
  2: { running: 16, idle: 1, breakdown: 1, maintenance: 0, setup: 0 },
  3: { running: 16, idle: 1, breakdown: 1, maintenance: 0, setup: 0 },
  4: { running: 15, idle: 1, breakdown: 1, maintenance: 1, setup: 0 },
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function fmtTime(d) {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
function fmtNum(n) {
  return Math.round(n).toLocaleString("en-IN");
}

/* ------------------------------------------------------------------ */
/* Dummy data generation                                              */
/* ------------------------------------------------------------------ */

function buildMachine(counter, hall, status) {
  const target = randInt(2600, 4200);
  const isDown =
    status === "breakdown" || status === "maintenance" || status === "setup";
  const actualPct =
    status === "running"
      ? rand(0.78, 0.99)
      : status === "idle"
        ? rand(0.35, 0.55)
        : rand(0.05, 0.3);
  const actual = Math.round(target * actualPct);
  const rejectPct = rand(0.005, 0.03);
  const reject = Math.max(0, Math.round(actual * rejectPct));
  const good = Math.max(0, actual - reject);

  const stdCycle = randInt(28, 62);
  const curCycle =
    status === "running"
      ? Math.round(stdCycle * rand(0.92, 1.12))
      : Math.round(stdCycle * rand(1.15, 1.6));

  const efficiency = Math.min(100, Math.round((actual / target) * 100));
  const availability = status === "running" ? randInt(90, 99) : randInt(35, 75);
  const performance = status === "running" ? randInt(88, 98) : randInt(40, 70);
  const quality = Math.max(90, Math.round((good / Math.max(actual, 1)) * 100));
  const oeeFinal = Math.round(
    (availability / 100) * (performance / 100) * (quality / 100) * 100,
  );

  const lossTime =
    status === "breakdown"
      ? randInt(30, 90)
      : status === "maintenance"
        ? randInt(20, 60)
        : status === "idle"
          ? randInt(10, 30)
          : randInt(0, 12);

  let cum = 0;
  const hourly = HOURS.map((h) => {
    const add = status === "running" ? randInt(280, 620) : randInt(20, 180);
    cum += add;
    return { hour: h, qty: Math.min(cum, actual) };
  });

  const shuffledReasons = [...REJECT_REASONS].sort(() => Math.random() - 0.5);
  let remainingReject = reject;
  const rejectBreakdown = shuffledReasons.map((reason, i) => {
    if (i === shuffledReasons.length - 1)
      return { reason, qty: Math.max(0, remainingReject) };
    const share = Math.round(remainingReject * rand(0, 0.4));
    remainingReject -= share;
    return { reason, qty: Math.max(0, share) };
  });

  const lossEntries = [];
  const lossCount = isDown ? randInt(1, 3) : randInt(0, 1);
  for (let i = 0; i < lossCount; i++) {
    const startHour = randInt(8, 13);
    const dur = randInt(5, 40);
    lossEntries.push({
      reason: pick(LOSS_REASON_POOL),
      duration: `${dur} min`,
      start: `${String(startHour).padStart(2, "0")}:${String(randInt(0, 59)).padStart(2, "0")}`,
      end: `${String(startHour).padStart(2, "0")}:${String(Math.min(59, randInt(0, 59) + (dur % 60))).padStart(2, "0")}`,
    });
  }

  const mouldChangeCount = randInt(0, 2);

  return {
    id: counter,
    code: `IM-${String(counter).padStart(2, "0")}`,
    name: `Injection Machine ${String(counter).padStart(2, "0")}`,
    hall,
    shift: Math.random() < 0.7 ? "A" : pick(SHIFTS),
    status,
    operator: {
      name: pick(OPERATOR_NAMES),
      id: `OP${String(counter).padStart(3, "0")}`,
    },
    part: pick(PARTS),
    target,
    actual,
    good,
    reject,
    stdCycle,
    curCycle,
    lossTime,
    efficiency,
    oee: { availability, performance, quality, final: oeeFinal },
    lastUpdate: new Date(Date.now() - randInt(5, 400) * 1000),
    hourly,
    rejectBreakdown,
    lossEntries,
    mouldChange: {
      count: mouldChangeCount,
      reason: mouldChangeCount
        ? pick(["Colour Change", "Part Change", "Preventive", "Breakdown"])
        : "-",
      duration: mouldChangeCount ? `${randInt(15, 45)} min` : "-",
    },
  };
}

function generateMachines() {
  const list = [];
  let counter = 1;
  HALLS.forEach((hall) => {
    const plan = HALL_STATUS_PLAN[hall];
    const statuses = [];
    Object.entries(plan).forEach(([status, count]) => {
      for (let i = 0; i < count; i++) statuses.push(status);
    });
    statuses.sort(() => Math.random() - 0.5);
    statuses.forEach((status) => {
      list.push(buildMachine(counter, hall, status));
      counter += 1;
    });
  });
  return list;
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function CircularProgress({ percent, size = 90, strokeWidth = 9, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-semibold text-slate-100">
          {clamped}%
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 text-xs font-medium ${meta.chip} ${meta.text}`}
    >
      <span
        className={`h-2 w-2 rounded ${meta.dot} ${status === "running" ? "animate-pulse" : ""}`}
      />
      {meta.label}
    </span>
  );
}

function MiniStat({ label, value, valueClass = "text-slate-100" }) {
  return (
    <div className="flex flex-col rounded bg-slate-950/60 px-2 py-1">
      <span className="text-[9px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className={`font-mono text-xs font-semibold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hall summary panel (the "before machine grid" overview requested)  */
/* ------------------------------------------------------------------ */

function HallPanel({ label, sub, stats, isActive, onClick, accent }) {
  const total = stats.total || 1;
  const segs = [
    {
      key: "running",
      pct: (stats.running / total) * 100,
      cls: "bg-emerald-500",
    },
    { key: "idle", pct: (stats.idle / total) * 100, cls: "bg-slate-400" },
    {
      key: "breakdown",
      pct: (stats.breakdown / total) * 100,
      cls: "bg-red-500",
    },
    {
      key: "maintenance",
      pct: (stats.maintenance / total) * 100,
      cls: "bg-amber-500",
    },
    { key: "setup", pct: (stats.setup / total) * 100, cls: "bg-blue-500" },
  ];
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col rounded border bg-slate-900/70 p-4 text-left transition
        ${isActive ? "border-cyan-400/70 ring-1 ring-cyan-400/40 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]" : "border-slate-800 hover:border-slate-700"}`}
    >
      <span
        className={`absolute left-0 top-3 bottom-3 w-1 rounded ${accent}`}
      />
      <div className="mb-1 flex items-center justify-between pl-2">
        <div className="flex items-center gap-1.5">
          <Factory className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-sm font-semibold text-slate-100">{label}</span>
        </div>
        {isActive && (
          <span className="text-[10px] font-medium text-cyan-400">
            SELECTED
          </span>
        )}
      </div>
      <p className="mb-3 pl-2 text-[11px] text-slate-500">{sub}</p>

      <div className="mb-3 flex h-1.5 w-full overflow-hidden rounded bg-slate-800">
        {segs.map(
          (s) =>
            s.pct > 0 && (
              <div
                key={s.key}
                style={{ width: `${s.pct}%` }}
                className={s.cls}
              />
            ),
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        <MiniStat label="Total" value={stats.total} />
        <MiniStat
          label="Run"
          value={stats.running}
          valueClass="text-emerald-400"
        />
        <MiniStat label="Idle" value={stats.idle} valueClass="text-slate-300" />
        <MiniStat
          label="Down"
          value={stats.breakdown}
          valueClass="text-red-400"
        />
        <MiniStat
          label="Eff"
          value={`${stats.avgEfficiency}%`}
          valueClass="text-cyan-400"
        />
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* KPI card row                                                       */
/* ------------------------------------------------------------------ */

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900/70 p-1">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${accent}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[9px] uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="font-mono text-sm font-semibold text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Machine card                                                       */
/* ------------------------------------------------------------------ */

function MachineCard({ m, onOpen }) {
  const meta = STATUS_META[m.status];
  return (
    <div className="flex flex-col rounded border border-slate-800 bg-slate-900/70 p-1.5 transition hover:border-slate-700">
      <div className="mb-0.5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1">
            <span className="font-mono text-md font-bold text-amber-400">
              {m.code}
            </span>
            <span className="flex items-center gap-1 rounded-sm bg-cyan-500/10 px-1.5 py-0.5 text-[8px] font-semibold tracking-wide text-cyan-400">
              <CircleDot className="h-2 w-2" /> LIVE
            </span>
          </div>
          {/* <p className="text-[10px] text-slate-500">{m.name}</p> */}
        </div>
        <StatusBadge status={m.status} />
      </div>

      <div className="mb-0.5 flex items-center justify-between text-[10px] text-slate-500">
        <span>
          Hall {m.hall} · Shift {m.shift}
        </span>
        <span>{fmtTime(m.lastUpdate)}</span>
      </div>

      <div className="mb-0.5 grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="flex items-center gap-1 text-slate-400">
          <User className="h-3 w-3" /> {m.operator.name}
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Package className="h-3 w-3" /> {m.part.number}
        </div>
      </div>

      <div className="mb-0.5 flex items-center justify-center">
        <CircularProgress
          percent={m.efficiency}
          size={68}
          strokeWidth={7}
          color={meta.ring}
        />
      </div>

      <div className="mb-0.5 grid grid-cols-4 gap-1">
        <MiniStat label="Target" value={fmtNum(m.target)} />
        <MiniStat
          label="Actual"
          value={fmtNum(m.actual)}
          valueClass="text-cyan-400"
        />
        <MiniStat
          label="Good"
          value={fmtNum(m.good)}
          valueClass="text-emerald-400"
        />
        <MiniStat
          label="Reject"
          value={fmtNum(m.reject)}
          valueClass="text-red-400"
        />
      </div>

      <div className="mb-0.5 grid grid-cols-3 gap-1">
        <MiniStat label="Std Cyc" value={`${m.stdCycle}s`} />
        <MiniStat label="Cur Cyc" value={`${m.curCycle}s`} />
        <MiniStat
          label="Loss"
          value={`${m.lossTime}m`}
          valueClass={m.lossTime > 20 ? "text-red-400" : "text-slate-100"}
        />
      </div>

      <div className="mb-0.5 grid grid-cols-3 gap-1 border-t border-slate-800 pt-0.5">
        <MiniStat label="Avail" value={`${m.oee.availability}%`} />
        <MiniStat label="Perf" value={`${m.oee.performance}%`} />
        <MiniStat
          label="OEE"
          value={`${m.oee.final}%`}
          valueClass="text-cyan-400"
        />
      </div>

      {/* <button
        onClick={() => onOpen(m)}
        className="mt-auto flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/60 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-400"
      >
        View Details <ChevronRight className="h-3 w-3" />
      </button> */}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Details drawer                                                     */
/* ------------------------------------------------------------------ */

function DrawerRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/60 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-200">{value}</span>
    </div>
  );
}

function DrawerSection({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-400">
        {title}
      </h4>
      <div className="rounded-sm border border-slate-800 bg-slate-950/40 p-3">
        {children}
      </div>
    </div>
  );
}

function MachineDrawer({ machine, onClose }) {
  if (!machine) return null;
  const m = machine;
  const maxReject = Math.max(1, ...m.rejectBreakdown.map((r) => r.qty));
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-800 bg-slate-900 p-5 shadow-2xl md:max-w-lg">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-slate-100">
                {m.code}
              </span>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-xs text-slate-500">{m.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <DrawerSection title="Basic Info">
          <DrawerRow label="Hall" value={`Hall ${m.hall}`} />
          <DrawerRow label="Shift" value={m.shift} />
          <DrawerRow label="Machine Type" value="Injection Moulding" />
          <DrawerRow label="Department" value="Production" />
        </DrawerSection>

        <DrawerSection title="Operator">
          <DrawerRow label="Name" value={m.operator.name} />
          <DrawerRow label="Employee ID" value={m.operator.id} />
          <DrawerRow label="Shift" value={m.shift} />
        </DrawerSection>

        <DrawerSection title="Part">
          <DrawerRow label="Part Number" value={m.part.number} />
          <DrawerRow label="Part Name" value={m.part.name} />
          <DrawerRow
            label="Cycle Time"
            value={`Std ${m.stdCycle}s / Cur ${m.curCycle}s`}
          />
        </DrawerSection>

        <DrawerSection title="Production">
          <DrawerRow label="Target" value={fmtNum(m.target)} />
          <DrawerRow label="Actual" value={fmtNum(m.actual)} />
          <DrawerRow label="Good" value={fmtNum(m.good)} />
          <DrawerRow label="Reject" value={fmtNum(m.reject)} />
          <DrawerRow label="Efficiency" value={`${m.efficiency}%`} />
        </DrawerSection>

        <DrawerSection title="Reject Details">
          <div className="flex flex-col gap-2">
            {m.rejectBreakdown.map((r) => (
              <div key={r.reason} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-slate-400">
                  {r.reason}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{ width: `${(r.qty / maxReject) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-xs text-slate-300">
                  {r.qty}
                </span>
              </div>
            ))}
          </div>
        </DrawerSection>

        <DrawerSection title="Loss Time">
          {m.lossEntries.length === 0 && (
            <p className="text-xs text-slate-500">
              No loss time recorded today.
            </p>
          )}
          {m.lossEntries.map((l, i) => (
            <div
              key={i}
              className="border-b border-slate-800/60 py-1.5 text-xs last:border-0"
            >
              <div className="flex justify-between text-slate-300">
                <span>{l.reason}</span>
                <span className="font-mono">{l.duration}</span>
              </div>
              <div className="text-slate-600">
                {l.start} – {l.end}
              </div>
            </div>
          ))}
        </DrawerSection>

        <DrawerSection title="Mould Change">
          <DrawerRow label="Change Count" value={m.mouldChange.count} />
          <DrawerRow label="Reason" value={m.mouldChange.reason} />
          <DrawerRow label="Duration" value={m.mouldChange.duration} />
        </DrawerSection>

        <DrawerSection title="Performance (OEE)">
          {[
            ["Availability", m.oee.availability],
            ["Performance", m.oee.performance],
            ["Quality", m.oee.quality],
            ["Final OEE", m.oee.final],
          ].map(([label, val]) => (
            <div key={label} className="mb-2 last:mb-0">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className="font-mono text-slate-200">{val}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </DrawerSection>

        <DrawerSection title="Hourly Production">
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={m.hourly}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area
                  type="monotone"
                  dataKey="qty"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#hourlyFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DrawerSection>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hall-selection popup — shown before the dashboard data appears     */
/* ------------------------------------------------------------------ */

function HallChoiceModal({
  hallSummaries,
  current,
  onChoose,
  onDismiss,
  dismissable,
}) {
  const options = [
    {
      id: "all",
      label: "All Halls",
      sub: "Full plant view",
      stats: hallSummaries.all,
      accent: "bg-cyan-500",
    },
    ...hallSummaries.perHall.map(({ hall, stats }) => ({
      id: String(hall),
      label: `Hall ${hall}`,
      sub: `${stats.total} machines`,
      stats,
      accent:
        stats.breakdown > 0
          ? "bg-red-500"
          : stats.idle > 0
            ? "bg-amber-500"
            : "bg-emerald-500",
    })),
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={dismissable ? onDismiss : undefined}
      />
      <div className="relative w-full max-w-2xl rounded-sm border border-slate-800 bg-slate-900 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-cyan-500/10 text-cyan-400">
              <LayoutGrid className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-50">
                Which hall's data do you want to see?
              </h2>
              <p className="text-[10px] text-slate-500">
                Hall 1–4 ya All Halls chuniye
              </p>
            </div>
          </div>
          {dismissable && (
            <button
              onClick={onDismiss}
              className="rounded-sm p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {options.map((opt) => {
            const isCurrent = current === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onChoose(opt.id)}
                className={`relative flex flex-col items-start rounded-sm border p-2 text-left transition
                  ${isCurrent ? "border-cyan-400/70 ring-1 ring-cyan-400/40 bg-slate-800/60" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${opt.accent}`}
                />
                <div className="flex w-full items-center justify-between pl-1.5">
                  <span className="text-xs font-semibold text-slate-100">
                    {opt.label}
                  </span>
                  {isCurrent && <Check className="h-3 w-3 text-cyan-400" />}
                </div>
                <div className="mt-1 flex items-center gap-1.5 pl-1.5 text-[9px] font-mono">
                  <span className="text-emerald-400">R{opt.stats.running}</span>
                  <span className="text-slate-500">I{opt.stats.idle}</span>
                  <span className="text-red-400">D{opt.stats.breakdown}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function MachineOverviewDashboard() {
  const [machines, setMachines] = useState(() => generateMachines());
  const [hallFilter, setHallFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [countdown, setCountdown] = useState(10);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showHallModal, setShowHallModal] = useState(true);
  const [hasChosen, setHasChosen] = useState(false);

  const refreshData = useCallback(() => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.status !== "running") return m;
        if (Math.random() > 0.45) return m; // only some cards change each poll
        const inc = Math.max(1, Math.round(rand(4, 18)));
        const newActual = Math.min(m.target, m.actual + inc);
        const newReject = m.reject + (Math.random() > 0.85 ? 1 : 0);
        const newGood = Math.max(0, newActual - newReject);
        return {
          ...m,
          actual: newActual,
          good: newGood,
          reject: newReject,
          efficiency: Math.min(100, Math.round((newActual / m.target) * 100)),
          lastUpdate: new Date(),
        };
      }),
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          refreshData();
          return 10;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshData]);

  // Hall-level summaries respect shift filter (not hall filter) — this is the
  // "before the machine grid" overview: 4 halls + All Halls = 5 panels.
  const hallSummaries = useMemo(() => {
    const scoped =
      shiftFilter === "all"
        ? machines
        : machines.filter((m) => m.shift === shiftFilter);
    const build = (list) => {
      const total = list.length || 0;
      const running = list.filter((m) => m.status === "running").length;
      const idle = list.filter((m) => m.status === "idle").length;
      const breakdown = list.filter((m) => m.status === "breakdown").length;
      const maintenance = list.filter((m) => m.status === "maintenance").length;
      const setup = list.filter((m) => m.status === "setup").length;
      const avgEfficiency = total
        ? Math.round(list.reduce((s, m) => s + m.efficiency, 0) / total)
        : 0;
      return {
        total,
        running,
        idle,
        breakdown,
        maintenance,
        setup,
        avgEfficiency,
      };
    };
    const perHall = HALLS.map((h) => ({
      hall: h,
      stats: build(scoped.filter((m) => m.hall === h)),
    }));
    const all = build(scoped);
    return { perHall, all };
  }, [machines, shiftFilter]);

  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      if (hallFilter !== "all" && m.hall !== Number(hallFilter)) return false;
      if (shiftFilter !== "all" && m.shift !== shiftFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (
        search.trim() &&
        !m.code.toLowerCase().includes(search.trim().toLowerCase())
      )
        return false;
      return true;
    });
  }, [machines, hallFilter, shiftFilter, statusFilter, search]);

  const kpis = useMemo(() => {
    const list = filteredMachines;
    const total = list.length;
    const running = list.filter((m) => m.status === "running").length;
    const idle = list.filter((m) => m.status === "idle").length;
    const breakdown = list.filter((m) => m.status === "breakdown").length;
    const production = list.reduce((s, m) => s + m.actual, 0);
    const rejectQty = list.reduce((s, m) => s + m.reject, 0);
    const lossTime = list.reduce((s, m) => s + m.lossTime, 0);
    const avgEff = total
      ? Math.round(list.reduce((s, m) => s + m.efficiency, 0) / total)
      : 0;
    const avgOee = total
      ? Math.round(list.reduce((s, m) => s + m.oee.final, 0) / total)
      : 0;
    return {
      total,
      running,
      idle,
      breakdown,
      production,
      rejectQty,
      lossTime,
      avgEff,
      avgOee,
    };
  }, [filteredMachines]);

  const handleOpenHall = useCallback((hallId) => {
    setHallFilter((prev) => (prev === String(hallId) ? "all" : String(hallId)));
  }, []);

  const handleChooseHall = useCallback((choiceId) => {
    setHallFilter(choiceId);
    setHasChosen(true);
    setShowHallModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pb-16 font-sans text-slate-200">
      {showHallModal && (
        <HallChoiceModal
          hallSummaries={hallSummaries}
          current={hallFilter}
          onChoose={handleChooseHall}
          onDismiss={() => setShowHallModal(false)}
          dismissable={hasChosen}
        />
      )}

      {/* Fixed top block: header + compact filters + stats — stays put while machines scroll beneath */}
      <div
        className={`sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur transition ${showHallModal && !hasChosen ? "pointer-events-none blur-sm" : ""}`}
      >
        <div className="mx-auto p-1">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-cyan-500/10 text-cyan-400">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-50">
                  Machine Overview
                </h1>
                <p className="text-[10px] text-slate-500">
                  Central Production Monitoring Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHallModal(true)}
                className="flex items-center gap-1 rounded-sm border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400"
              >
                <LayoutList className="h-3 w-3" />
                Viewing:{" "}
                {hallFilter === "all" ? "All Halls" : `Hall ${hallFilter}`}
              </button>
              <div className="flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />{" "}
                LIVE
                <span className="text-slate-500">·</span>
                <RefreshCw className="h-3 w-3" />
                <span className="font-mono">
                  {String(countdown).padStart(2, "0")}s
                </span>
              </div>
            </div>
          </div>

          {/* Compact filters — no dropdowns, just search + pill toggles */}
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search machine code"
                className="w-36 rounded-sm border border-slate-800 bg-slate-900 py-1 pl-7 pr-2 text-[11px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/60"
              />
            </div>
            <span className="mx-0.5 h-3.5 w-px bg-slate-800" />
            {["all", ...SHIFTS].map((s) => (
              <button
                key={s}
                onClick={() => setShiftFilter(s)}
                className={`rounded-sm border px-2 py-1 text-[11px] font-medium transition ${
                  shiftFilter === s
                    ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                }`}
              >
                {s === "all" ? "All Shifts" : `Shift ${s}`}
              </button>
            ))}
            <span className="mx-0.5 h-3.5 w-px bg-slate-800" />
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-sm border px-2 py-1 text-[11px] font-medium transition ${
                statusFilter === "all"
                  ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-400"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
              }`}
            >
              All Status
            </button>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className={`flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium transition ${
                  statusFilter === k
                    ? `border-current ${v.chip} ${v.text}`
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />{" "}
                {v.label}
              </button>
            ))}
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
            <KpiCard
              icon={Factory}
              label="Total Machines"
              value={kpis.total}
              accent="bg-slate-700/40 text-slate-300"
            />
            <KpiCard
              icon={Gauge}
              label="Running"
              value={kpis.running}
              accent="bg-emerald-500/10 text-emerald-400"
            />
            <KpiCard
              icon={Timer}
              label="Idle"
              value={kpis.idle}
              accent="bg-slate-500/10 text-slate-300"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Breakdown"
              value={kpis.breakdown}
              accent="bg-red-500/10 text-red-400"
            />
            <KpiCard
              icon={Settings2}
              label="Loss Time"
              value={`${kpis.lossTime} min`}
              accent="bg-amber-500/10 text-amber-400"
            />
            <KpiCard
              icon={Package}
              label="Today's Production"
              value={fmtNum(kpis.production)}
              accent="bg-cyan-500/10 text-cyan-400"
            />
            <KpiCard
              icon={Wrench}
              label="Today's Reject"
              value={fmtNum(kpis.rejectQty)}
              accent="bg-red-500/10 text-red-400"
            />
            <KpiCard
              icon={Gauge}
              label="Avg Efficiency"
              value={`${kpis.avgEff}%`}
              accent="bg-cyan-500/10 text-cyan-400"
            />
            <KpiCard
              icon={Gauge}
              label="Avg OEE"
              value={`${kpis.avgOee}%`}
              accent="bg-blue-500/10 text-blue-400"
            />
          </div>
        </div>
      </div>

      <div
        className={`mx-auto p-1 transition ${showHallModal && !hasChosen ? "pointer-events-none blur-sm" : ""}`}
      >
        {/* Machine grid */}
        <section>
          {/* <div className="mb-1 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-300">
              {hallFilter === "all" ? "All Machines" : `Hall ${hallFilter} Machines`}
            </h2>
            <span className="text-[11px] text-slate-600">{filteredMachines.length} shown</span>
          </div> */}

          {filteredMachines.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-slate-800 py-16 text-center">
              <AlertTriangle className="mb-1 h-6 w-6 text-slate-600" />
              <p className="text-sm text-slate-400">
                No machines match the current filters.
              </p>
              <p className="text-xs text-slate-600">
                Try changing hall, shift, status or search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
              {filteredMachines.map((m) => (
                <MachineCard key={m.id} m={m} onOpen={setSelectedMachine} />
              ))}
            </div>
          )}
        </section>
      </div>

      <MachineDrawer
        machine={selectedMachine}
        onClose={() => setSelectedMachine(null)}
      />
    </div>
  );
}
