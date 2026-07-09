import React, { useMemo, useState } from "react";

import Sidebar from "../compenents/dashboard/Sidebar";
import Header from "../compenents/dashboard/Header";

import EmployeeHeader from "../compenents/employees/EmployeeHeader";
import EmployeeStats from "../compenents/employees/EmployeeStats";
import EmployeeFilters from "../compenents/employees/EmployeeFilters";
import EmployeeTable from "../compenents/employees/EmployeeTable";

import { employees } from "../data/employeeData";

const Employees = () => {
  // ===========================
  // State
  // ===========================

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [shift, setShift] = useState("All");

  // Pagination

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = 3;

  // ===========================
  // Filter Employees
  // ===========================

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchMatch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase());

      const departmentMatch =
        department === "All" || emp.department === department;

      const shiftMatch = shift === "All" || emp.shift === shift;

      return searchMatch && departmentMatch && shiftMatch;
    });
  }, [search, department, shift]);

  // ===========================
  // Dashboard Statistics
  // ===========================

  const total = employees.length;

  const present = employees.filter((emp) => emp.status === "Present").length;

  const absent = total - present;

  const attendance = Math.round((present / total) * 100);

  // ===========================
  // Actions
  // ===========================

  const handleAddEmployee = () => {
    console.log("Add Employee");
  };

  const handleView = (employee) => {
    console.log("View Employee :", employee);
  };

  const handleEdit = (employee) => {
    console.log("Edit Employee :", employee);
  };

  const handleDelete = (employee) => {
    console.log("Delete Employee :", employee);
  };

  // ===========================
  // UI
  // ===========================

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto mt-12 p-1">
          <div
            className="
        mx-auto
        w-full
        rounded
        border
        border-slate-200
        bg-white
        shadow-sm
        p-1
        lg:p-1
      "
          >
            <div className="space-y-1">
              {/* Page Header */}
              {/* <EmployeeHeader onAddEmployee={handleAddEmployee} /> */}

              {/* Statistics */}

              {/*
        <EmployeeStats
          total={total}
          present={present}
          absent={absent}
          attendance={attendance}
        />
        */}

              {/* Filters */}

              <EmployeeFilters
                search={search}
                setSearch={setSearch}
                department={department}
                setDepartment={setDepartment}
                shift={shift}
                setShift={setShift}
              />

              {/* Employee Table */}

              <EmployeeTable
                employees={filteredEmployees}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Employees;
