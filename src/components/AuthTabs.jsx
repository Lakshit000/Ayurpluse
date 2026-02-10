import React, { useState, useEffect } from "react";
import DoctorAuth from "./DoctorAuth";
import PatientAuth from "./PatientAuth";
import InternAuth from "./InternAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthTabs({ defaultRole = "patient", onLogin }) {
    const [role, setRole] = useState(defaultRole);

    // Update local state if prop changes
    useEffect(() => {
        setRole(defaultRole);
    }, [defaultRole]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel w-full max-w-4xl rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden backdrop-blur-2xl border-white/40 shadow-2xl"
            >
                {/* Background decorative glows */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="text-center mb-10 relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-4xl md:text-5xl font-bold text-gray-900 tracking-tight"
                    >
                        AyurPulse <span className="text-emerald-800 font-light italic">Access</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-3 text-lg text-gray-500 font-light"
                    >
                        Select your role to continue your journey
                    </motion.p>
                </div>

                {/* Content Area */}
                <div className="relative z-10 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {role === "patient" && (
                                <PatientAuth onSuccess={(data) => onLogin && onLogin(data)} />
                            )}
                            {role === "doctor" && (
                                <DoctorAuth onSuccess={(data) => onLogin && onLogin(data)} />
                            )}
                            {role === "intern" && (
                                <InternAuth onSuccess={(data) => onLogin && onLogin(data)} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
