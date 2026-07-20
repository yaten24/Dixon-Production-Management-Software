import { useNavigate } from 'react-router-dom';
import { HiOutlineCalendarDays, HiOutlineClock } from 'react-icons/hi2';

const PLAN_OPTIONS = [
  {
    key: 'monthly',
    title: 'Monthly Plan',
    description: 'Set up machine, operator, and target allocation for a full production month.',
    icon: HiOutlineCalendarDays,
  },
  {
    key: 'daily',
    title: 'Daily Plan',
    description: "Quickly plan a single day's shift-wise machine and target allocation.",
    icon: HiOutlineClock,
  },
];

export default function PlanSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (planType) => {
    navigate('/employee/ppc/daily', { state: { planType } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-6 sm:max-w-none sm:gap-8">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FDC94D]">
            Production Planning
          </span>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#0F1D24] sm:text-2xl">
            Select Plan Type
          </h1>
          <p className="mt-1 text-xs font-medium text-[#9B9B9B]">
            Choose how you'd like to set up your production plan
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:gap-4">
          {PLAN_OPTIONS.map(({ key, title, description, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className="flex w-full items-center gap-4 rounded-md border border-[#C6C6C6] bg-white px-4 py-4 text-left shadow-[0_1px_0_rgba(15,23,42,0.05)] transition-colors duration-150 hover:border-[#0F1D24] hover:bg-[#0F1D24]/[0.02] active:bg-[#0F1D24]/[0.05] sm:w-64 sm:px-5 md:w-72"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#C6C6C6] bg-[#F5F5F5] text-[#0F1D24]">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-bold tracking-tight text-[#0F1D24]">
                  {title}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-[#9B9B9B] sm:truncate">
                  {description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}