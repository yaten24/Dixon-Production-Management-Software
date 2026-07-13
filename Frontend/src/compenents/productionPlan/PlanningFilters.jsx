import {
  HiOutlineArrowPath,
} from "react-icons/hi2";

const PlanningFilters = ({
  filters,
  halls,
  shifts,
  onChange,
  onLoad,
  loading,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 p-6">

      <div>

        <label className="text-sm font-medium block mb-2">
          Planning Date
        </label>

        <input
          type="date"
          value={filters.planningDate}
          onChange={(e) =>
            onChange("planningDate", e.target.value)
          }
          className="w-full rounded-lg border p-3"
        />

      </div>

      <div>

        <label className="text-sm font-medium block mb-2">
          Hall
        </label>

        <select
          value={filters.hall}
          onChange={(e) =>
            onChange("hall", e.target.value)
          }
          className="w-full rounded-lg border p-3"
        >
          <option value="">
            Select Hall
          </option>

          {halls.map((hall) => (
            <option
              key={hall}
              value={hall}
            >
              {hall}
            </option>
          ))}

        </select>

      </div>

      <div>

        <label className="text-sm font-medium block mb-2">
          Shift
        </label>

        <select
          value={filters.shift}
          onChange={(e) =>
            onChange("shift", e.target.value)
          }
          className="w-full rounded-lg border p-3"
        >
          <option value="">
            Select Shift
          </option>

          {shifts.map((shift) => (
            <option
              key={shift}
              value={shift}
            >
              {shift}
            </option>
          ))}

        </select>

      </div>

      <div className="flex items-end">

        <button
          onClick={onLoad}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-semibold flex items-center justify-center gap-2"
        >
          <HiOutlineArrowPath />

          {loading
            ? "Loading..."
            : "Load Planning"}
        </button>

      </div>

    </div>
  );
};

export default PlanningFilters;