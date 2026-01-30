import React from "react";
import { motion } from "framer-motion";
import { Leaf, Flower, Sun, Droplets, Wind, Zap } from "lucide-react";

const BackgroundDecor = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#fbfbf9]">

            {/* Premium Gradient Base */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 -left-[10%] w-[70%] h-[70%] bg-emerald-100/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 -right-[10%] w-[60%] h-[60%] bg-amber-50/40 blur-[140px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-rose-50/30 blur-[160px] rounded-full" />
            </div>

            {/* Rotating Mandala Geometric - Top Left */}
            <div className="absolute top-[-15%] left-[-15%] w-[90vh] h-[90vh] opacity-[0.04]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full"
                >
                    <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-900">
                        <defs>
                            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.2 }} />
                            </radialGradient>
                        </defs>
                        <path fill="url(#grad1)" d="M100 0 C120 40 180 40 180 100 C180 160 120 160 100 200 C80 160 20 160 20 100 C20 40 80 40 100 0 Z" />
                        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
                        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    </svg>
                </motion.div>
            </div>

            {/* Subtle Animated Elements */}
            <div className="absolute inset-0">
                <FloatingIcon Icon={Leaf} x="8%" y="15%" delay={0} color="text-emerald-950/5" size={120} speed={15} />
                <FloatingIcon Icon={Flower} x="85%" y="10%" delay={4} color="text-amber-900/5" size={180} speed={20} />
                <FloatingIcon Icon={Sun} x="92%" y="75%" delay={2} color="text-orange-900/5" size={150} speed={18} />
                <FloatingIcon Icon={Droplets} x="12%" y="80%" delay={6} color="text-blue-900/5" size={100} speed={22} />
                <FloatingIcon Icon={Wind} x="50%" y="40%" delay={3} color="text-emerald-900/5" size={90} speed={25} />
            </div>

            {/* Dust Particles Effect (CSS only) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p6.png')] opacity-[0.03]" />
        </div>
    );
};

const FloatingIcon = ({ Icon, x, y, delay, color, size, speed = 8 }) => (
    <motion.div
        className={`absolute ${color}`}
        style={{ left: x, top: y }}
        animate={{
            y: [0, -40, 0],
            x: [0, 20, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.05, 1],
        }}
        transition={{
            duration: speed,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
        }}
    >
        <Icon size={size} strokeWidth={0.5} />
    </motion.div>
);

export default BackgroundDecor;
