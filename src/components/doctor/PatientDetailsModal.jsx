import React, { useEffect, useState } from 'react';
import { X, Calendar, Activity, FileText, User, MapPin, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientDetailsModal({ isOpen, onClose, patient, initialTab = 'overview' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (isOpen && patient?.id) {
            setActiveTab(initialTab);
            fetchRecords();
            fetchAppointments();
        }
    }, [isOpen, patient, initialTab]);

    const fetchRecords = async () => {
        setLoadingRecords(true);
        try {
            const res = await fetch(`/api/clinical-records/${patient.id}`);
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (error) {
            console.error("Failed to fetch records", error);
        } finally {
            setLoadingRecords(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`/api/patient/appointments/${patient.id}`);
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        }
    };

    if (!isOpen || !patient) return null;

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
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl font-black text-emerald-700">
                                    {patient.name?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800">{patient.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold mt-1">
                                        <span className="bg-white px-2 py-0.5 rounded border border-gray-200">#{patient.id}</span>
                                        <span>•</span>
                                        <span>{patient.gender === 'M' || patient.gender === 'Male' ? 'Male' : 'Female'}</span>
                                        <span>•</span>
                                        <span>{patient.age ? `${patient.age} years` : 'Age N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview'
                                    ? 'border-emerald-500 text-emerald-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history'
                                    ? 'border-emerald-500 text-emerald-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Patient History
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Contact Info */}
                                    <section>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 font-semibold">Phone</div>
                                                    <div className="text-sm font-bold text-gray-700">{patient.phone || 'N/A'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-blue-600">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 font-semibold">Email</div>
                                                    <div className="text-sm font-bold text-gray-700 truncate" title={patient.email}>
                                                        {patient.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Health Snapshot */}
                                    <section>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Health Snapshot</h3>
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                                            <div className="flex items-start gap-4">
                                                <Activity className="w-5 h-5 text-emerald-600 mt-1" />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-emerald-900">Latest Vitals</h4>
                                                    {records.length > 0 && records[0].vitals ? (
                                                        <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                                                            <div><span className="text-emerald-700/70">BP:</span> <span className="font-semibold text-emerald-800">{records[0].vitals.bp || '-'}</span></div>
                                                            <div><span className="text-emerald-700/70">Pulse:</span> <span className="font-semibold text-emerald-800">{records[0].vitals.pulse || '-'}</span></div>
                                                            <div><span className="text-emerald-700/70">Weight:</span> <span className="font-semibold text-emerald-800">{records[0].vitals.weight || '-'}</span></div>
                                                            <div><span className="text-emerald-700/70">Temp:</span> <span className="font-semibold text-emerald-800">{records[0].vitals.temp || '-'}</span></div>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-sm text-emerald-600/80">No recent vitals recorded.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-8">
                                    {/* Clinical Records Timeline */}
                                    <section>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Clinical History</h3>
                                        {loadingRecords ? (
                                            <div className="text-center py-8 text-gray-400">Loading history...</div>
                                        ) : records.length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-gray-500 font-medium">No clinical records found.</p>
                                            </div>
                                        ) : (
                                            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                                                {records.map((record, i) => (
                                                    <div key={record.id} className="relative pl-8">
                                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-4 border-emerald-500 shadow-sm" />

                                                        {/* Date Header */}
                                                        <div className="text-sm font-bold text-gray-400 mb-2">
                                                            {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </div>

                                                        {/* Card */}
                                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div>
                                                                    <div className="font-bold text-gray-800 text-lg">{record.diagnosis || "General Consultation"}</div>
                                                                    <div className="text-xs text-gray-500 font-semibold">Dr. {record.doctor_name || "Unknown"}</div>
                                                                </div>
                                                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                                                                    Visit
                                                                </span>
                                                            </div>

                                                            {/* Complaints */}
                                                            {record.complaints && (
                                                                <div className="mb-3">
                                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Complaints</div>
                                                                    <p className="text-sm text-gray-600 leading-relaxed">{record.complaints}</p>
                                                                </div>
                                                            )}

                                                            {/* Prescription Preview */}
                                                            {record.prescription && record.prescription.length > 0 && (
                                                                <div className="mt-4 pt-3 border-t border-gray-50">
                                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                                                        <FileText className="w-3 h-3" />
                                                                        Prescription
                                                                    </div>
                                                                    <ul className="space-y-1">
                                                                        {record.prescription.slice(0, 3).map((med, idx) => (
                                                                            <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                                                {med.medicine} <span className="text-gray-400 text-xs">({med.dosage})</span>
                                                                            </li>
                                                                        ))}
                                                                        {record.prescription.length > 3 && (
                                                                            <li className="text-xs text-emerald-600 font-semibold pl-3.5">
                                                                                +{record.prescription.length - 3} more medicines
                                                                            </li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Add these to tailwind config or global css if not present:
// .no-scrollbar::-webkit-scrollbar { display: none; }
