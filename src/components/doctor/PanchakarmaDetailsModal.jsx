import React, { useEffect, useState } from 'react';
import { X, Calendar, Activity, CheckCircle2, Circle, Clock, User, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PanchakarmaDetailsModal({ isOpen, onClose, cycleId }) {
    const [cycle, setCycle] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && cycleId) {
            fetchCycleDetails();
        }
    }, [isOpen, cycleId]);

    const fetchCycleDetails = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/panchakarma/cycle/${cycleId}`);
            if (res.ok) {
                const data = await res.json();
                setCycle(data);
            }
        } catch (error) {
            console.error("Failed to fetch cycle details", error);
        } finally {
            setLoading(false);
        }
    };

    // Polling for updates (Realtime)
    useEffect(() => {
        if (!isOpen || !cycleId) return;

        const interval = setInterval(() => {
            fetch(`/api/panchakarma/cycle/${cycleId}`)
                .then(res => res.json())
                .then(data => setCycle(data))
                .catch(console.error);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [isOpen, cycleId]);

    const handleMarkComplete = async (stageId) => {
        try {
            const res = await fetch(`/api/panchakarma/stage/${stageId}/complete`, {
                method: 'POST'
            });
            if (res.ok) {
                // Refresh data immediately
                const updatedRes = await fetch(`/api/panchakarma/cycle/${cycleId}`);
                const data = await updatedRes.json();
                setCycle(data);
            } else {
                alert("Failed to update stage status");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating stage");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-3xl h-[85vh] bg-white rounded-3xl shadow-2xl z-[70] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gradient-to-r from-emerald-50 to-white">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Droplet className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Therapy Progression</h2>
                                    {cycle && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold mt-1">
                                            <span className="font-bold text-gray-800">{cycle.patient_name}</span>
                                            <span>•</span>
                                            <span className="uppercase text-emerald-600 font-bold tracking-wider">{cycle.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-0">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <Activity className="w-8 h-8 animate-pulse mb-3 text-emerald-300" />
                                    <span className="font-medium">Loading therapy details...</span>
                                </div>
                            ) : cycle ? (
                                <div>
                                    {/* Overall Progress */}
                                    <div className="p-8 bg-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Treatment Completion</h3>
                                            <span className="text-2xl font-black text-emerald-600">{cycle.progress}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cycle.progress}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full relative"
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                            </motion.div>
                                        </div>
                                        <div className="mt-4 flex justify-between text-sm text-gray-500 font-medium">
                                            <span>Start: {new Date(cycle.start_date).toLocaleDateString()}</span>
                                            <span>Est. End: {cycle.stages && cycle.stages.length > 0 ? new Date(cycle.stages[cycle.stages.length - 1].date).toLocaleDateString() : '-'}</span>
                                        </div>
                                    </div>

                                    {/* Stages List */}
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-8 min-h-full">
                                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Daily Protocol Breakdown</h3>

                                        <div className="space-y-4">
                                            {cycle.stages && cycle.stages.map((stage, index) => {
                                                const isCompleted = stage.status === 'completed';
                                                const isToday = new Date(stage.date).toDateString() === new Date().toDateString();
                                                const isPast = new Date(stage.date) < new Date() && !isToday;

                                                return (
                                                    <motion.div
                                                        key={stage.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className={`relative flex items-center p-4 rounded-2xl border transition-all ${isCompleted
                                                            ? 'bg-emerald-50/50 border-emerald-100'
                                                            : isToday
                                                                ? 'bg-white border-blue-200 shadow-md scale-[1.02]'
                                                                : 'bg-white border-gray-100 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        {/* Status Icon */}
                                                        <div className="mr-4">
                                                            {isCompleted ? (
                                                                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                                    <CheckCircle2 className="w-6 h-6" />
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleMarkComplete(stage.id)}
                                                                    className={`h-10 w-10 rounded-full flex items-center justify-center transition cursor-pointer ${isToday
                                                                            ? "bg-blue-100 text-blue-600 animate-pulse hover:bg-blue-200 hover:scale-110"
                                                                            : "bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600"
                                                                        }`}
                                                                    title="Click to mark as completed"
                                                                >
                                                                    {isToday ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-sm font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-600'}`}>
                                                                    {stage.name}
                                                                </span>
                                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${stage.type === 'Purvakarma' ? 'bg-orange-100 text-orange-700' :
                                                                    stage.type === 'Pradhanakarma' ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-indigo-100 text-indigo-700'
                                                                    }`}>
                                                                    {stage.type}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs font-semibold text-gray-400 mt-0.5">
                                                                {new Date(stage.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                                {isToday && <span className="ml-2 text-blue-600 font-bold uppercase text-[10px]">Today</span>}
                                                            </div>
                                                        </div>

                                                        {/* Right Side Status */}
                                                        <div className="text-right">
                                                            {isCompleted ? (
                                                                <span className="text-xs font-bold text-emerald-600">Completed</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleMarkComplete(stage.id)}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold shadow-sm transition ${isToday
                                                                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                                                            : "bg-white border border-gray-200 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                                                        }`}
                                                                >
                                                                    Mark Done
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400/80 font-bold">
                                    Cycle details not found.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
