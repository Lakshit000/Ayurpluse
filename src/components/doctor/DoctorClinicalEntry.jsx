import React, { useState, useEffect, useRef } from "react";
import {
    Search,
    Printer,
    Save,
    Plus,
    Trash2,
    CheckCircle,
    User,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorClinicalEntry({ doctorName, doctorId }) {
    // We utilize the passed doctorId or fallback to 1 for dev.

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [vitals, setVitals] = useState({ bp: "120/80", pulse: "72", weight: "70", temp: "98.4" });
    const [complaints, setComplaints] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [medicines, setMedicines] = useState([
        { name: "", dosage: "", timing: "After Food", duration: "", form: "" }
    ]);
    const [msg, setMsg] = useState("");

    // Medicine Search State
    const [suggestions, setSuggestions] = useState({}); // keyed by index
    const [activeSearchIndex, setActiveSearchIndex] = useState(null);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        fetch('/api/patients')
            .then(res => res.json())
            .then(data => setPatients(data))
            .catch(err => console.error(err));
    }, []);

    const addMedicine = () => {
        setMedicines([...medicines, { name: "", dosage: "", timing: "After Food", duration: "", form: "" }]);
    };

    const removeMedicine = (index) => {
        setMedicines(medicines.filter((_, i) => i !== index));
        // clean suggestions
        const newSuggestions = { ...suggestions };
        delete newSuggestions[index];
        setSuggestions(newSuggestions);
    };

    const updateMedicine = (index, field, value) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;
        setMedicines(newMeds);

        if (field === 'name') {
            setActiveSearchIndex(index);
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);


            if (value.length > 2) {
                searchTimeoutRef.current = setTimeout(() => {
                    fetch(`/api/medicines/search?q=${value}`)
                        .then(res => {
                            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                            const contentType = res.headers.get("content-type");
                            if (!contentType || contentType.indexOf("application/json") === -1) {
                                throw new Error("Received non-JSON response from server");
                            }
                            return res.json();
                        })
                        .then(data => {
                            console.log("Medicine Search Results:", data);
                            setSuggestions(prev => ({ ...prev, [index]: data }));
                        })
                        .catch(err => {
                            console.error("Medicine Search Error:", err);
                            setSuggestions(prev => ({ ...prev, [index]: [] }));
                        });
                }, 300);
            } else {
                setSuggestions(prev => ({ ...prev, [index]: [] }));
            }
        }
    };

    const selectMedicine = (index, med) => {
        const newMeds = [...medicines];
        newMeds[index].name = med.medicine_name;
        newMeds[index].dosage = med.dosage || "";
        newMeds[index].form = med.form || "";
        // Reset suggestions
        setSuggestions(prev => ({ ...prev, [index]: [] }));
        setActiveSearchIndex(null);
        setMedicines(newMeds);
    };

    const handleSave = async () => {
        if (!selectedPatient) {
            setMsg("Please select a patient first.");
            return;
        }

        setMsg("Saving...");
        try {
            const res = await fetch('/api/clinical-records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: selectedPatient,
                    doctor_id: doctorId || 1, // Use prop or fallback
                    date: new Date().toISOString(),
                    vitals,
                    complaints,
                    diagnosis,
                    prescription: medicines
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMsg("Record Saved Successfully!");
                setTimeout(() => setMsg(""), 3000);
            } else {
                setMsg("Error: " + (data.message || data.error));
            }
        } catch (e) {
            setMsg("Connection failed.");
        }
    };

    return (
        <div className="flex gap-6 min-h-[calc(100vh-140px)]">
            {/* Sidebar */}
            <div className="w-80 flex flex-col gap-6">
                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm text-center">
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">
                        PATIENT SNAPSHOT
                    </div>
                    {/* Patient Selector */}
                    <div className="relative">
                        <select
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition outline-none appearance-none text-center cursor-pointer"
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                        >
                            <option value="">Select Patient</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-emerald-700 pointer-events-none" />
                    </div>
                </div>

                {/* Clinical Templates Removed */}
            </div>

            {/* Main Form */}
            <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col">
                <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight">New Clinical Session</h2>
                    <div className="flex items-center gap-3">
                        {msg && <span className="text-sm font-bold text-emerald-600 mr-2">{msg}</span>}
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wide hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
                        >
                            <Save className="w-4 h-4" />
                            Save Record
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-220px)]">
                    {/* Vitals */}
                    <div>
                        <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">CURRENT VITALS</div>
                        <div className="grid grid-cols-4 gap-6">
                            {[
                                { label: 'BP', key: 'bp', unit: 'MMHG' },
                                { label: 'PULSE', key: 'pulse', unit: 'BPM' },
                                { label: 'WEIGHT', key: 'weight', unit: 'KG' },
                                { label: 'TEMP', key: 'temp', unit: '°F' }
                            ].map(vital => (
                                <div key={vital.key} className="relative">
                                    <label className="text-xs font-bold text-gray-400 absolute top-2 left-3">{vital.label}</label>
                                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 pt-5 pb-1 px-3">
                                        <input
                                            value={vitals[vital.key]}
                                            onChange={e => setVitals({ ...vitals, [vital.key]: e.target.value })}
                                            className="bg-transparent w-full outline-none font-bold text-gray-900"
                                        />
                                        <span className="text-xs font-bold text-gray-400">{vital.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Complaints & Findings */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Chief Complaints</div>
                            <textarea
                                value={complaints}
                                onChange={e => setComplaints(e.target.value)}
                                placeholder="Enter patient symptoms..."
                                className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm font-medium"
                            />
                        </div>
                        <div>
                            <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Diagnosis</div>
                            <textarea
                                value={diagnosis}
                                onChange={e => setDiagnosis(e.target.value)}
                                placeholder="Nidana, Samprapti notes..."
                                className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Prescription */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">MEDICAL PRESCRIPTION</div>
                            <button onClick={addMedicine} className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">
                                <Plus className="w-3 h-3" /> ADD MEDICINE
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-xl border border-gray-200">
                            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-100/50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                                <div className="col-span-4">Medicine</div>
                                <div className="col-span-3">Dosage</div>
                                <div className="col-span-2">Timing</div>
                                <div className="col-span-2">Duration</div>
                                <div className="col-span-1 text-center">Action</div>
                            </div>
                            <AnimatePresence>
                                {medicines.map((med, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-12 gap-4 p-3 items-center border-b border-gray-100 last:border-0 relative"
                                    >
                                        <div className="col-span-4 relative">
                                            <input
                                                value={med.name}
                                                onChange={e => updateMedicine(i, 'name', e.target.value)}
                                                placeholder="Medicine Name"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500"
                                            />
                                            {/* Suggestions Dropdown */}
                                            {activeSearchIndex === i && suggestions[i] && suggestions[i].length > 0 && (
                                                <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl rounded-lg z-50 mt-1 max-h-48 overflow-y-auto">
                                                    {suggestions[i].map(s => (
                                                        <div
                                                            key={s.id}
                                                            onClick={() => selectMedicine(i, s)}
                                                            className="px-3 py-2 hover:bg-emerald-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                                                        >
                                                            <div className="font-bold text-gray-800">{s.medicine_name}</div>
                                                            <div className="text-xs text-gray-400">{s.form} • {s.dosage}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                value={med.dosage}
                                                onChange={e => updateMedicine(i, 'dosage', e.target.value)}
                                                placeholder="1 tsp"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <select
                                                value={med.timing}
                                                onChange={e => updateMedicine(i, 'timing', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500"
                                            >
                                                <option>After Food</option>
                                                <option>Before Food</option>
                                                <option>Empty Stomach</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                value={med.duration}
                                                onChange={e => updateMedicine(i, 'duration', e.target.value)}
                                                placeholder="Duration"
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button onClick={() => removeMedicine(i)} className="text-gray-400 hover:text-red-500 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
