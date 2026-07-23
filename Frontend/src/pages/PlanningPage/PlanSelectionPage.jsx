import { useNavigate } from "react-router-dom";
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineArrowLeft,
} from "react-icons/hi2";

const PLAN_OPTIONS = [
  {
    key: "monthly",
    title: "Monthly Plan",
    description:
      "Set up machine, operator, and target allocation for a full production month.",
    icon: HiOutlineCalendarDays,
    path: "/employee/production/plans/monthly",
  },
  {
    key: "daily",
    title: "Daily Plan",
    description:
      "Quickly plan a single day's shift-wise machine and target allocation.",
    icon: HiOutlineClock,
    path: "/employee/production/plans/daily",
  },
];

// This page owns its own full-width top strip (like a page-level
// toolbar) — not the shared app Header component. Panel sits below,
// left-aligned in the content flow, not vertically centered.
export default function PlanSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (plan) => {
    navigate(plan.path, { state: { planType: plan.key } });
  };

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Page-level full-width title strip */}
      <div className="w-full border-b border-[#C6C6C6] bg-white">
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, #0F1D24 0%, #C6C6C6 50%, #FDC94D 100%)",
          }}
        />
        <div className="flex h-[40px] w-full items-center gap-2 px-3">
          <button
            onClick={() => navigate(-1)}
            title="Back"
            className="flex h-6 w-6 items-center justify-center border border-[#C6C6C6] bg-white text-[#0F1D24] hover:bg-[#0F1D24] hover:text-[#FDC94D] transition-colors duration-100"
          >
            <HiOutlineArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div className="border-l border-[#C6C6C6] pl-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1D24]/60">
              Production Planning
            </span>
            <h1 className="text-[13px] font-bold tracking-tight text-[#0F1D24] leading-tight">
              Select Plan Type
            </h1>
          </div>
        </div>
      </div>

      <main className="w-full">
        <div className="mx-auto max-w-2xl">
          <div className="border border-[#C6C6C6] bg-white shadow-[0_1px_2px_rgba(15,29,36,0.06)]">
            <p className="border-b border-[#C6C6C6] bg-[#FAFAFA] px-3 py-2 text-[11px] font-medium text-[#9B9B9B]">
              Choose how you'd like to set up your production plan
            </p>

            {/* Options — grid-line separated rows, like a native list-select */}
            <div className="grid grid-cols-1 gap-px bg-[#C6C6C6] sm:grid-cols-2">
              {PLAN_OPTIONS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <button
                    key={plan.key}
                    onClick={() => handleSelect(plan)}
                    className="group flex items-start gap-3 bg-white px-4 py-4 text-left transition-colors duration-100 hover:bg-[#0F1D24]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#C6C6C6] bg-[#FAFAFA] text-[#0F1D24] transition-colors duration-100 group-hover:border-[#FDC94D]/40 group-hover:bg-transparent group-hover:text-[#FDC94D]">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-[12.5px] font-bold tracking-tight text-[#0F1D24] group-hover:text-white">
                        {plan.title}
                      </h2>
                      <p className="mt-0.5 text-[10.5px] font-medium text-[#9B9B9B] group-hover:text-[#C6C6C6]">
                        {plan.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
