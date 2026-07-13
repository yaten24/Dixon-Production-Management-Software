import MachinePlanningRow from "./MachinePlanningRow";

const MachinePlanningTable = ({
  rows,
  setRows,
  operators,
  parts,
}) => {

  const updateRow = (
    index,
    updatedData
  ) => {

    const copy = [...rows];

    copy[index] = {
      ...copy[index],
      ...updatedData,
    };

    setRows(copy);

  };

  return (

    <div className="bg-white rounded-xl shadow">

      <div className="border-b p-5">

        <h2 className="text-xl font-bold">

          Machine Planning

        </h2>

      </div>

      <div className="overflow-auto">

        <table className="min-w-full">

          <thead className="sticky top-0 bg-gray-100">

            <tr>

              <th className="px-4 py-3 text-left">
                Machine
              </th>

              <th className="px-4 py-3 text-left">
                Machine Name
              </th>

              <th className="px-4 py-3 text-left">
                Operator
              </th>

              <th className="px-4 py-3 text-left">
                Part Number
              </th>

              <th className="px-4 py-3 text-center">
                Cycle Time
              </th>

              <th className="px-4 py-3 text-left">
                Target Qty
              </th>

              <th className="px-4 py-3 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row,index)=>(

              <MachinePlanningRow

                key={row.machineCode}

                row={row}

                index={index}

                operators={operators}

                parts={parts}

                updateRow={updateRow}

              />

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default MachinePlanningTable;