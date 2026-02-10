import React, { useMemo, useState, useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Droplet,
    BarChart3,
    Settings,
    Search,
    Bell,
    LogOut,
    Menu, // Added
    X     // Added
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DoctorHome from "./doctor/DoctorHome";
import DoctorPatients from "./doctor/DoctorPatients";
import DoctorClinicalEntry from "./doctor/DoctorClinicalEntry";
import DoctorPanchakarma from "./doctor/DoctorPanchakarma";
import DoctorAnalytics from "./doctor/DoctorAnalytics";

import SystemSettings from "./Settings";
import CurrentTime from "./CurrentTime";

const menu = [
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { name: "Patients", icon: Users, id: "patients" },
    { name: "Clinical Entry", icon: Stethoscope, id: "clinical" },
    { name: "Panchakarma", icon: Droplet, id: "panchakarma" },
    { name: "Analytics", icon: BarChart3, id: "analytics" },
    { name: "System", icon: Settings, id: "system" },
];

export default function DoctorDashboard({ doctorName = "Dr. Aditi Kulkarni", userId = 1, onLogout }) {
    const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | patients | clinical | panchakarma | analytics | system
    const [q, setQ] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Added state

    console.log('[DoctorDashboard] Rendering with:', { doctorName, userId, activeTab });

    const renderContent = () => {
        const content = (() => {
            try {
                switch (activeTab) {
                    case "dashboard": return <DoctorHome userId={userId} />;
                    case "patients": return <DoctorPatients />;
                    case "clinical": return <DoctorClinicalEntry doctorName={doctorName} doctorId={userId} />;
                    case "panchakarma": return <DoctorPanchakarma />;
                    case "analytics": return <DoctorAnalytics />;
                    case "system": return <SystemSettings userData={{ id: userId, name: doctorName, role: 'doctor' }} />;
                    default:
                        return (
                            <div className="flex items-center justify-center h-96 text-gray-400 font-bold text-xl">
                                Select a module from the sidebar.
                            </div>
                        );
                }
            } catch (error) {
                console.error('[DoctorDashboard] Error rendering content:', error);
                return (
                    <div className="flex flex-col items-center justify-center h-96 text-red-600 font-bold text-xl">
                        <p>Error loading dashboard content</p>
                        <p className="text-sm mt-2">{error.message}</p>
                    </div>
                );
            }
        })();

        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    {content}
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div className="min-h-screen bg-[#f6f7fb] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-gray-200 bg-white/80 backdrop-blur-md transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:h-screen lg:z-40 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="px-6 py-6 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-200"
                            >
                                A
                            </motion.div>
                            <div>
                                <div className="font-bold text-lg leading-tight text-gray-900">AyurPulse</div>
                                <div className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">
                                    Doctor Portal
                                </div>
                            </div>
                        </div>
                        <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsSidebarOpen(false)}>
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="px-3 py-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                        {menu.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <motion.button
                                    key={item.name}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden ${isActive
                                        ? "bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-100"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-full my-2"
                                        />
                                    )}
                                    <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                                    {item.name}
                                </motion.button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto p-6 space-y-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </motion.button>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 min-w-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] h-screen overflow-y-auto">
                    {/* Topbar */}
                    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm support-backdrop-blur:bg-white/90">
                        <div className="px-6 py-4 flex items-center gap-4 justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <Menu className="w-6 h-6" />
                                </button>
                                <div className="text-xl font-black tracking-tight text-gray-800">
                                    {menu.find(m => m.id === activeTab)?.name}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden md:block">
                                    <CurrentTime />
                                </div>

                                <div className="h-8 w-[1px] bg-gray-200" />

                                <div className="flex items-center gap-3 pl-2">
                                    <div className="text-right hidden sm:block">
                                        <div className="font-bold text-sm text-gray-900">{doctorName}</div>
                                        <div className="text-xs text-gray-500 font-semibold tracking-widest uppercase">
                                            Chief Physician
                                        </div>
                                    </div>
                                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 border-2 border-white shadow-md flex items-center justify-center font-bold text-emerald-800 text-lg">
                                        {doctorName.charAt(0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <section className="px-6 py-8 max-w-7xl mx-auto">
                        {renderContent()}
                    </section>
                </main>
            </div>
        </div >
    );
}

// NotificationBell moved to separate component


