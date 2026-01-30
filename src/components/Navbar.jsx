import React from 'react';
import { Activity, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-5 md:px-16"
        >
            {/* Dynamic Glass Panel for Nav */}
            <div className="absolute inset-x-6 top-5 h-16 rounded-[1.25rem] glass-panel -z-10 bg-white/40 backdrop-blur-3xl border-white/30 shadow-2xl shadow-emerald-900/5" />

            {/* Logo Section */}
            <div className="flex items-center space-x-4 pl-4">
                <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500 blur-lg rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
                    <div className="relative p-2.5 bg-emerald-900 rounded-xl shadow-lg border border-white/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-serif font-black tracking-tight text-gray-900 leading-none">
                        AyurPulse
                    </span>
                    <span className="text-[10px] font-black text-emerald-800 tracking-[0.4em] uppercase mt-1">
                        SaaS Ecosystem
                    </span>
                </div>
            </div>

            {/* Right Icons - Minimalist - Removed content as marked by user */}
            <div className="flex items-center space-x-4 pr-4">
            </div>
        </motion.nav>
    );
};

const NavButton = ({ icon: Icon, label }) => (
    <button className="p-2.5 text-primary-dark/60 rounded-xl hover:bg-white/60 hover:text-primary-dark hover:shadow-sm transition-all duration-300 group relative">
        <Icon className="w-5 h-5" />
        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-wider uppercase text-primary bg-white/90 px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none transform translate-y-2 group-hover:translate-y-0">
            {label}
        </span>
    </button>
);

export default Navbar;
