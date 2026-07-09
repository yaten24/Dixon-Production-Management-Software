import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHome, FaArrowLeft, FaRocket } from "react-icons/fa";

const stars = Array.from({ length: 70 }, (_, index) => ({
  id: index,
  duration: Math.random() * 4 + 2,
  delay: Math.random() * 5,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
}));

const particles = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  size: Math.random() * 8 + 3,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
}));

const NotFound = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      {/* ===============================
              Animated Background
      =============================== */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-purple-600/20 blur-[140px]"
        />
      </div>

      {/* ===============================
                Floating Stars
      =============================== */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.6, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
            }}
          />
        ))}
      </div>

      {/* ===============================
                  Main Content
      =============================== */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-3 rounded border border-blue-500/30 bg-blue-500/10 px-6 py-3 backdrop-blur-xl"
        >
          <FaRocket className="text-blue-400" />

          <span className="text-sm font-semibold tracking-wide text-blue-300">
            DIXON PRODUCTION MANAGEMENT
          </span>
        </motion.div>

        {/* 404 */}

        <motion.h1
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            type: "spring",
          }}
          className="select-none text-[140px] md:text-[220px] xl:text-[260px] font-black leading-none tracking-tight"
        >
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            404
          </span>
        </motion.h1>

        {/* Heading */}

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.3,
          }}
          className="mt-4 text-4xl font-bold text-white md:text-5xl"
        >
          Oops! Page Not Found
        </motion.h2>

        {/* Description */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.5,
          }}
          className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
        >
          The page you're looking for doesn't exist, may have been moved, or is
          temporarily unavailable.
          <br />
          Please return to the dashboard to continue managing your production
          system.
        </motion.p>

        {/* Buttons */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8,
          }}
          className="mt-12 flex flex-wrap items-center justify-center gap-5"
        >
          <Link
            to="/dashboard"
            className="group flex items-center gap-3 rounded bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all hover:scale-105"
          >
            <FaHome />
            Go To Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 rounded border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </motion.div>
        {/* =====================================
                Floating Astronaut
        ====================================== */}

        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [-8, 8, -8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-10 top-28 hidden xl:flex"
        >
          <div className="relative">
            {/* Glow */}

            <div className="absolute inset-0 rounded-full bg-blue-500 blur-3xl opacity-30 scale-150" />

            {/* Helmet */}

            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-8 border-slate-300 bg-white shadow-2xl">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
                <FaRocket size={42} className="text-cyan-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* =====================================
                Floating Planet
        ====================================== */}

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-16 bottom-24 hidden lg:block"
        >
          <div className="relative">
            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-purple-500 to-indigo-700 shadow-2xl" />

            <div className="absolute inset-0 rounded-full bg-purple-500 blur-3xl opacity-40 scale-125" />

            {/* Ring */}

            <div className="absolute left-1/2 top-1/2 h-8 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-cyan-300 rotate-12 opacity-70" />
          </div>
        </motion.div>

        {/* =====================================
                Small Floating Planet
        ====================================== */}

        <motion.div
          animate={{
            y: [-12, 12, -12],
            x: [-8, 8, -8],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          className="absolute right-44 bottom-40 hidden lg:block"
        >
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-xl" />
        </motion.div>

        {/* =====================================
                Shooting Stars
        ====================================== */}

        <motion.div
          animate={{
            x: [-100, 1200],
            y: [0, 500],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 4,
          }}
          className="absolute top-12 left-0 h-[2px] w-44 bg-gradient-to-r from-white to-transparent rotate-12"
        />

        <motion.div
          animate={{
            x: [1200, -300],
            y: [0, 400],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatDelay: 6,
          }}
          className="absolute top-36 right-0 h-[2px] w-52 bg-gradient-to-l from-cyan-400 to-transparent -rotate-12"
        />

        {/* =====================================
                Bottom Glow
        ====================================== */}

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-56 w-[700px] rounded-full bg-blue-600/20 blur-[130px]" />
        {/* =====================================
                Floating Particles
        ====================================== */}

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-cyan-300/40"
              style={{
                width: particle.size,
                height: particle.size,
                left: particle.left,
                top: particle.top,
              }}
              animate={{
                y: [-40, 40, -40],
                x: [-20, 20, -20],
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        {/* =====================================
                  Aurora Glow
        ====================================== */}

        <motion.div
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-[120px]"
        />

        {/* =====================================
                Animated Rings
        ====================================== */}

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-1/2 top-1/2 hidden xl:block"
        >
          <div className="absolute -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full border border-cyan-400/10" />

          <div className="absolute -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full border border-blue-400/10" />
        </motion.div>

        {/* =====================================
                  Floating Icons
        ====================================== */}

        <motion.div
          animate={{
            y: [-12, 12, -12],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="absolute top-40 left-24 hidden xl:flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl border border-white/10"
        >
          <FaRocket className="text-cyan-300 text-xl" />
        </motion.div>

        <motion.div
          animate={{
            y: [12, -12, 12],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
          className="absolute bottom-32 right-32 hidden xl:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10"
        >
          <FaHome className="text-blue-300 text-xl" />
        </motion.div>

        {/* =====================================
                 Pulse Glow
        ====================================== */}

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[80px]"
        />

        {/* =====================================
              Bottom Text
        ====================================== */}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1.2,
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm tracking-[0.3em] uppercase text-slate-500"
        >
          Dixon Production Management System © 2026
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;
