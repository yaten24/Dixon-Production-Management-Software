import React from "react";
import { getRoleColor } from "../../config/userHelpers";

const RoleBadge = ({ role }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getRoleColor(role)}`}
    >
      {role}
    </span>
  );
};

export default RoleBadge;
