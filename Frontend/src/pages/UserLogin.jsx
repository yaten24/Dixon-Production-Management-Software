import React, { useState } from "react";
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!form.username.trim()) return alert("Please enter Employee ID");

    if (!form.password.trim()) return alert("Please enter Password");

    if (loading) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      navigate("/user/home");
    }, 1500);
  };

  return (
    <div className="flex h-screen items-center justify-center overflow-hidden bg-slate-100 p-4">
      <div className="grid h-full max-h-[720px] w-full max-w-6xl overflow-hidden rounded border border-slate-200 bg-white shadow-2xl lg:grid-cols-2">
        {/* ================= LEFT PANEL ================= */}

        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#005AA7] via-[#0066C5] to-[#0A84FF] p-10 text-white lg:flex lg:flex-col lg:justify-center">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-white/5" />

          <div className="relative z-10">
            <img src="/Dixon_Technologies_Logo.png" alt="Dixon Technologies" className="mb-8 h-16 bg-white rounded p-3" />

            <h1 className="text-5xl font-bold leading-tight">
              Dixon
              <br />
              Technologies
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">India's Leading Electronics Manufacturing Company.</p>

            <p className="mt-3 max-w-md text-blue-100">Smart Factory Dashboard for Production Monitoring, Quality Control, OEE, Machine Analytics and Employee Management.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded border border-white/20 bg-white/10 px-4 py-2">
                <h3 className="text-xl font-bold">17+</h3>
                <p className="text-xs text-blue-100">Plants</p>
              </div>

              <div className="rounded border border-white/20 bg-white/10 px-4 py-2">
                <h3 className="text-xl font-bold">75+</h3>
                <p className="text-xs text-blue-100">Production Lines</p>
              </div>

              <div className="rounded border border-white/20 bg-white/10 px-4 py-2">
                <h3 className="text-xl font-bold">30+</h3>
                <p className="text-xs text-blue-100">Years</p>
              </div>
            </div>
            <div className="mt-10 rounded border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <h3 className="text-lg font-semibold">Smart Factory Dashboard</h3>

              <p className="mt-2 text-sm leading-7 text-blue-100">Monitor Production, Quality, OEE, Rejection, Attendance, Loss Time, Mould Change and Machine Performance from one centralized platform.</p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}

        <div className="flex items-center justify-center bg-slate-50 p-8">
          <div className="w-full max-w-md">
            <div className="rounded border border-slate-200 bg-white p-8 shadow-xl">
              <div className="flex justify-center">
                <img src="/Dixon_Technologies_Logo.png" alt="Dixon Technologies" className="h-14 object-contain" />
              </div>

              <h2 className="mt-6 text-center text-3xl font-bold text-slate-800">Welcome Back</h2>

              <p className="mt-2 text-center text-sm text-slate-500">Sign in to access the Smart Factory Dashboard</p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                {/* Employee ID */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Employee ID</label>

                  <div className="relative">
                    <FiUser size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Enter Employee ID" autoComplete="username" className="h-12 w-full rounded border border-slate-300 pl-11 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" required />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>

                  <div className="relative">
                    <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter Password" autoComplete="current-password" className="h-12 w-full rounded border border-slate-300 pl-11 pr-12 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" required />

                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}

                <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded bg-gradient-to-r from-[#005AA7] to-[#0A84FF] font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? (
                    <>
                      <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}

              <div className="my-6 flex items-center">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="px-4 text-xs uppercase tracking-widest text-slate-400">Smart Factory</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Footer */}

              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-slate-700">Dixon Technologies (India) Limited</h3>

                <p className="text-sm text-slate-500">Smart Factory Dashboard</p>

                <p className="text-xs text-slate-400">Production • Quality • OEE • Machine Monitoring</p>

                <p className="pt-2 text-xs text-slate-400">Version 2.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
