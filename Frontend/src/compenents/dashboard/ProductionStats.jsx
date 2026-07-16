import React from "react";
import ProductionStatCard from "./ProductionStatCard";
import useProductionStats from "../../hooks/useProductionStats";
import { productionStatsConfig } from "../../data/productionStatsConfig";

const ProductionStats = () => {
  const { data, loading, error, refetch } = useProductionStats();

  // Skeleton cards while data loads — same grid, avoids layout jump
  if (loading) {
    return (
      <section>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {productionStatsConfig.map((cfg) => (
            <div
              key={cfg.id}
              className="h-[70px] animate-pulse rounded border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
          <span>{error}</span>
          <button
            onClick={refetch}
            className="rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Merge live values into static display config
  const stats = productionStatsConfig.map((cfg) => ({
    id: cfg.id,
    title: cfg.title,
    icon: cfg.icon,
    bg: cfg.bg,
    color: cfg.color,
    value: cfg.format ? cfg.format(data[cfg.key]) : data[cfg.key],
  }));

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {stats.map((stat) => (
          <ProductionStatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
};

export default ProductionStats;