import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const actions = [
  {
    key: "view",
    label: "View",
    icon: Eye,
    color: "text-blue-600 hover:bg-blue-100 hover:text-blue-700",
  },
  {
    key: "edit",
    label: "Edit",
    icon: Pencil,
    color: "text-amber-600 hover:bg-amber-100 hover:text-amber-700",
  },
  {
    key: "delete",
    label: "Delete",
    icon: Trash2,
    color: "text-red-600 hover:bg-red-100 hover:text-red-700",
  },
];

const PartActions = ({ part, onView, onEdit, onDelete }) => {
  const handleClick = (action) => {
    switch (action) {
      case "view":
        onView?.(part);
        break;

      case "edit":
        onEdit?.(part);
        break;

      case "delete":
        onDelete?.(part);
        break;

      default:
        break;
    }
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <motion.button
            key={action.key}
            title={action.label}
            onClick={() => handleClick(action.key)}
            whileHover={{ scale: 1.15, y: -1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`rounded p-1.5 transition-colors duration-200 ${action.color}`}
          >
            <Icon size={14} />
          </motion.button>
        );
      })}
    </div>
  );
};

export default React.memo(PartActions);