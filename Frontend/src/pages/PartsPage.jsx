import React, { useEffect, useMemo, useState } from "react";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import PartsFilters from "../compenents/parts/PartsFilters";
import PartsTable from "../compenents/parts/PartsTable";
import PartsLoadingState from "../compenents/parts/PartsLoadingState";

import { getAllParts } from "../api/partApi";

const PartsPage = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customer, setCustomer] = useState("All");
  const [source, setSource] = useState("All");
  const [status, setStatus] = useState("All");

  const fetchParts = async () => {
    try {
      setLoading(true);

      const response = await getAllParts();

      // API Response
      // {
      //   success:true,
      //   count:10,
      //   data:[]
      // }

      setParts(response.data);
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.part_number.toLowerCase().includes(search.toLowerCase()) ||
        part.part_name.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || part.product_category === category;

      const matchesCustomer = customer === "All" || part.customer === customer;

      const matchesSource = source === "All" || part.source === source;

      const matchesStatus = status === "All" || part.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCustomer &&
        matchesSource &&
        matchesStatus
      );
    });
  }, [parts, search, category, customer, source, status]);

  // NOTE: Sidebar and Header are rendered completely outside/independent of
  // the `loading` state — nothing in this file applies blur, opacity, or
  // any filter to them. They stay fully visible and interactive at all
  // times. Only the <main> content area conditionally swaps between the
  // loading state and the real filters/table. If Sidebar/Header still
  // appear blurred, the cause is inside Sidebar.jsx or Header.jsx itself
  // (e.g. a shared/global loading context applying a filter) — not here.
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden mt-12">
        <Header />

        <main className="flex-1 overflow-y-auto p-1">
          {loading ? (
            <PartsLoadingState />
          ) : (
            <div className="space-y-1">
              <PartsFilters
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                customer={customer}
                setCustomer={setCustomer}
                source={source}
                setSource={setSource}
                status={status}
                setStatus={setStatus}
                parts={parts}
              />

              <PartsTable parts={filteredParts} refresh={fetchParts} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PartsPage;
