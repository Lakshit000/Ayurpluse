import React, { useState, useEffect } from "react";
import {
    FileText,
    Download,
    Eye,
    Search,
    ChevronRight,
    Activity,
    Pill,
    Thermometer,
    Heart,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientHealth({ userId }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        // Fetch clinical records
        setLoading(true);
        fetch(`/api/clinical-records/${userId}`)
            .then(res => res.json())
            .then(data => {
                setRecords(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [userId]);

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
            {/* Header Area */}
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">My Health Records</h2>
                    <p className="text-gray-500 font-medium">Digital EMR history and clinical documentation</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find records..."
                            className="bg-white border border-gray-100 rounded-xl pl-11 pr-4 py-2.5 text-sm w-64 outline-none focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Records Timeline - Full Width */}
            <motion.div variants={item} className="space-y-6">
                {loading ? (
                    <div className="text-center py-10 font-bold text-gray-400">Loading records...</div>
                ) : records.length === 0 ? (
                    <div className="text-center py-10 font-bold text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                        No clinical records found.
                    </div>
                ) : (
                    records.map(record => (
                        <RecordItem
                            key={record.id}
                            record={record}
                        />
                    ))
                )}
            </motion.div>
        </motion.div>
    );
}

function RecordItem({ record }) {
    const [expanded, setExpanded] = useState(false);
    const date = new Date(record.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    const vitals = record.vitals || {};
    const prescriptions = record.prescription || [];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-[2rem] border-2 ${expanded ? 'border-emerald-200 shadow-lg' : 'border-gray-200 shadow-md hover:border-emerald-100'} transition-colors duration-300 overflow-hidden`}
        >
            <motion.div layout="position" className="p-8 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-8">
                    <div className="text-center w-28">
                        <div className="text-xs font-black text-gray-500 tracking-tight uppercase">{date.split(',')[0]}</div>
                        <div className="text-2xl font-black text-gray-900 mt-1">{date.split(',')[1]}</div>
                    </div>
                    <div className="h-12 w-px bg-gray-200" />
                    <div>
                        <h4 className="text-xl font-black text-gray-900">{record.diagnosis || "General Consultation"}</h4>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg tracking-wider uppercase">Clinical Entry</span>
                            <span className="text-sm font-bold text-gray-500">Dr. ID #{record.doctor_id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${expanded ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}
                    >
                        {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </motion.button>
                </div>
            </motion.div>

            {/* Expanded Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-8 pb-8">
                            <div className="border-t-2 border-gray-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Vitals Section */}
                                <div className="bg-emerald-50 rounded-2xl p-8 border-2 border-emerald-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Activity className="w-6 h-6 text-emerald-600" />
                                        <h5 className="font-black text-gray-900 text-base uppercase tracking-wide">Recorded Vitals</h5>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                                            <div className="text-xs text-gray-500 font-black uppercase mb-1">Blood Pressure</div>
                                            <div className="text-emerald-900 font-black text-xl">{vitals.bp || '--'} <span className="text-xs text-gray-500 font-bold">mmHg</span></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                                            <div className="text-xs text-gray-500 font-black uppercase mb-1">Pulse Rate</div>
                                            <div className="text-emerald-900 font-black text-xl">{vitals.pulse || '--'} <span className="text-xs text-gray-500 font-bold">bpm</span></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                                            <div className="text-xs text-gray-500 font-black uppercase mb-1">Temperature</div>
                                            <div className="text-emerald-900 font-black text-xl">{vitals.temp || '--'} <span className="text-xs text-gray-500 font-bold">°F</span></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                                            <div className="text-xs text-gray-500 font-black uppercase mb-1">Weight</div>
                                            <div className="text-emerald-900 font-black text-xl">{vitals.weight || '--'} <span className="text-xs text-gray-500 font-bold">kg</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Prescription Section */}
                                <div className="bg-orange-50 rounded-2xl p-8 border-2 border-orange-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Pill className="w-6 h-6 text-orange-600" />
                                        <h5 className="font-black text-gray-900 text-base uppercase tracking-wide">Prescriptions</h5>
                                    </div>
                                    {prescriptions.length > 0 ? (
                                        <div className="space-y-3">
                                            {prescriptions.map((med, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm flex justify-between items-center">
                                                    <div>
                                                        <div className="font-black text-gray-900 text-base">{med.name}</div>
                                                        <div className="text-sm text-gray-600 font-bold mt-1">{med.frequency} • {med.duration} days</div>
                                                    </div>
                                                    <div className="bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm font-black">
                                                        {med.dosage}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 text-sm font-bold italic">No medications prescribed.</div>
                                    )}
                                </div>
                            </div>
                            {/* Complaints */}
                            <div className="mt-8 bg-blue-50 rounded-2xl p-6 border-2 border-blue-100">
                                <h5 className="font-black text-gray-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Chief Complaints
                                </h5>
                                <p className="text-gray-800 text-base leading-relaxed font-medium">
                                    {record.complaints || "No specific complaints recorded."}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
