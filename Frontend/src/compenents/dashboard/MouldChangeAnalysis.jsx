import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const trendData = [
  { day: "Mon", time: 28 },
  { day: "Tue", time: 24 },
  { day: "Wed", time: 32 },
  { day: "Thu", time: 20 },
  { day: "Fri", time: 26 },
  { day: "Sat", time: 18 },
  { day: "Sun", time: 22 },
];

const recentChanges = [
  {
    machine: "MC-101",
    mould: "Front Cover",
    time: 22,
  },
  {
    machine: "MC-204",
    mould: "Rear Cover",
    time: 35,
  },
  {
    machine: "MC-112",
    mould: "Dashboard",
    time: 18,
  },
  {
    machine: "MC-305",
    mould: "Console",
    time: 42,
  },
  {
    machine: "MC-401",
    mould: "Door Trim",
    time: 29,
  },
];

const MouldChangeAnalysis = () => {
  const totalChanges = recentChanges.length;

  const averageTime = Math.round(
    recentChanges.reduce((sum, item) => sum + item.time, 0) / totalChanges,
  );

  const fastest = Math.min(...recentChanges.map((item) => item.time));

  const longest = Math.max(...recentChanges.map((item) => item.time));

  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-xl
        shadow-sm
        h-[350px]
        flex
        flex-col
        overflow-hidden
      "
    >
      {/* Header */}

      <div
        className="
          px-4
          py-3
          border-b
          border-slate-200
          bg-slate-50
        "
      >
        <h3 className="text-lg font-semibold text-slate-800">
          Mould Change Analysis
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Last 7 Days Trend & Today's Performance
        </p>
      </div>

      {/* Chart */}

      <div className="h-[160px] px-3 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="day"
              tick={{
                fontSize: 11,
              }}
            />

            <YAxis
              tick={{
                fontSize: 10,
              }}
            />

            <Tooltip formatter={(value) => [`${value} min`, "Change Time"]} />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#2563eb",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= KPI CARDS ================= */}

      <div
        className="
          grid
          grid-cols-4
          gap-2
          px-3
          py-2
        "
      >
        <div className="bg-slate-50 rounded-md p-2">
          <p
            className="
              text-[10px]
              uppercase
              text-slate-500
            "
          >
            Today
          </p>

          <h4
            className="
              text-lg
              font-bold
              text-blue-600
            "
          >
            {totalChanges}
          </h4>
        </div>

        <div className="bg-slate-50 rounded-md p-2">
          <p
            className="
              text-[10px]
              uppercase
              text-slate-500
            "
          >
            Avg
          </p>

          <h4
            className="
              text-lg
              font-bold
              text-green-600
            "
          >
            {averageTime}m
          </h4>
        </div>

        <div className="bg-slate-50 rounded-md p-2">
          <p
            className="
              text-[10px]
              uppercase
              text-slate-500
            "
          >
            Fast
          </p>

          <h4
            className="
              text-lg
              font-bold
              text-emerald-600
            "
          >
            {fastest}m
          </h4>
        </div>

        <div className="bg-slate-50 rounded-md p-2">
          <p
            className="
              text-[10px]
              uppercase
              text-slate-500
            "
          >
            Long
          </p>

          <h4
            className="
              text-lg
              font-bold
              text-red-600
            "
          >
            {longest}m
          </h4>
        </div>
      </div>
      {/* ================= RECENT MOULD CHANGES ================= */}

      <div
        className="
          flex-1
          px-3
          pb-3
          overflow-hidden
        "
      >
        <h4
          className="
            text-sm
            font-semibold
            text-slate-700
            mb-2
          "
        >
          Recent Mould Changes
        </h4>

        <div className="space-y-2">
          {recentChanges.map((item, index) => (
            <div
              key={index}
              className="
                flex
                items-center
                justify-between
                bg-slate-50
                rounded-md
                px-3
                py-2
              "
            >
              {/* Left */}

              <div className="flex items-center gap-3">
                <div
                  className="
                    h-8
                    w-8
                    rounded-full
                    bg-blue-100
                    flex
                    items-center
                    justify-center
                    text-blue-600
                    text-xs
                    font-bold
                  "
                >
                  {index + 1}
                </div>

                <div>
                  <h5
                    className="
                      text-xs
                      font-semibold
                      text-slate-800
                    "
                  >
                    {item.machine}
                  </h5>

                  <p
                    className="
                      text-[11px]
                      text-slate-500
                    "
                  >
                    {item.mould}
                  </p>
                </div>
              </div>

              {/* Right */}

              <div className="text-right">
                <span
                  className={`
                    text-sm
                    font-bold
                    ${
                      item.time <= 20
                        ? "text-green-600"
                        : item.time <= 30
                          ? "text-amber-600"
                          : "text-red-600"
                    }
                  `}
                >
                  {item.time} min
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MouldChangeAnalysis;
