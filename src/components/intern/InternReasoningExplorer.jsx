import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, Activity, Thermometer, Brain, Bone, GitCompare } from 'lucide-react';

const InternReasoningExplorer = () => {
    const [selectedCondition, setSelectedCondition] = useState('ALL');
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState(['ALL']);

    useEffect(() => {
        fetch('/api/intern/cases')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch cases');
                return res.json();
            })
            .then(data => {
                setCases(data);
                // Dynamically extract categories
                const uniqueDiagnoses = [...new Set(data.map(c => c.diagnosis ? c.diagnosis.split(' ')[0].toUpperCase() : 'OTHER'))];
                setCategories(['ALL', ...uniqueDiagnoses.slice(0, 5)]); // Limit to top 5 for UI
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Unable to load clinical data. Please try again later.");
                setLoading(false);
            });
    }, []);

    // Helper to determine the "Reasoning" based on data (Simulating the logic explanation)
    const deriveClinicalLogic = (c) => {
        if (!c.dosha_scores) return { type: 'neutral', text: 'Standard Protocol' };

        const { vata, pitta, kapha } = c.dosha_scores;
        // Simple heuristic for demonstration
        if (pitta > vata && pitta > kapha) return { type: 'pitta', text: 'Pittaja (Heat) Pattern identified -> Cooling therapy indicated' };
        if (vata > pitta && vata > kapha) return { type: 'vata', text: 'Vataja (Dry/Mobile) Pattern identified -> Nourishing/Oil therapy indicated' };
        if (kapha > vata && kapha > pitta) return { type: 'kapha', text: 'Kaphaja (Heaviness) Pattern identified -> Drying/Stimulating therapy indicated' };

        return { type: 'tridosha', text: 'Mixed Dosha Pattern -> Balanced therapy indicated' };
    };

    const filteredCases = selectedCondition === 'ALL'
        ? cases
        : cases.filter(c => (c.diagnosis ? c.diagnosis.toUpperCase().includes(selectedCondition) : false));

    return (
        <div className="space-y-6">
            {/* Header Section with Dynamic Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <GitCompare className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">CASE REASONING EXPLORER</h2>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Analyzing <strong>{cases.length}</strong> anonymized clinical records for decision patterns.
                    </p>
                </div>

                {/* Dynamic Filters */}
                <div className="flex flex-wrap gap-2 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCondition(cat)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedCondition === cat
                                ? 'bg-indigo-900 text-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading && (
                    <div className="col-span-2 text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Accessing Clinical Database...</p>
                    </div>
                )}

                {error && (
                    <div className="col-span-2 p-6 bg-red-50 rounded-2xl border border-red-100 text-center text-red-600 font-medium">
                        {error}
                    </div>
                )}

                {!loading && !error && filteredCases.length === 0 && (
                    <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400">No cases found matching this criteria.</p>
                    </div>
                )}

                {!loading && !error && filteredCases.map((caseData) => {
                    const logic = deriveClinicalLogic(caseData);

                    return (
                        <div
                            key={caseData.id}
                            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">{caseData.id}</span>
                                    <h3 className="text-xl font-black text-gray-900 mt-2">{caseData.diagnosis}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold text-gray-400">{caseData.gender}, Age {caseData.age}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="text-xs font-bold text-gray-400">{new Date(caseData.last_updated).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Reasoning Logic Chip - THE "LOGIC" PART */}
                            <div className={`mb-6 p-3 rounded-xl flex items-center gap-3 border ${logic.type === 'pitta' ? 'bg-red-50 border-red-100 text-red-800' :
                                    logic.type === 'vata' ? 'bg-blue-50 border-blue-100 text-blue-800' :
                                        logic.type === 'kapha' ? 'bg-green-50 border-green-100 text-green-800' :
                                            'bg-gray-50 border-gray-100 text-gray-800'
                                }`}>
                                <Brain className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-bold leading-tight">{logic.text}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">CLINICAL OBSERVATION</p>
                                    <p className="text-sm font-medium text-gray-800 line-clamp-2" title={caseData.complaints}>{caseData.complaints}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">DOSHA STATE</p>
                                    <div className="flex gap-1 text-xs font-bold">
                                        <div className="flex-1 text-center p-1 bg-blue-100 text-blue-700 rounded-md" title="Vata">{caseData.dosha_scores?.vata || '-'}<span className="text-[9px] opacity-60">V</span></div>
                                        <div className="flex-1 text-center p-1 bg-red-100 text-red-700 rounded-md" title="Pitta">{caseData.dosha_scores?.pitta || '-'}<span className="text-[9px] opacity-60">P</span></div>
                                        <div className="flex-1 text-center p-1 bg-amber-100 text-amber-900 rounded-md" title="Kapha">{caseData.dosha_scores?.kapha || '-'}<span className="text-[9px] opacity-60">K</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">PRESCRIBED PROTOCOL</p>
                                </div>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                    {caseData.active_therapy !== 'None' ? caseData.active_therapy : (caseData.prescription ? 'Conservative Medicine Management' : 'Observation')}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InternReasoningExplorer;
