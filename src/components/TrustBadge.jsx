import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const TrustBadge = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col items-center justify-center mt-12 mb-8 space-y-4"
        >
            <div className="flex items-center space-x-3 bg-white/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/60 shadow-sm transition-all hover:bg-white/60">
                <div className="relative flex items-center justify-center w-3 h-3">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>
                <span className="text-xs font-bold tracking-widest text-primary-dark uppercase font-sans">
                    Enterprise-Grade Secure Environment
                </span>
            </div>

            <div className="flex items-center space-x-8 text-[10px] tracking-wider text-gray-500 font-medium uppercase font-sans opacity-70">
                <div className="flex items-center space-x-1.5 hover:text-primary transition-colors cursor-default">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-1.5 hover:text-primary transition-colors cursor-default">
                    <Lock className="w-3.5 h-3.5" />
                    <span>AES-256 Encrypted</span>
                </div>
                <span className="hover:text-primary transition-colors cursor-default">ISO 27001 Certified</span>
            </div>
        </motion.div>
    );
};

export default TrustBadge;
