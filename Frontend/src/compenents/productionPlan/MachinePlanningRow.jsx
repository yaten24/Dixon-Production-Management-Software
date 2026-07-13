const MachinePlanningRow = ({
  row,
  index,
  operators,
  parts,
  updateRow,
}) => {

  const handleOperator = (value) => {
    updateRow(index, {
      operatorId: value,
    });
  };

  const handlePart = (value) => {

    const selected = parts.find(
      (p) => p.partNumber === value
    );

    updateRow(index, {
      partNumber: value,
      cycleTime: selected?.cycleTime || "",
    });

  };

  const handleTarget = (value) => {

    updateRow(index, {
      targetQty: value,
    });

  };

  const completed =
    row.operatorId &&
    row.partNumber &&
    row.targetQty;

  return (
    <tr className="hover:bg-gray-50">

      <td className="px-4 py-3 font-semibold">
        {row.machineCode}
      </td>

      <td className="px-4 py-3">
        {row.machineName}
      </td>

      <td className="px-4 py-3">

        <select
          className="w-full border rounded-lg p-2"
          value={row.operatorId}
          onChange={(e) =>
            handleOperator(e.target.value)
          }
        >

          <option value="">
            Select Operator
          </option>

          {operators.map((op) => (

            <option
              key={op.operatorId}
              value={op.operatorId}
            >
              {op.operatorId} - {op.operatorName}
            </option>

          ))}

        </select>

      </td>

      <td className="px-4 py-3">

        <select
          className="w-full border rounded-lg p-2"
          value={row.partNumber}
          onChange={(e) =>
            handlePart(e.target.value)
          }
        >

          <option value="">
            Select Part
          </option>

          {parts.map((part) => (

            <option
              key={part.partNumber}
              value={part.partNumber}
            >
              {part.partNumber} - {part.partName}
            </option>

          ))}

        </select>

      </td>

      <td className="px-4 py-3 text-center">

        {row.cycleTime || "--"}

      </td>

      <td className="px-4 py-3">

        <input
          type="number"
          className="w-full border rounded-lg p-2"
          placeholder="Target"
          value={row.targetQty}
          onChange={(e)=>
            handleTarget(e.target.value)
          }
        />

      </td>

      <td className="px-4 py-3">

        {completed ? (

          <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">
            Planned
          </span>

        ) : (

          <span className="bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs font-semibold">
            Pending
          </span>

        )}

      </td>

    </tr>
  );
};

export default MachinePlanningRow;