import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Activity, Database, Info } from 'lucide-react';

const InternDiseaseSearch = () => {
    const [query, setQuery] = useState('');
    const [cases, setCases] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/intern/cases')
            .then(res => res.json())
            .then(data => {
                setCases(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length > 1) {
            const filtered = cases.filter(c =>
                c.diagnosis.toLowerCase().includes(val.toLowerCase()) ||
                c.complaints.toLowerCase().includes(val.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto py-10">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 rounded-full bg-indigo-50 text-indigo-600">
                        <Database className="w-8 h-8" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">DISEASE PROTOCOL SEARCH</h2>
                <p className="text-gray-500 mb-8">Access the complete anonymized clinical database. Search by diagnosis, symptoms, or therapy protocols.</p>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="E.g., Jwara, Arthritis, Virechana..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-gray-100 shadow-sm text-lg focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>
            </div>

            {/* Results Grid */}
            {query.length > 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.length > 0 ? (
                        results.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">{item.id}</span>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <h3 className="font-black text-gray-900 uppercase text-lg mb-2">{item.diagnosis}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.complaints}</p>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-gray-700 uppercase">{item.active_therapy}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-400 italic">
                            No records found matching "{query}"
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-4">
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 border-dashed min-h-[200px] flex flex-col items-center justify-center text-gray-400">
                            <Search className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-wider">TYPE TO FIND CONDITIONS</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-blue-600" />
                                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">SCOPE NOTICE</p>
                            </div>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Currently supporting core conditions (Fever, Ortho, Headache). Expanded database coming soon.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">DISEASE MANAGEMENT REPOSITORY</h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                Type a condition (e.g. Fever, Headache) or Ayurvedic term to see comparative case studies and protocols.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!loading && cases.length > 0 && query.length < 2 && (
                <div className="text-center text-xs text-gray-400 uppercase tracking-widest mt-10">
                    {cases.length} Clinical Records Indexed
                </div>
            )}
        </div>
    );
};

export default InternDiseaseSearch;
