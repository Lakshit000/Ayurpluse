import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

const InternAuth = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            onSuccess({
                role: 'intern',
                name: 'Intern Sameer',
                id: 'INT-2024-001'
            });
        }, 1000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    <BookOpen className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Intern Access</h2>
                <p className="text-gray-500 mt-2">Enter the academic portal to view anonymized case studies.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Code</label>
                    <input
                        type="password"
                        defaultValue="AYUR-EDU-2024"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Enter access code"
                    />
                    <p className="text-xs text-gray-400 mt-2">Use default code for demo: AYUR-EDU-2024</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-800 transform hover:scale-[1.02] transition-all shadow-xl shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Enter Learning Portal <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default InternAuth;
