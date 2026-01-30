import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Clock,
    ChevronRight,
} from "lucide-react";
import PanchakarmaDetailsModal from "./PanchakarmaDetailsModal";

export default function DoctorPanchakarma() {
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    // Modal State
    const [selectedCycleId, setSelectedCycleId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchCycles = () => {
            fetch('/api/doctor/panchakarma')
                .then(res => res.json())
                .then(data => {
                    setCycles(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        };
        fetchCycles();
        // Poll every 30s
        const interval = setInterval(fetchCycles, 30000);
        return () => clearInterval(interval);
    }, []);

    // Filter cycles
    const filteredCycles = cycles.filter(c =>
        (c.patient_name && c.patient_name.toLowerCase().includes(q.toLowerCase())) ||
        (c.patient_id && String(c.patient_id).includes(q))
    );

    // Derived Stats
    const activeProtocols = cycles.length;

    const handleViewDetails = (cycleId) => {
        setSelectedCycleId(cycleId);
        setModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Title */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight">Panchakarma Management</h2>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search active patients..."
                            className="pl-11 pr-4 py-2.5 rounded-xl border border-gray-600 bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-500 w-64"
                        />
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-semibold text-sm">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">ACTIVE PROTOCOLS</div>
                    <div className="text-4xl font-black text-blue-600">{activeProtocols}</div>
                </div>
                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">COMPLETED TODAY</div>
                    <div className="text-4xl font-black text-emerald-600">0</div>
                </div>
                <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">UPCOMING SESSIONS</div>
                    <div className="text-4xl font-black text-orange-600">{activeProtocols}</div>
                </div>
            </div>

            {/* Queue List */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Patient Treatment Queue</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">LIVE UPDATES</div>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading cycles...</div>
                    ) : filteredCycles.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No active panchakarma cycles found.</div>
                    ) : (
                        filteredCycles.map(c => (
                            <TreatmentItem
                                key={c.id}
                                cycleId={c.id}
                                name={c.patient_name}
                                id={`P-${c.patient_id}`}
                                age={`${c.age}y ${c.gender ? c.gender[0] : ''}`}
                                treatment={c.name}
                                progress={c.progress || 10}
                                day={`STARTED: ${new Date(c.start_date || Date.now()).toLocaleDateString()}`}
                                time="Scheduled"
                                room="Center"
                                color="blue"
                                onViewDetails={handleViewDetails}
                            />
                        ))
                    )}
                </div>
            </div>

            <PanchakarmaDetailsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                cycleId={selectedCycleId}
            />
        </div>
    );
}

function TreatmentItem({ cycleId, name, id, age, treatment, progress, day, time, room, color, onViewDetails }) {
    return (
        <div className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition bg-gray-50/50">
            {/* Patient */}
            {/* Patient - Clickable */}
            <div
                className="flex items-center cursor-pointer hover:opacity-80 transition"
                onClick={() => onViewDetails(cycleId)}
                title="View Progress Details"
            >
                <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-4">
                    {name?.[0]}
                </div>
                <div className="w-48">
                    <div className="font-bold text-gray-900">{name}</div>
                    <div className="text-xs font-semibold text-gray-500">{id} • {age}</div>
                </div>
            </div>

            {/* Protocol */}
            <div className="flex-1 px-8">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase">
                    <span>{treatment}</span>
                    <span>{day}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Time & Room */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                    <Clock className="w-4 h-4" />
                    {time}
                </div>
                <div className="px-3 py-1 bg-gray-200 rounded-lg text-xs font-bold text-gray-600 uppercase">
                    {room}
                </div>
                <button
                    onClick={() => onViewDetails(cycleId)}
                    className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-600 transition"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

