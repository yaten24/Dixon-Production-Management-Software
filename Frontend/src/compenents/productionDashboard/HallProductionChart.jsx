import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

import { FaIndustry } from "react-icons/fa";
import ChartCard from "./ChartCard";

const HallProductionChart = ({
  hall,
  rows,
  accent,
  onViewHall,
}) => {
  return (
    <ChartCard
      icon={<FaIndustry className="text-[10px] text-white" />}
      iconBg={accent}
      title={`${hall} — Hourly Production`}
      subtitle="Target vs Actual, hour by hour"
      onViewHall={() => onViewHall(hall)}
    >
      <ResponsiveContainer width="100%" height={190}>
        <BarChart
          data={rows}
          margin={{
            top: 18,
            right: 10,
            left: -15,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F1F5F9"
            vertical={false}
          />

          <XAxis
            dataKey="hour"
            tick={{ fontSize: 9 }}
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
              fontSize: 9,
            }}
          />

          <Bar
            dataKey="target"
            fill="#CBD5E1"
            radius={[3, 3, 0, 0]}
            maxBarSize={16}
          >
            <LabelList
              dataKey="target"
              position="top"
              fontSize={8}
              fontWeight={700}
              fill="#64748B"
            />
          </Bar>

          <Bar
            dataKey="actual"
            fill={accent}
            radius={[3, 3, 0, 0]}
            maxBarSize={16}
          >
            <LabelList
              dataKey="actual"
              position="top"
              fontSize={8}
              fontWeight={700}
              fill="#1F2937"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default HallProductionChart;