const OverviewHeader = ({ filters, setFilters }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="grid md:grid-cols-5 gap-5">
        <div>
          <label className="block mb-2 font-medium">Date</label>

          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,

                date: e.target.value,
              }))
            }
            className="border rounded-lg p-3 w-full"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Hall</label>

          <select
            value={filters.hall}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,

                hall: e.target.value,
              }))
            }
            className="border rounded-lg p-3 w-full"
          >
            <option>Hall 1</option>

            <option>Hall 2</option>

            <option>Hall 3</option>

            <option>Hall 4</option>

            <option>C-8</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Shift</label>

          <select
            value={filters.shift}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,

                shift: e.target.value,
              }))
            }
            className="border rounded-lg p-3 w-full"
          >
            <option>A</option>

            <option>B</option>

            <option>C</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Search</label>

          <input
            placeholder="IM-01"
            className="border rounded-lg p-3 w-full"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,

                search: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex items-end">
          <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg w-full py-3">
            Live
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewHeader;
