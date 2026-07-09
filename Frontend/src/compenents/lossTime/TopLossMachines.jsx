import React from "react";
import { FaCogs } from "react-icons/fa";

const TopLossMachines = ({ data }) => {
  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-blue-600 shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">

        <div className="flex items-center gap-2">

          <FaCogs className="text-blue-600 text-sm" />

          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Top 10 Loss Machines
          </h2>

        </div>

        <span className="text-xs text-gray-500">
          {data.length} Machines
        </span>

      </div>

      {/* Table */}

      <div className="overflow-auto max-h-[500px]">

        <table className="w-full border-collapse">

          <thead className="sticky top-0 bg-gray-50 z-10">

            <tr className="border-b border-gray-200">

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                Rank
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                Hall
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                Machine
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                Events
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                Loss Time
              </th>

              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                Prod. Loss
              </th>

            </tr>

          </thead>

          <tbody>

            {data.map((machine, index) => (

              <tr
                key={machine.machine}
                className={`border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200 ${
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50"
                }`}
              >

                {/* Rank */}

                <td className="px-4 py-3">

                  <div
                    className={`h-8 w-8 flex items-center justify-center text-xs font-bold text-white
                    ${
                      index === 0
                        ? "bg-red-600"
                        : index === 1
                        ? "bg-orange-500"
                        : index === 2
                        ? "bg-yellow-500"
                        : "bg-blue-600"
                    }`}
                  >
                    {index + 1}
                  </div>

                </td>

                {/* Hall */}

                <td className="px-4 py-3">

                  <span className="border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1">

                    {machine.hall}

                  </span>

                </td>

                {/* Machine */}

                <td className="px-4 py-3 font-semibold text-gray-800">

                  {machine.machine}

                </td>

                {/* Events */}

                <td className="px-4 py-3 text-center">

                  <span className="font-semibold text-gray-700">
                    {machine.events}
                  </span>

                </td>

                {/* Loss Time */}

                <td className="px-4 py-3 text-center">

                  <span className="font-bold text-red-600">

                    {machine.lossMinutes} min

                  </span>

                </td>

                {/* Production Loss */}

                <td className="px-4 py-3 text-center">

                  <span className="font-bold text-orange-600">

                    {machine.productionLoss}

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Footer */}

      <div className="flex justify-between items-center border-t border-gray-200 px-5 py-3 bg-gray-50">

        <span className="text-xs text-gray-500">
          Showing Top {data.length} Machines
        </span>

        <span className="text-xs font-medium text-blue-600">
          Sorted by Loss Time
        </span>

      </div>

    </div>
  );
};

export default TopLossMachines;