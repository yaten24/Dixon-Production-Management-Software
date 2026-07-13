import React from "react";
import { useNavigate } from "react-router-dom";
import { Factory, RefreshCcw, ArrowRight } from "lucide-react";

const MachineOperatorManagement = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Allocate Machine to Operator",
      description:
        "Assign a machine to an operator for today's production shift.",
      icon: Factory,
      buttonText: "Allocate Machine",
      path: "/production/machine-allocation",
      bg: "from-blue-500 to-blue-700",
    },
    {
      title: "Update Machine Operator",
      description:
        "Update or replace the operator assigned to an existing machine.",
      icon: RefreshCcw,
      buttonText: "Update Allocation",
      path: "/production/update-machine-operator",
      bg: "from-emerald-500 to-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl">

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800">
            Machine Operator Management
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Allocate machines to operators or update existing assignments.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">

          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
              >
                {/* Top Gradient */}
                <div
                  className={`bg-gradient-to-r ${card.bg} p-8 flex justify-center`}
                >
                  <div className="bg-white/20 p-5 rounded-full backdrop-blur-sm">
                    <Icon className="w-14 h-14 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">

                  <h2 className="text-2xl font-bold text-slate-800 mb-4">
                    {card.title}
                  </h2>

                  <p className="text-slate-500 leading-7 mb-8">
                    {card.description}
                  </p>

                  <button
                    onClick={() => navigate(card.path)}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all duration-300"
                  >
                    {card.buttonText}
                    <ArrowRight size={20} />
                  </button>

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default MachineOperatorManagement;