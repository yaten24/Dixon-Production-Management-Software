// MySQL DATE column ke liye hamesha "YYYY-MM-DD" bhejo, kabhi Date object ya
// ISO datetime string nahi — warna JSON.stringify UTC shift kar deta hai aur
// IST midnight ek din peeche chala jaata hai (yehi original bug tha).
export const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value).split("T")[0];
};