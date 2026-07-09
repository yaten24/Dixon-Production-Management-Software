import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

import { FaChartLine } from "react-icons/fa";
import ChartCard from "./ChartCard";

const OverallProductionChart = ({ data, onViewHall }) => {
  return (
    <ChartCard
      icon={<FaChartLine className="text-[10px] text-white" />}
      iconBg="#1d4ed8"
      title="Overall Production — All Halls"
      subtitle="Combined hourly target vs actual across Hall-1 to Hall-4"
      onViewHall={() => onViewHall("All")}
      full
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{
            top: 18,
            right: 15,
            left: -10,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F1F5F9"
          />

          <XAxis
            dataKey="hour"
            tick={{
              fontSize: 10,
              fontWeight: 600,
            }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tick={{ fontSize: 9 }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              fontSize: 11,
            }}
          />

          <Legend
            wrapperStyle={{
              fontSize: 10,
            }}
          />

          <Line
            type="monotone"
            dataKey="target"
            stroke="#94A3B8"
            strokeWidth={2}
            dot={{ r: 3 }}
          >
            <LabelList
              dataKey="target"
              position="bottom"
              fontSize={9}
              fontWeight={700}
              fill="#64748B"
            />
          </Line>

          <Line
            type="monotone"
            dataKey="actual"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          >
            <LabelList
              dataKey="actual"
              position="top"
              fontSize={9}
              fontWeight={700}
              fill="#1d4ed8"
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default OverallProductionChart;