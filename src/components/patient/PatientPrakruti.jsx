import React, { useState, useEffect } from "react";
import {
    ClipboardCheck,
    BarChart,
    ChevronRight,
    CheckCircle,
    RefreshCw,
    TrendingUp,
    Calendar,
    Activity,
    AlertCircle,
    Layout,
    Info,
    Sparkles
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

// 12-Question Quiz Data based on User Request
const QUESTIONS = [
    {
        id: 1,
        question: "Body Frame",
        options: [
            { label: "Thin, bony, small frame, difficult to gain weight", type: "Vata" },
            { label: "Medium, athletic, well-proportioned", type: "Pitta" },
            { label: "Large, broad, well-built, gains weight easily", type: "Kapha" }
        ]
    },
    {
        id: 2,
        question: "Skin Type",
        options: [
            { label: "Dry, rough, thin, cool", type: "Vata" },
            { label: "Warm, sensitive, prone to acne/rashes, reddish", type: "Pitta" },
            { label: "Thick, oily, smooth, cool, pale", type: "Kapha" }
        ]
    },
    {
        id: 3,
        question: "Appetite",
        options: [
            { label: "Irregular, variable, forgets to eat", type: "Vata" },
            { label: "Strong, sharp, cannot skip meals (hangry)", type: "Pitta" },
            { label: "Slow but steady, low hunger but likes eating", type: "Kapha" }
        ]
    },
    {
        id: 4,
        question: "Feeling after Eating",
        options: [
            { label: "Gas, bloating, heaviness", type: "Vata" },
            { label: "Burning sensation, acidity, heat", type: "Pitta" },
            { label: "Heavy, lethargic, sleepy", type: "Kapha" }
        ]
    },
    {
        id: 5,
        question: "Bowel Movements",
        options: [
            { label: "Hard, dry, irregular, constipation-prone", type: "Vata" },
            { label: "Soft, loose, frequent, urgent", type: "Pitta" },
            { label: "Regular, thick, heavy, slow", type: "Kapha" }
        ]
    },
    {
        id: 6,
        question: "Sleep Pattern",
        options: [
            { label: "Light, disturbed, short, difficulty falling asleep", type: "Vata" },
            { label: "Moderate, can be disturbed by heat or thoughts", type: "Pitta" },
            { label: "Deep, long, heavy, difficulty waking up", type: "Kapha" }
        ]
    },
    {
        id: 7,
        question: "Temperature Tolerance",
        options: [
            { label: "Feels cold easily, loves warmth", type: "Vata" },
            { label: "Feels hot easily, dislikes heat/sun", type: "Pitta" },
            { label: "Comfortable in most, dislikes damp/cold", type: "Kapha" }
        ]
    },
    {
        id: 8,
        question: "Sweating",
        options: [
            { label: "Very little, minimal scent", type: "Vata" },
            { label: "Profuse, strong odor, hot flashes", type: "Pitta" },
            { label: "Moderate, consistent with exertion", type: "Kapha" }
        ]
    },
    {
        id: 9,
        question: "Hair Type",
        options: [
            { label: "Dry, frizzy, thin, split ends", type: "Vata" },
            { label: "Fine, straight, early greying/balding", type: "Pitta" },
            { label: "Thick, oily, wavy, strong, lustrous", type: "Kapha" }
        ]
    },
    {
        id: 10,
        question: "Mental Nature",
        options: [
            { label: "Creative, restless, anxious, overthinking", type: "Vata" },
            { label: "Focused, ambitious, irritable, competitive", type: "Pitta" },
            { label: "Calm, patient, steady, loving, slow to anger", type: "Kapha" }
        ]
    },
    {
        id: 11,
        question: "Memory & Learning",
        options: [
            { label: "Quick to learn, quick to forget", type: "Vata" },
            { label: "Sharp, precise, good retention", type: "Pitta" },
            { label: "Slow to learn, excellent long-term memory", type: "Kapha" }
        ]
    },
    {
        id: 12,
        question: "Reaction to Stress",
        options: [
            { label: "Worry, fear, anxiety, nervousness", type: "Vata" },
            { label: "Anger, frustration, irritability, criticism", type: "Pitta" },
            { label: "Withdrawal, silence, emotional eating, lethargy", type: "Kapha" }
        ]
    }
];

export default function PatientPrakruti({ userId, onUpdate }) {
    const [activeTab, setActiveTab] = useState("assessment");
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [latestAnalysis, setLatestAnalysis] = useState(null);
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState([]);
    const [showLatestResult, setShowLatestResult] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchHistory();
        }
    }, [userId]);

    const fetchHistory = () => {
        fetch(`/api/patient/dosha-history/${userId}`)
            .then(res => res.json())
            .then(data => {
                setHistory(data);
                if (data.length > 0) {
                    const latest = data[data.length - 1];
                    const processedResult = {
                        scores: { vata: latest.vata, pitta: latest.pitta, kapha: latest.kapha },
                        type: latest.type,
                        date: latest.date
                    };
                    setResult(processedResult);
                    setLatestAnalysis(processedResult);
                }
            })
            .catch(err => console.error("History fetch error:", err));
    };

    const handleSelect = (qId, type) => {
        setAnswers(prev => ({ ...prev, [qId]: type }));
    };

    const calculateResult = () => {
        const scores = { Vata: 0, Pitta: 0, Kapha: 0 };
        Object.values(answers).forEach(type => {
            if (scores[type] !== undefined) scores[type]++;
        });

        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const [primaryDosha, primaryScore] = sorted[0];
        const [secondaryDosha, secondaryScore] = sorted[1];

        let prakrutiType = primaryDosha;
        if (secondaryScore >= primaryScore - 2 && secondaryScore > 2) {
            prakrutiType = `${primaryDosha}-${secondaryDosha}`;
        }

        const total = 12;
        const percentScores = {
            vata: Math.round((scores.Vata / total) * 100),
            pitta: Math.round((scores.Pitta / total) * 100),
            kapha: Math.round((scores.Kapha / total) * 100)
        };

        const newResult = { scores: percentScores, type: prakrutiType, rawScores: scores, date: new Date().toISOString() };
        setLatestAnalysis(newResult);
        setResult(newResult);
        setShowLatestResult(true);

        setSaving(true);
        if (userId) {
            fetch('/api/patient/prakruti', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    prakruti: prakrutiType,
                    doshaScores: percentScores
                })
            })
                .then(res => res.json())
                .then(d => {
                    setSaving(false);
                    fetchHistory();
                    if (onUpdate) onUpdate();
                })
                .catch(err => {
                    console.error("Failed to save:", err);
                    setSaving(false);
                });
        }
    };

    const handleViewTracking = () => {
        setShowLatestResult(false);
        setActiveTab("tracking");
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Nav Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                        {activeTab === "assessment" ? (showLatestResult ? "Analysis Result" : "Prakruti Analysis") : "Prakruti & Dosha Tracking"}
                    </h2>
                    <p className="text-gray-500 font-medium">
                        {activeTab === "assessment"
                            ? (showLatestResult ? "Your personalized Ayurvedic constitution profile." : "Discover your Ayurvedic body constitution.")
                            : "Understand your core constitution and monitor imbalances."}
                    </p>
                </div>
                <div className="flex bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200 shadow-sm self-start md:self-auto">
                    <button
                        onClick={() => { setActiveTab("assessment"); setShowLatestResult(false); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${activeTab === "assessment" && !showLatestResult
                            ? "bg-white text-emerald-700 shadow-md ring-1 ring-black/5"
                            : "text-gray-500 hover:text-gray-900"}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${activeTab === "assessment" && !showLatestResult ? "animate-spin-slow" : ""}`} /> Assessment
                    </button>
                    <button
                        onClick={() => { setActiveTab("tracking"); setShowLatestResult(false); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${activeTab === "tracking"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                            : "text-gray-500 hover:text-gray-900"}`}
                    >
                        <TrendingUp className="w-4 h-4" /> Dosha Tracking
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showLatestResult ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <AnalysisSummary result={latestAnalysis} onViewTracking={handleViewTracking} />
                    </motion.div>
                ) : activeTab === "tracking" ? (
                    <motion.div
                        key="tracking"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <DoshaTracking result={result} history={history} onRetake={() => { setActiveTab("assessment"); setShowLatestResult(false); }} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="assessment"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-8"
                    >
                        {/* Main Content */}
                        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-10 sticky top-0 bg-white z-10 py-4 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">Constitution Quiz</h3>
                                <div className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg shadow-gray-200">
                                    {Object.keys(answers).length} / {QUESTIONS.length}
                                </div>
                            </div>

                            <div className="space-y-12">
                                {QUESTIONS.map((q, idx) => (
                                    <div key={q.id} className="space-y-6 scroll-mt-24" id={`q-${q.id}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-800">{q.question}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-12">
                                            {q.options.map((opt) => (
                                                <button
                                                    key={opt.label}
                                                    onClick={() => handleSelect(q.id, opt.type)}
                                                    className={`p-5 rounded-2xl border text-left transition-all duration-200 relative group overflow-hidden ${answers[q.id] === opt.type
                                                        ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-1 ring-emerald-500"
                                                        : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                                                        }`}
                                                >
                                                    <span className={`text-sm font-bold block mb-6 transition-colors ${answers[q.id] === opt.type ? "text-emerald-900" : "text-gray-600 group-hover:text-gray-900"
                                                        }`}>
                                                        {opt.label}
                                                    </span>

                                                    <div className="absolute bottom-4 right-4">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${answers[q.id] === opt.type ? "border-emerald-600 bg-emerald-600" : "border-gray-300 group-hover:border-emerald-400"
                                                            }`}>
                                                            {answers[q.id] === opt.type && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 pt-8 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={calculateResult}
                                    disabled={Object.keys(answers).length < QUESTIONS.length}
                                    className="bg-emerald-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-black transition flex items-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Calculate Analysis <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Info Sidebar */}
                        <div className="lg:col-span-1 border border-dashed border-gray-200 rounded-[2.5rem] flex flex-col justify-center p-8 text-center bg-gray-50/50">
                            <div className="mb-8">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4 text-2xl">🧬</div>
                                <h4 className="font-bold text-gray-900 mb-2">Ayurvedic DNA</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Prakruti is your birth constitution. It remains constant throughout life and determines your physical/mental traits.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// COMPONENT: Analysis Summary View (New)
const AnalysisSummary = ({ result, onViewTracking }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Card */}
            <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/50 rounded-full text-xs font-black tracking-widest uppercase border border-emerald-700/50 shadow-inner">
                            <Sparkles className="w-4 h-4 text-emerald-400" /> Analysis Complete
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
                            Your type is <br />
                            <span className="text-emerald-400">{result.type}</span>
                        </h3>
                        <p className="text-emerald-100/70 max-w-xl text-lg font-medium leading-relaxed">
                            Based on your characteristics, your primary constitution is {result.type}. This unique blend of energies determines your physical traits, digestion, and temperament.
                        </p>
                    </div>

                    <div className="w-48 h-48 md:w-64 md:h-64 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-[80px] animate-pulse" />
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                            <circle
                                cx="50%" cy="50%" r="45%" fill="none"
                                stroke="#10b981" strokeWidth="12"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * result.scores[result.type.split('-')[0].toLowerCase()]) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-6xl font-black">{result.scores[result.type.split('-')[0].toLowerCase()]}%</span>
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-emerald-400">{result.type.split('-')[0]}</span>
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute -bottom-20 -right-20 opacity-10 pointer-events-none">
                    <Activity size={400} />
                </div>
            </div>

            {/* Dosha Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Vata', 'Pitta', 'Kapha'].map((dosha) => (
                    <div key={dosha} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-xs font-black tracking-widest text-gray-400 uppercase">{dosha}</div>
                            <div className={`text-2xl font-black ${dosha === 'Vata' ? 'text-emerald-600' : dosha === 'Pitta' ? 'text-orange-500' : 'text-blue-500'}`}>
                                {result.scores[dosha.toLowerCase()]}%
                            </div>
                        </div>
                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${result.scores[dosha.toLowerCase()]}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`h-full rounded-full ${dosha === 'Vata' ? 'bg-emerald-600' : dosha === 'Pitta' ? 'bg-orange-500' : 'bg-blue-500'}`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recommendations & Action */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                    <div className="h-16 w-16 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-600 flex-shrink-0">
                        <Info className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">View Your Tracking History</h4>
                        <p className="text-gray-500 max-w-lg font-medium">We've saved this analysis to your profile. You can monitor how your Doshas evolve over time in the tracking section.</p>
                    </div>
                </div>
                <button
                    onClick={onViewTracking}
                    className="w-full md:w-auto px-10 py-5 bg-gray-900 text-white rounded-[1.5rem] font-bold shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-3 group"
                >
                    Explore Dosha Tracking <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

// COMPONENT: Dosha Tracking Dashboard
const DoshaTracking = ({ result, history, onRetake }) => {

    const chartData = history.length > 0
        ? history.map(h => ({
            date: new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            Vata: h.vata,
            Pitta: h.pitta,
            Kapha: h.kapha
        }))
        : [];

    // If no history but we have a result, show the result as the single point
    if (chartData.length === 0 && result) {
        chartData.push({
            date: 'Today',
            Vata: result.scores.vata,
            Pitta: result.scores.pitta,
            Kapha: result.scores.kapha
        });
    }

    // Determine Trends or primary dosha
    const latestScores = result ? result.scores : (history.length > 0 ? { vata: history[history.length - 1].vata, pitta: history[history.length - 1].pitta, kapha: history[history.length - 1].kapha } : null);

    if (!latestScores) {
        return (
            <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tracking Data Yet</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Please complete your Prakruti Assessment first to start tracking your Dosha levels.</p>
                <button onClick={onRetake} className="bg-emerald-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition">
                    Start Assessment
                </button>
            </div>
        );
    }

    const dominantTrend = Object.entries(latestScores).sort((a, b) => b[1] - a[1])[0];
    const trendName = dominantTrend[0].charAt(0).toUpperCase() + dominantTrend[0].slice(1);

    return (
        <div className="animate-in fade-in duration-700 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <TrendingUp size={48} className="text-emerald-500" />
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">PRIMARY CONSTITUTION</div>
                    <h3 className="text-2xl font-black text-emerald-700 mb-1">{result?.type || history[history.length - 1].type}</h3>
                    <p className="text-xs text-gray-500 font-medium">Stable birth profile</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">AVERAGE PITTA</div>
                    <h3 className="text-3xl font-black text-orange-500 mb-1">{latestScores.pitta}%</h3>
                    <p className="text-xs text-gray-500 font-medium">Stable over last {history.length} assessments</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">LATEST KAPHA</div>
                    <h3 className="text-3xl font-black text-blue-500 mb-1">{latestScores.kapha}%</h3>
                    <p className="text-xs text-gray-500 font-medium">Recent measurement</p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Vikruti (Imbalance) Timeline</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Tracking how your Dosha levels change based on your assessments.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div> VATA
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div> PITTA
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div> KAPHA
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                                labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                            />
                            <Line type="monotone" dataKey="Vata" stroke="#10b981" strokeWidth={3} dot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Pitta" stroke="#f97316" strokeWidth={3} dot={{ r: 6, strokeWidth: 0, fill: '#f97316' }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Kapha" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Insight */}
            <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-2">AI Health Insight</h4>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-4xl">
                        Your {trendName} levels are currently {latestScores[trendName.toLowerCase()]}%. Maintain balance with
                        {trendName === 'Vata' ? ' warm, cooked meals and grounding activities.' :
                            trendName === 'Pitta' ? ' cooling foods and moderate exercise.' :
                                ' light, spicy foods and vigorous physical activity.'}
                    </p>
                </div>
            </div>
        </div>
    );
};
