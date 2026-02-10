import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const RoleCard = ({ title, description, icon: Icon, type, onClick }) => {
    const isDoctor = type === 'doctor';
    const isIntern = type === 'intern';

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-8 md:p-10 overflow-hidden cursor-pointer group glass-card rounded-[2rem] h-full flex flex-col justify-between border-t border-white/80`}
            onClick={onClick}
        >
            {/* Dynamic Glow Background */}
            <div className={`absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100 bg-gradient-to-br 
        ${isDoctor
                    ? 'from-emerald-500/5 via-transparent to-transparent'
                    : isIntern
                        ? 'from-indigo-500/5 via-transparent to-transparent'
                        : 'from-orange-500/5 via-transparent to-transparent'}`}
            />

            {/* Decorative Gradient Blob */}
            <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-110
        ${isDoctor
                    ? 'bg-emerald-500'
                    : isIntern
                        ? 'bg-indigo-500'
                        : 'bg-orange-500'}`}
            />

            <div className="relative z-10">
                {/* Icon Badge */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 shadow-sm border border-white/50
          ${isDoctor
                        ? 'bg-emerald-50 group-hover:bg-emerald-500 group-hover:shadow-emerald-500/30'
                        : isIntern
                            ? 'bg-indigo-50 group-hover:bg-indigo-500 group-hover:shadow-indigo-500/30'
                            : 'bg-orange-50 group-hover:bg-orange-500 group-hover:shadow-orange-500/30'}`}>
                    <Icon className={`w-7 h-7 transition-colors duration-300 ${isDoctor
                            ? 'text-emerald-600 group-hover:text-white'
                            : isIntern
                                ? 'text-indigo-600 group-hover:text-white'
                                : 'text-orange-600 group-hover:text-white'}`}
                    />
                </div>

                {/* Text Content */}
                <h3 className="text-3xl font-serif font-medium text-gray-900 mb-4 group-hover:text-primary-dark transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-gray-500 leading-relaxed font-light text-lg mb-8 group-hover:text-gray-700 transition-colors">
                    {description}
                </p>
            </div>

            {/* Action Area */}
            <div className="relative z-10 flex items-center pt-6 border-t border-gray-100 group-hover:border-primary/10 transition-colors">
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-gray-400 group-hover:text-primary transition-colors">Enter Portal</span>
                <div className="ml-auto w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-primary/10 transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transform group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>
        </motion.div>
    );
};

export default RoleCard;
