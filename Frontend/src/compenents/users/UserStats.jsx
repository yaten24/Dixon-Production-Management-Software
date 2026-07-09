import React, { memo, useMemo } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiLock,
  FiShield,
  FiSlash,
} from "react-icons/fi";

// =============================================
// Stat Card
// =============================================

const StatCard = ({ title, value, icon, iconBg, iconColor, loading }) => {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded
        border
        border-slate-200
        bg-white
        px-3
        py-2
        transition-all
        duration-300
        hover:border-blue-200
        hover:shadow-md
      "
    >
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {title}
        </p>

        {loading ? (
          <div className="mt-1 h-6 w-12 animate-pulse rounded bg-slate-200" />
        ) : (
          <h2 className="text-lg font-bold leading-tight text-slate-800">
            {value}
          </h2>
        )}
      </div>

      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded
          ${iconBg}
        `}
      >
        <span className={`text-sm ${iconColor}`}>{icon}</span>
      </div>
    </div>
  );
};

// =============================================
// User Stats
// =============================================

const UserStats = ({ users = [], loading = false }) => {
  const stats = useMemo(() => {
    const totalUsers = users.length;

    const activeUsers = users.filter((user) => user.status === "Active").length;

    const inactiveUsers = users.filter(
      (user) => user.status === "Inactive",
    ).length;

    // Backend "Suspended" ko normalizeUser already "Locked" mein map karta hai,
    // isliye yahan bhi "Locked" hi check karna hai, "Suspended" nahi
    const lockedUsers = users.filter((user) => user.status === "Locked").length;

    const adminUsers = users.filter((user) => user.role === "Admin").length;

    return [
      {
        title: "Total Users",
        value: totalUsers,
        icon: <FiUsers />,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },

      {
        title: "Active Users",
        value: activeUsers,
        icon: <FiUserCheck />,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },

      {
        title: "Inactive Users",
        value: inactiveUsers,
        icon: <FiSlash />,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
      },

      {
        title: "Locked",
        value: lockedUsers,
        icon: <FiLock />,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
      },

      {
        title: "Administrators",
        value: adminUsers,
        icon: <FiShield />,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
    ];
  }, [users]);

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-2

        sm:grid-cols-2

        lg:grid-cols-3

        xl:grid-cols-5
      "
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          iconBg={stat.iconBg}
          iconColor={stat.iconColor}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default memo(UserStats);
