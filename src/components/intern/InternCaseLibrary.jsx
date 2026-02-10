import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, ChevronRight, Loader } from 'lucide-react';

const InternCaseLibrary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCase, setSelectedCase] = useState(null);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/intern/cases')
            .then(res => res.json())
            .then(data => {
                setCases(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load cases:", err);
                setLoading(false);
            });
    }, []);

    const filteredCases = cases.filter(c =>
        c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complaints.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">ANONYMIZED CASE LIBRARY</h2>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by diagnosis or symptoms..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900 text-white border-none text-sm focus:ring-2 focus:ring-gray-700 transition-all font-medium placeholder:text-gray-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                {/* Case List */}
                <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        filteredCases.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedCase(item)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between
                        ${selectedCase?.id === item.id
                                        ? 'bg-indigo-900 border-indigo-900 shadow-md transform scale-[1.02]'
                                        : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-md'}`}
                            >
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${selectedCase?.id === item.id ? 'text-indigo-300' : 'text-gray-400'}`}>
                                        ID: {item.id}
                                    </p>
                                    <h3 className={`font-black text-sm uppercase ${selectedCase?.id === item.id ? 'text-white' : 'text-gray-900'}`}>
                                        {item.diagnosis}
                                    </h3>
                                    <p className={`text-xs mt-1 truncate max-w-[150px] ${selectedCase?.id === item.id ? 'text-indigo-200' : 'text-gray-500'}`}>
                                        {item.complaints}
                                    </p>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-transform ${selectedCase?.id === item.id ? 'text-white translate-x-1' : 'text-gray-300 group-hover:text-indigo-400'}`} />
                            </div>
                        ))
                    )}
                </div>

                {/* Details Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col p-8 dashed-border overflow-y-auto">
                        {selectedCase ? (
                            <div className="space-y-6 text-left">
                                <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
                                            {selectedCase.id}
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
                                            {selectedCase.diagnosis}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>Age: {selectedCase.age}</span>
                                            <span>•</span>
                                            <span>Gender: {selectedCase.gender}</span>
                                            <span>•</span>
                                            <span>Prakruti: {selectedCase.prakruti}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-center min-w-[100px]">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">UPDATED</div>
                                        <div className="font-bold text-gray-900">{selectedCase.last_updated && selectedCase.last_updated.split('T')[0]}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
                                        <h4 className="font-bold text-orange-900 text-sm uppercase tracking-wide mb-3">Complaints</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">{selectedCase.complaints}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100">
                                        <h4 className="font-bold text-teal-900 text-sm uppercase tracking-wide mb-3">Active Therapy</h4>
                                        <p className="text-gray-700 text-sm font-medium">{selectedCase.active_therapy}</p>
                                        {selectedCase.treatment_day && (
                                            <div className="mt-2 text-xs text-teal-600">
                                                Day {selectedCase.treatment_day} of protocol
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Prescription & Clinical Notes</h4>
                                    <p className="text-gray-600 text-sm leading-loose whitespace-pre-wrap">
                                        {selectedCase.prescription || "No prescription details available for this record."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 opacity-20 text-gray-900 mb-6">
                                    <BookOpen className="w-full h-full" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-400 mb-2">Select a clinical case to begin analysis.</h3>
                                <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
                                    Real-time anonymized data fetched from the clinical database.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternCaseLibrary;
