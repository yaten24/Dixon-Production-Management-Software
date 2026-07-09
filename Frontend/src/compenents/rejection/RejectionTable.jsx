import React, {
  useMemo,
  useState,
} from "react";

import {
  FaSearch,
  FaFileExcel,
  FaFilePdf,
  FaTable,
} from "react-icons/fa";

const RejectionTable = ({
  data = [],
}) => {
  const [search, setSearch] =
    useState("");

  const filteredRows =
    useMemo(() => {
      return data.filter(
        (item) => {
          const searchText =
            search.toLowerCase();

          return (
            item?.machine
              ?.toLowerCase()
              ?.includes(
                searchText
              ) ||
            item?.part
              ?.toLowerCase()
              ?.includes(
                searchText
              ) ||
            item?.reason
              ?.toLowerCase()
              ?.includes(
                searchText
              ) ||
            item?.hall
              ?.toLowerCase()
              ?.includes(
                searchText
              ) ||
            item?.shift
              ?.toLowerCase()
              ?.includes(
                searchText
              )
          );
        }
      );
    }, [data, search]);

  const totalRejectQty =
    filteredRows.reduce(
      (sum, item) =>
        sum +
        Number(
          item.rejectQty || 0
        ),
      0
    );

  return (
    <div className="bg-white border border-slate-200 p-5">

      {/* Header */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5 pb-4 border-b border-slate-200">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-red-100 flex items-center justify-center">
            <FaTable className="text-red-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Rejection Records
            </h2>

            <p className="text-xs text-slate-500">
              Detailed rejection analysis and quality tracking
            </p>
          </div>

        </div>

        <div className="flex flex-wrap gap-3">

          {/* Search */}

          <div className="relative">

            <FaSearch className="absolute left-3 top-3.5 text-slate-400" />

            <input
              type="text"
              placeholder="Search Machine / Part / Reason"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
                h-10
                pl-10
                pr-4
                border
                border-slate-300
                text-sm
                outline-none
                focus:border-blue-500
                min-w-[260px]
              "
            />

          </div>

          <button
            className="
              h-10
              px-4
              bg-green-600
              hover:bg-green-700
              text-white
              text-sm
              flex
              items-center
              gap-2
              transition
            "
          >
            <FaFileExcel />
            Excel
          </button>

          <button
            className="
              h-10
              px-4
              bg-red-600
              hover:bg-red-700
              text-white
              text-sm
              flex
              items-center
              gap-2
              transition
            "
          >
            <FaFilePdf />
            PDF
          </button>

        </div>

      </div>

      {/* KPI Row */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        <div className="border border-slate-200 p-4">
          <p className="text-xs uppercase text-slate-500">
            Total Records
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-1">
            {filteredRows.length}
          </p>
        </div>

        <div className="border border-slate-200 p-4">
          <p className="text-xs uppercase text-slate-500">
            Total Rejection Qty
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {totalRejectQty}
          </p>
        </div>

      </div>

      {/* Table */}

      <div className="overflow-auto max-h-[650px] border border-slate-200">

        <table className="w-full text-sm">

          <thead className="sticky top-0 bg-slate-100 z-10">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                Hall
              </th>

              <th className="p-3 text-left">
                Machine
              </th>

              <th className="p-3 text-left">
                Part
              </th>

              <th className="p-3 text-left">
                Shift
              </th>

              <th className="p-3 text-left">
                Reason
              </th>

              <th className="p-3 text-center">
                Reject Qty
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredRows.length >
            0 ? (
              filteredRows.map(
                (
                  item,
                  index
                ) => (
                  <tr
                    key={index}
                    className={`
                      border-b
                      border-slate-200
                      hover:bg-slate-50
                      transition
                      ${
                        index %
                          2 ===
                        0
                          ? "bg-white"
                          : "bg-slate-50/40"
                      }
                    `}
                  >
                    <td className="p-3">
                      {index + 1}
                    </td>

                    <td className="p-3">
                      {item.date}
                    </td>

                    <td className="p-3">
                      {item.hall}
                    </td>

                    <td className="p-3 font-medium">
                      {item.machine}
                    </td>

                    <td className="p-3">
                      {item.part}
                    </td>

                    <td className="p-3">
                      {item.shift}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 border border-red-200">
                        {item.reason}
                      </span>
                    </td>

                    <td className="p-3 text-center font-bold text-red-600">
                      {item.rejectQty}
                    </td>

                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-12 text-slate-500"
                >
                  No rejection records found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default RejectionTable;