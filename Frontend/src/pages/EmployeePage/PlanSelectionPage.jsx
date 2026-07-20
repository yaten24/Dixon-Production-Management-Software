import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../compenents/PlanSelection/BreadCrumb";
import SearchBar from "../../compenents/PlanSelection/SearchBar";
import FilterDropdown from "../../compenents/PlanSelection/FilterDropdown";
import PlanGrid from "../../compenents/PlanSelection/PlanGrid";
import SelectionSummary from "../../compenents/PlanSelection/SelectionSummary";
import FooterActions from "../../compenents/PlanSelection/FooterActions";
import { planTypes } from "../../compenents/PlanSelection/planTypes";
export default function PlanSelectionPage() {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All Plans");
  const [loading] = useState(false);

  const cardRefs = useRef({});

  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return planTypes.filter((plan) => {
      const matchesFilter = filter === "All Plans" || plan.category === filter;
      const matchesSearch =
        !q ||
        plan.name.toLowerCase().includes(q) ||
        plan.description.toLowerCase().includes(q) ||
        plan.useCases.some((u) => u.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [searchQuery, filter]);

  const activePlan = planTypes.find((p) => p.id === selectedPlan) ?? null;

  const handleSelect = (planId) => setSelectedPlan(planId);

  const handleConfirm = (planId) => {
    navigate("/create-plan/details", { state: { planType: planId } });
  };

  const handleContinue = () => {
    if (selectedPlan) handleConfirm(selectedPlan);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:px-8">
        <Breadcrumb />

        <div className="mt-4">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Create New Production Plan
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 sm:text-base">
            Choose the planning type that best fits your production
            requirements.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterDropdown value={filter} onChange={setFilter} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <PlanGrid
            plans={filteredPlans}
            selectedPlan={selectedPlan}
            onSelect={handleSelect}
            onConfirm={handleConfirm}
            cardRefs={cardRefs}
          />
          <SelectionSummary plan={activePlan} />
        </div>
      </div>

      <FooterActions
        onCancel={() => navigate(-1)}
        onContinue={handleContinue}
        disabled={!selectedPlan}
      />
    </div>
  );
}
