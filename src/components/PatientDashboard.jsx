import React, { useState } from "react";
import {
    LayoutDashboard,
    ClipboardList,
    Camera,
    Sparkles,
    Brain,
    Activity,
    Users,
    Droplets,
    Settings,
    Bell,
    LogOut,
    Calendar,
    Menu, // Added
    X     // Added
} from "lucide-react";
import PatientHome from "./patient/PatientHome";
import PatientPrakruti from "./patient/PatientPrakruti";
import PatientJiva from "./patient/PatientJiva";
import PatientAyurGPT from "./patient/PatientAyurGPT";
import PatientPredictive from "./patient/PatientPredictive";
import PatientHealth from "./patient/PatientHealth";

import PatientPanchakarma from "./patient/PatientPanchakarma";

import SystemSettings from "./Settings";
import PatientAppointments from "./patient/PatientAppointments";
import CurrentTime from "./CurrentTime";

const menu = [
    { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
    { name: "Appointments", icon: Calendar, id: "appointments" },
    { name: "Prakruti & Dosha", icon: ClipboardList, id: "prakruti" },
    { name: "Jivha Pariksha", icon: Camera, id: "jiva" },
    { name: "AyurGPT", icon: Sparkles, id: "ayurgpt" },
    { name: "Predictive Wellness", icon: Brain, id: "predictive" },
    { name: "My Health", icon: Activity, id: "health" },

    { name: "Panchakarma", icon: Droplets, id: "panchakarma" },
    { name: "Settings", icon: Settings, id: "settings" },
];

export default function PatientDashboard({ patientName = "Rahul Sharma", userId: patientId, onLogout }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Added state
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const handleDataUpdate = () => {
        setLastUpdated(Date.now());
    };

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <PatientHome patientName={patientName} userId={patientId} onNavigate={setActiveTab} key={lastUpdated} />;
            case "appointments":
                return <PatientAppointments userId={patientId} />;
            case "prakruti":
                return <PatientPrakruti userId={patientId} onUpdate={handleDataUpdate} />;
            case "jiva":
                return <PatientJiva />;
            case "ayurgpt":
                return <PatientAyurGPT />;
            case "predictive":
                return <PatientPredictive userId={patientId} />;
            case "health":
                return <PatientHealth userId={patientId} />;

            case "panchakarma":
                return <PatientPanchakarma userId={patientId} />;
            case "settings":
                return <SystemSettings userData={{ id: patientId, name: patientName, role: 'patient' }} />;
            default:
                return <PatientHome patientName={patientName} onNavigate={setActiveTab} />;
        }
    };

    const getTabTitle = () => {
        const item = menu.find(m => m.id === activeTab);
        return item ? item.name : "Dashboard";
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] text-gray-900 font-sans flex relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col lg:h-screen ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="px-8 py-8 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-emerald-200 shadow-lg">
                            A
                        </div>
                        <div>
                            <div className="font-bold text-lg leading-tight tracking-tight text-gray-900">AyurPulse</div>
                            <div className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase mt-0.5">
                                Patient Portal
                            </div>
                        </div>
                    </div>
                    <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="px-4 py-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsSidebarOpen(false); // Close sidebar on mobile when item clicked
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${active
                                    ? "bg-emerald-50 text-emerald-700 shadow-sm border-l-4 border-emerald-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase">
                            {getTabTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block">
                            <CurrentTime />
                        </div>
                        <div className="h-8 w-[1px] bg-gray-200" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-900">{patientName}</div>
                            </div>
                            <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                                <img src={`https://ui-avatars.com/api/?name=${patientName}&background=10b981&color=fff`} alt="user" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
