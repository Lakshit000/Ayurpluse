import React, { useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, User, ArrowLeft, GraduationCap } from "lucide-react";

import Navbar from "./components/Navbar";
import RoleCard from "./components/RoleCard";
import BackgroundDecor from "./components/BackgroundDecor";
import AuthTabs from "./components/AuthTabs";
import DoctorDashboard from "./components/DoctorDashboard";
import PatientDashboard from "./components/PatientDashboard";
import InternDashboard from "./components/InternDashboard";

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import VerifyEmail from './components/VerifyEmail';
import Settings from './components/Settings';

function App() {
  console.log('📱 [App.jsx] Component starting to render...');

  // ✅ 4 Views: home | auth | doctorDashboard | patientDashboard
  const [view, setView] = useState("home");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [userData, setUserData] = useState({ name: "", role: "" });

  console.log('[App.jsx] Current view:', view);
  console.log('[App.jsx] User data:', userData);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Auto-Logout Logic
  const [settings, setSettings] = useState(null);

  React.useEffect(() => {
    // Fetch system settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load settings"));
  }, []);

  React.useEffect(() => {
    if (view === 'home' || !settings || !settings.security_auto_logout) return;

    let lastActivity = Date.now();
    const logoutThreshold = settings.security_auto_logout * 60 * 1000; // minutes to ms

    const updateActivity = () => { lastActivity = Date.now(); };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > logoutThreshold) {
        console.log("Auto-logout triggered");
        setView('home');
        setUserData({ name: "", role: "" });
        alert("Session expired due to inactivity.");
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      clearInterval(interval);
    };
  }, [view, settings]);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // ✅ If doctor dashboard view
  if (view === "doctorDashboard") {
    console.log('[App] Rendering Doctor Dashboard with userData:', userData);
    return <DoctorDashboard doctorName={userData.name} userId={userData.id} onLogout={() => setView("home")} />;
  }

  // ✅ If patient dashboard view
  if (view === "patientDashboard") {
    console.log('[App] Rendering Patient Dashboard with userData:', userData);
    return <PatientDashboard patientName={userData.name} userId={userData.id} onLogout={() => setView("home")} />;
  }

  // ✅ If intern dashboard view
  if (view === "internDashboard") {
    return <InternDashboard userData={userData} onLogout={() => setView("home")} />;
  }

  const MainContent = () => (
    <div className="relative min-h-screen font-sans text-gray-900">
      <BackgroundDecor />
      <Navbar />

      {/* ✅ AUTH PAGE */}
      {view === "auth" ? (
        <main className="container flex flex-col items-center justify-center min-h-screen px-4 pt-28 pb-20 mx-auto">
          {/* Back button */}
          <div className="w-full max-w-5xl mb-6 flex items-center justify-between gap-4">
            <button
              onClick={() => setView("home")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-white/50 shadow-sm hover:bg-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>

          {/* Auth component */}
          <div className="w-full max-w-5xl">
            <AuthTabs
              defaultRole={selectedRole}
              onLogin={(data) => {
                console.log('[App] onLogin callback received data:', data);
                setUserData({ name: data.doctorName || data.patientName, role: data.role, id: data.id });
                console.log('[App] Setting view to:', data.role === 'doctor' ? 'doctorDashboard' : 'patientDashboard');
                if (data.role === 'doctor') setView('doctorDashboard');
                if (data.role === 'patient') setView('patientDashboard');
                if (data.role === 'intern') setView('internDashboard');
              }}
            />
          </div>
        </main>
      ) : (
        /* ✅ HOME PAGE */
        <main className="container flex flex-col items-center justify-center min-h-screen px-4 pt-40 pb-20 mx-auto text-center md:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-6xl"
          >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="mb-24 relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 overflow-hidden py-1">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="block text-xs font-black tracking-[0.3em] uppercase text-emerald-800/60"
                >
                  The Future of Ayurvedic Care
                </motion.span>
              </div>

              <h1 className="mb-8 text-7xl font-serif font-black tracking-tighter text-gray-900 md:text-8xl lg:text-9xl leading-[0.9]">
                <span className="inline-block relative">
                  Ayur<span className="text-emerald-800 italic font-light">Pulse</span>
                </span>
              </h1>

              <motion.div
                variants={itemVariants}
                className="max-w-3xl mx-auto"
              >
                <p className="text-xl text-gray-500 md:text-2xl font-light leading-relaxed mb-6">
                  Intelligent <span className="text-gray-900 font-medium">EMR & EHR</span> for modern Ayurvedic practices.

                </p>
              </motion.div>
            </motion.div>

            {/* Role Selection Cards */}
            <motion.div
              variants={itemVariants}
              className="grid max-w-7xl gap-6 mx-auto md:grid-cols-3 lg:gap-8"
            >
              <RoleCard
                title="Doctor Portal"
                description="Clinical workflows, Prakruti analysis, and digital prescriptions for the modern Vaidya."
                icon={Stethoscope}
                type="doctor"
                onClick={() => {
                  setSelectedRole("doctor");
                  setView("auth");
                }}
              />

              <RoleCard
                title="Patient Portal"
                description="Your personalized health journey, Prakruti insights, and seamless patient care."
                icon={User}
                type="patient"
                onClick={() => {
                  setSelectedRole("patient");
                  setView("auth");
                }}
              />

              <RoleCard
                title="Intern Portal"
                description="Educational observation layer. Compare cases and study disease patterns."
                icon={GraduationCap}
                type="intern"
                onClick={() => {
                  setSelectedRole("intern");
                  setView("auth");
                }}
              />
            </motion.div>

          </motion.div>
        </main>
      )}
    </div>
  );

  return (
    <Routes>
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/settings" element={
        <>
          <Navbar />
          <Settings userData={userData} />
        </>
      } />
      <Route path="/login" element={<MainContent />} /> {/* Catch to ensure redirect works */}
      <Route path="*" element={<MainContent />} />
    </Routes>
  );
}

export default App;
