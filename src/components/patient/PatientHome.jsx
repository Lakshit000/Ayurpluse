import React, { useEffect, useState } from "react";
import {
    Calendar,
    Pill,
    ArrowRight,
    Info,
    TrendingUp,
    Heart,
    Droplets
} from "lucide-react";
import { motion } from "framer-motion";

export default function PatientHome({ patientName = "Rahul Sharma", userId, onNavigate }) {
    const firstName = patientName.split(' ')[0];
    const [data, setData] = useState({
        prakruti: null,
        nextAppointment: null,
        medications: [],
        panchakarma: null,
        doshaScores: null,
        vikrutiMetrics: []
    });

    useEffect(() => {
        if (!userId) return;
        fetch(`/api/patient/dashboard/${userId}`)
            .then(res => res.json())
            .then(d => setData(d))
            .catch(err => console.error(err));
    }, [userId]);

    // Helper to render empty state for Prakruti
    const renderPrakruti = () => {
        if (!data.doshaScores) {
            return (
                <div className="relative flex flex-col items-center justify-center py-10 text-center">
                    <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        <Info className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Unknown Constitution</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-[200px]">
                        Take the quiz to discover your specific body type.
                    </p>
                    <button
                        onClick={() => onNavigate && onNavigate('prakruti')}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition"
                    >
                        Take Quiz
                    </button>
                </div>
            );
        }

        return (
            <div className="relative flex flex-col items-center justify-center py-6">
                {/* Dynamic Ring Chart */}
                <div className="relative w-48 h-48 rounded-full border-[16px] border-gray-50 flex items-center justify-center">
                    <motion.div
                        initial={{ rotate: 0, opacity: 0 }}
                        animate={{ rotate: 45, opacity: 1 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="absolute inset-0 rounded-full border-[16px] border-emerald-600 border-t-transparent border-l-transparent"
                    />
                    <div className="text-center">
                        <div className="text-4xl font-black text-emerald-900 tracking-tighter">{data.doshaScores.vata}%</div>
                        <div className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Vata</div>
                    </div>
                </div>

                <div className="w-full mt-10 space-y-4">
                    <DoshaProgress label="PITTA" value={data.doshaScores.pitta} color="bg-orange-400" delay={0.2} />
                    <DoshaProgress label="KAPHA" value={data.doshaScores.kapha} color="bg-emerald-800" delay={0.4} />
                </div>
                {/* Advice Box */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50"
                >
                    <p className="text-xs font-medium text-emerald-800 leading-relaxed italic">
                        "Your profile suggests a Vata-dominant constitution."
                    </p>
                </motion.div>
            </div>
        );
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Header Banner */}
            <motion.div variants={item} className="bg-white rounded-[2rem] p-10 border border-emerald-50 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Namaste, {firstName}</h2>
                    <p className="text-lg text-gray-500 font-medium">
                        {data.prakruti ? (
                            <span>Your body is in a <span className="text-emerald-700 font-bold">{data.prakruti}</span> balancing phase.</span>
                        ) : (
                            <span>Let's start your wellness journey.</span>
                        )}
                    </p>
                </div>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <Heart size={200} strokeWidth={1} />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Prakruti Profile Card */}
                <motion.div variants={item} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-900">Your Prakruti Profile</h3>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                            <Info className="w-5 h-5" />
                        </button>
                    </div>
                    {renderPrakruti()}
                </motion.div>

                {/* Right Column Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Next Appointment Tile */}
                        <motion.div variants={item} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-5 cursor-pointer hover:shadow-md transition-shadow">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Next Appointment</div>
                                <div className="text-lg font-bold text-gray-900">
                                    {data.nextAppointment
                                        ? `${new Date(data.nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${data.nextAppointment.time}`
                                        : "No upcoming visits"}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {data.nextAppointment ? "General Checkup" : "Schedule now"}
                                </div>
                            </div>
                        </motion.div>

                        {/* Medications Tile */}
                        <motion.div variants={item} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-5 cursor-pointer hover:shadow-md transition-shadow">
                            <div className="h-14 w-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                                <Pill className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Medications</div>
                                <div className="text-lg font-bold text-gray-900">
                                    {data.medications.length > 0 ? `${data.medications.length} Active` : "None"}
                                </div>
                                <div className="text-sm text-gray-500 mt-1 truncate max-w-[120px]">
                                    {data.medications.length > 0 ? data.medications[0].name + "..." : "No active prescriptions"}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Treatment Progress */}
                    <motion.div variants={item} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-900">Treatment Progress <span className="text-gray-400 font-medium text-lg">(Vikruti)</span></h3>
                            </div>
                            {data.vikrutiMetrics.length > 0 && (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Improving</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-10">
                            {data.vikrutiMetrics && data.vikrutiMetrics.length > 0 ? (
                                data.vikrutiMetrics.map((metric, idx) => (
                                    <TreatmentBar key={idx} label={metric.label} value={metric.value} delay={idx * 0.1} />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm mb-2">No active treatment metrics.</p>
                                    <p className="text-xs text-gray-300">Data will appear here after your first doctor's visit.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 flex items-center justify-between border-t border-gray-50 pt-6">
                            <div className="text-xs font-medium text-gray-400 italic">Last updated on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            <button onClick={() => onNavigate && onNavigate('health')} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-widest">
                                View History <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Current Panchakarma Cycle Summary (New) */}
                    {data.panchakarma && (
                        <motion.div variants={item} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Droplets className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Current Panchakarma Cycle</div>
                                    <div className="text-xs text-gray-500">{data.panchakarma.name} • {data.panchakarma.progress}% completed</div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function DoshaProgress({ label, value, color, delay = 0 }) {
    return (
        <div className="flex items-center gap-4 w-full">
            <span className="text-[10px] font-bold text-gray-400 w-10">{label}</span>
            <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: delay, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
            <span className="text-xs font-bold text-gray-700 w-8">{value}%</span>
        </div>
    );
}

function TreatmentBar({ label, value, delay = 0 }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-700 tracking-tight">{label}</span>
                <span className="text-sm font-bold text-emerald-900">{value}%</span>
            </div>
            <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: delay, ease: "easeOut" }}
                    className="h-full bg-emerald-900 rounded-full"
                />
            </div>
        </div>
    );
}
