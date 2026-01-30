import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    Search,
    Download,
    Plus,
    MoreVertical,
    Filter,
    Eye,
    History as HistoryIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PatientDetailsModal from "./PatientDetailsModal"; // Import the modal

export default function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeRow, setActiveRow] = useState(null);

    // Modal State
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [detailsTab, setDetailsTab] = useState('overview');

    // Close actions menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.actions-menu-container')) {
                setActiveRow(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        fetch('/api/patients')
            .then(res => res.json())
            .then(data => {
                setPatients(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredPatients = useMemo(() => {
        const query = q.toLowerCase().trim();
        if (!query) return patients;

        return patients.filter((p) => {
            return (
                p.name.toLowerCase().includes(query) ||
                (p.id && String(p.id).toLowerCase().includes(query)) ||
                (p.phone && p.phone.toLowerCase().includes(query)) ||
                (p.diagnosis && p.diagnosis.toLowerCase().includes(query))
            );
        });
    }, [q, patients]);

    const perPage = 4;
    const totalPages = Math.max(1, Math.ceil(filteredPatients.length / perPage));
    const paged = filteredPatients.slice((page - 1) * perPage, page * perPage);

    const handleAction = (action, patient) => {
        setActiveRow(null); // Close dropdown
        setSelectedPatient(patient);

        if (action === 'View Details') {
            setDetailsTab('overview');
            setDetailsModalOpen(true);
        } else if (action === 'View History') {
            setDetailsTab('history');
            setDetailsModalOpen(true);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading patients...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Title */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">
                    PATIENTS
                </h2>
            </div>

            {/* Actions */}
            <div className="mt-6 bg-white rounded-3xl border border-gray-200 shadow-sm">
                <div className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search by name, ID or contact..."
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Filters Button Removed */}
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                        <button className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 font-semibold text-sm">
                            <Download className="w-4 h-4" />
                            Export
                        </button>

                        {/* New Patient Button Removed */}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto" style={{ minHeight: '400px' }}>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-t border-b border-gray-200">
                            <tr className="text-xs font-black tracking-widest text-gray-500 uppercase">
                                <th className="px-6 py-4">Patient Details</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Gender / Age</th>
                                <th className="px-6 py-4">Primary Diagnosis</th>
                                <th className="px-6 py-4">Last Visit</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="options-body">
                            <AnimatePresence mode="wait">
                                {paged.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-500 font-bold">No patients found.</td>
                                    </tr>
                                ) : (
                                    paged.map((p, i) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2, delay: i * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-default"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                                                        {p.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">
                                                            {p.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-semibold">
                                                            {p.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                                                #{p.id}
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="inline-flex items-center gap-2">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-black ${p.gender === "M" || p.gender === "Male"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-pink-100 text-pink-700"
                                                            }`}
                                                    >
                                                        {p.gender ? (p.gender === 'Male' ? 'M' : (p.gender === 'Female' ? 'F' : p.gender)) : 'O'}
                                                    </span>
                                                    <span className="text-sm text-gray-600 font-semibold">
                                                        {p.age !== 'N/A' ? p.age + 'y' : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                                                {p.diagnosis || "-"}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-gray-500 font-semibold">
                                                {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "-"}
                                            </td>

                                            <td className="px-6 py-5 text-right relative actions-menu-container">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveRow(activeRow === p.id ? null : p.id);
                                                    }}
                                                    className={`inline-flex items-center justify-center h-10 w-10 rounded-2xl hover:bg-gray-100 transition ${activeRow === p.id ? 'bg-gray-100' : ''}`}
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-500" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeRow === p.id && (
                                                    <div className="absolute right-8 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in zoom-in-95 origin-top-right">
                                                        <button
                                                            onClick={() => handleAction('View Details', p)}
                                                            className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                                        >
                                                            <Eye className="w-4 h-4 text-gray-400" />
                                                            View Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('View History', p)}
                                                            className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-50"
                                                        >
                                                            <HistoryIcon className="w-4 h-4 text-gray-400" />
                                                            Patient History
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 flex items-center justify-between">
                    <div className="text-sm text-gray-500 font-semibold">
                        Showing {paged.length} of {filteredPatients.length} patients
                    </div>
                    {/* ... existing footer pagination ... */}

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const p = i + 1;
                            const active = page === p;

                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`h-10 w-10 rounded-xl border text-sm font-bold transition ${active
                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Patient Details Modal */}
            <PatientDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                patient={selectedPatient}
                initialTab={detailsTab}
            />
        </div>
    );
}
