import React from "react";
import ProductionStatCard from "./ProductionStatCard";
import { productionStats } from "../../data/productionStats";

const ProductionStats = () => {
  return (
    <section>

      {/* Cards */}

      <div
        className="
          grid
          grid-cols-2
          gap-3
          md:grid-cols-4
          xl:grid-cols-8
        ">
        {productionStats.map((stat) => (
          <ProductionStatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
};

export default ProductionStats;
