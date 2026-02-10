import React from "react";
import {
    LineChart,
    Brain,
    ShieldCheck,
    TrendingUp,
    Zap,
    ChevronRight,
    Sparkles
} from "lucide-react";

export default function PatientPredictive({ userId }) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [generating, setGenerating] = React.useState(false);
    const [showPlanModal, setShowPlanModal] = React.useState(false);
    const [generatedPlan, setGeneratedPlan] = React.useState(null);

    React.useEffect(() => {
        if (!userId) return;
        setLoading(true);
        fetch(`/api/patient/predictive/${userId}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [userId]);

    const handleCreatePlan = () => {
        setGenerating(true);
        fetch('/api/patient/predictive/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        })
            .then(res => res.json())
            .then(data => {
                setGeneratedPlan(data.plan);
                setShowPlanModal(true);
                setGenerating(false);
            })
            .catch(err => {
                console.error(err);
                setGenerating(false);
                alert("Failed to generate plan. Please try again.");
            });
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading wellness forecast...</div>;
    if (!data) return <div className="p-10 text-center text-gray-400">Unable to load predictive data.</div>;

    const insights = data.insights || [];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Predictive Wellness</h2>
                    <p className="text-gray-500 font-medium">AI-simulated wellness forecasting based on your <b>{data.prakruti}</b> profile</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-emerald-100 uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 fill-current" /> Future View
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Prediction Chart Placeholder */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm min-h-[450px] relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-bold text-gray-900">30-Day Wellness Forecast</h3>
                        <div className="flex items-center gap-4">
                            <Legend label="Vitality" color="bg-emerald-500" />
                            <Legend label="Metabolism" color="bg-blue-500" />
                        </div>
                    </div>

                    <div className="flex-1 border-b border-l border-gray-100 relative mt-4">
                        {/* Simulated Chart Paths */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                            <path
                                d={`M0,${200 - data.forecast[0].vitality * 2} Q${200},${200 - data.forecast[1].vitality * 2} ${400},${200 - data.forecast[2].vitality * 2} T${800},${200 - data.forecast[3].vitality * 2}`}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="animate-draw-path"
                            />
                            <path
                                d={`M0,${200 - data.forecast[0].metabolism * 2} Q${200},${200 - data.forecast[1].metabolism * 2} ${400},${200 - data.forecast[2].metabolism * 2} T${800},${200 - data.forecast[3].metabolism * 2}`}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="animate-draw-path"
                            />
                        </svg>

                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-gray-400" />)}
                        </div>
                    </div>

                    <div className="flex justify-between mt-6 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        <span>Today</span>
                        <span>Week 1</span>
                        <span>Week 2</span>
                        <span>Week 3</span>
                        <span>Week 4</span>
                    </div>
                </div>

                {/* Insights Column */}
                <div className="space-y-6">
                    {insights.map((insight, i) => (
                        <InsightCard
                            key={i}
                            title={insight.title}
                            value={insight.value}
                            desc={insight.desc}
                            status={insight.status}
                        />
                    ))}
                    {insights.length === 0 && (
                        <div className="text-gray-400 text-sm">No specific insights for now.</div>
                    )}
                </div>
            </div>

            <div className="p-8 bg-emerald-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-emerald-100 relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2">Generate Personal AI Regimen</h4>
                    <p className="text-emerald-100/70 text-sm max-w-lg">Based on these predictions, our AI can generate a tailored diet and lifestyle plan to prevent upcoming imbalances.</p>
                </div>
                <button
                    onClick={handleCreatePlan}
                    disabled={generating}
                    className="relative z-10 bg-white text-emerald-900 px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-50 transition shadow-lg disabled:opacity-75 disabled:cursor-wait"
                >
                    {generating ? (
                        <>
                            <Sparkles className="w-4 h-4 animate-spin" /> ANALYZING...
                        </>
                    ) : (
                        <>
                            CREATE PLAN <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </button>
                <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 blur-2xl w-64 h-64 bg-white rounded-full" />
            </div>

            {/* AI Plan Modal */}
            {showPlanModal && generatedPlan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="p-8 bg-emerald-900 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Your Personalized Regimen</h2>
                                <p className="text-emerald-200 font-medium text-sm">Tailored for your {data.prakruti} constitution</p>
                            </div>
                            <button onClick={() => setShowPlanModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition bg-white/10 p-2 rounded-full backdrop-blur-md z-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                            <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 opacity-20 blur-3xl w-64 h-64 bg-emerald-400 rounded-full" />
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Diet Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" /><path d="M9 22H6a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2z" /><path d="M18 22h-3a3 3 0 0 1-3-3V4a2 2 0 1 1 4 0v15a3 3 0 0 1 2 3z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Dietary Guidelines</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Foods to Eat</h4>
                                        <ul className="space-y-2">
                                            {generatedPlan.diet.focus.map((item, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-red-500 uppercase tracking-widest">Foods to Avoid</h4>
                                        <ul className="space-y-2">
                                            {generatedPlan.diet.avoid.map((item, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-400" /> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-4">
                                    <div className="text-yellow-600 font-black text-xs uppercase tracking-widest mt-1">SUPERFOODS</div>
                                    <div className="text-sm font-bold text-gray-800">
                                        {generatedPlan.diet.superfoods.join(", ")}
                                    </div>
                                </div>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Lifestyle Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Lifestyle Routine</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Morning</div>
                                        <div className="flex-1 text-sm font-semibold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            {generatedPlan.lifestyle.morning}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-20 text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Exercise</div>
                                        <div className="flex-1 text-sm font-semibold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            {generatedPlan.lifestyle.exercise}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-20 text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">Bedtime</div>
                                        <div className="flex-1 text-sm font-semibold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            {generatedPlan.lifestyle.bedtime}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Legend({ label, color }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{label}</span>
        </div>
    );
}

function InsightCard({ title, value, desc, status }) {
    const isWarning = status === 'warning';
    return (
        <div className={`p-8 rounded-[2rem] border shadow-sm ${isWarning ? "bg-orange-50/50 border-orange-100/50" : "bg-emerald-50/50 border-emerald-100/50"
            }`}>
            <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4">{title}</div>
            <h5 className={`text-lg font-bold mb-3 ${isWarning ? "text-orange-900" : "text-emerald-900"}`}>{value}</h5>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}
