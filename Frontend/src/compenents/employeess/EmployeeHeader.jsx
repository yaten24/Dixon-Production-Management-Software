import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUserPlus } from "react-icons/fa6";
import UserModal from "../users/UserModal";

const EmployeeHeader = ({ onAddEmployee }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = () => {
    setIsModalOpen(true);
    onAddEmployee?.();
  };

  const handleSave = (data) => {
    // TODO: wire this up to your actual create-user API call
    console.log("New employee data:", data);
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-slate-100 rounded border border-slate-200 shadow-sm px-3 py-2"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          {/* Left Section */}

          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
            >
              Employee Module
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-slate-800 leading-tight"
            >
              Employee <span className="text-blue-600">Management</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-0.5 max-w-2xl text-xs text-slate-500 leading-tight"
            >
              Manage employee records, attendance and workforce efficiently.
            </motion.p>
          </div>

          {/* Right Section */}

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 250,
            }}
            whileHover={{
              scale: 1.05,
              y: -2,
            }}
            whileTap={{
              scale: 0.96,
            }}
            onClick={handleAddClick}
            className="
              flex
              items-center
              justify-center
              gap-1.5
              w-full
              sm:w-auto
              px-3.5
              py-2
              rounded
              bg-gradient-to-r
              from-blue-600
              to-indigo-600
              text-white
              text-sm
              font-semibold
              shadow-md
              hover:shadow-xl
              transition-all
              duration-300
            "
          >
            <FaUserPlus size={14} />

            <span>Add Employee</span>
          </motion.button>
        </div>
      </motion.div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editUser={null}
      />
    </>
  );
};

export default EmployeeHeader;
