import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Dashboard = () => <h1>Dashboard Page</h1>;
const Employees = () => <h1>Employees Page</h1>;
const Machines = () => <h1>Machines Page</h1>;
const Reports = () => <h1>Reports Page</h1>;
const NotFound = () => <h1>404 Page Not Found</h1>;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;