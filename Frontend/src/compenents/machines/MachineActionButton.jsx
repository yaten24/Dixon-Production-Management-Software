import React, { useState } from "react";
import { updateMachineStatus } from "../../api/machineApi";

const MachineActionButton = ({
  machine,
  onStatusChange,
}) => {

  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e) => {

    const newStatus = e.target.value;

    if (newStatus === machine.status) return;

    try {

      setLoading(true);

      await onStatusChange(
        machine.id,
        newStatus
      );

    } catch (error) {

      console.log(error);

      alert("Unable to update machine status.");

    } finally {

      setLoading(false);

    }

  };

  const statusStyle = {
    Running:
      "bg-green-100 text-green-700 border-green-300",

    Stopped:
      "bg-red-100 text-red-700 border-red-300",

    Maintenance:
      "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  return (
    <select
      value={machine.status}
      disabled={loading}
      onChange={handleStatusChange}
      className={`rounded border px-1 py-1 text-[11px] font-semibold outline-none transition disabled:opacity-60 ${
        statusStyle[machine.status]
      }`}
    >
      <option value="Running">
        Running
      </option>

      <option value="Stopped">
        Stopped
      </option>

      <option value="Maintenance">
        Maintenance
      </option>
    </select>
  );
};

export default React.memo(MachineActionButton);