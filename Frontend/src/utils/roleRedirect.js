const normalizeRole = (role) => role?.trim().toLowerCase();

const ADMIN_ROLES = ["Admin"];

const PRODUCTION_ROLES = [
  "Operator",
  "Supervisor",
  "Engineer",
  "Sr. Engineer",
];

const MANAGEMENT_ROLES = [
  "Assistant Manager",
  "Deputy Manager",
  "Manager",
  "Assistant General Manager",
  "Deputy General Manager",
  "General Manager",
  "Sr. General Manager",
  "Assistant Vice President",
  "Vice President",
  "Sr. Vice President",
  "President",
];

export const getRedirectByRole = (role) => {
  const normalizedRole = normalizeRole(role);

  if (
    ADMIN_ROLES.some(
      (r) => normalizeRole(r) === normalizedRole
    )
  ) {
    return "/admin/dashboard";
  }

  if (
    PRODUCTION_ROLES.some(
      (r) => normalizeRole(r) === normalizedRole
    )
  ) {
    return "/production/dashboard";
  }

  if (
    MANAGEMENT_ROLES.some(
      (r) => normalizeRole(r) === normalizedRole
    )
  ) {
    return "/management/dashboard";
  }

  // Unknown role
  return "/unauthorized";
};

export { normalizeRole };