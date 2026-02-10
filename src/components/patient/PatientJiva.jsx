import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
    Camera,
    History,
    Zap,
    AlertCircle,
    CheckCircle,
    Loader2,
    RotateCcw,
    ChevronRight
} from "lucide-react";

export default function PatientJiva() {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
        setResult(null);
        setError(null);
    };

    const analyzeImage = async () => {
        setAnalyzing(true);
        setError(null);
        try {
            const response = await fetch('/api/analyze-tongue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imgSrc })
            });
            const data = await response.json();

            if (response.ok) {
                if (data.capture_status === "Retry Required") {
                    setError("Image quality insufficient. Please try again with better lighting.");
                } else {
                    setResult(data);
                }
            } else {
                setError(data.message || "Analysis failed due to server error");
            }
        } catch (err) {
            setError("Network error. Please ensure backend is running.");
        }
        setAnalyzing(false);
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Jivha Pariksha</h2>
                    <p className="text-gray-500 font-medium">AI-powered Tongue Analysis for metabolic health</p>
                </div>
                {result && (
                    <button onClick={retake} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition uppercase">
                        <RotateCcw className="w-4 h-4" /> Start Over
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Scanning/Result UI */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">

                    {!imgSrc ? (
                        /* CAMERA VIEW */
                        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                            <div className="aspect-[3/4] w-full bg-gray-900 rounded-[2rem] border-8 border-gray-800 shadow-2xl relative overflow-hidden group mb-8">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "user" }}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {/* Overlay Guide */}
                                <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-[1.5rem] pointer-events-none m-4"></div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-48 h-64 border-2 border-dashed border-white/50 rounded-full opacity-50"></div>
                                </div>
                            </div>

                            <button
                                onClick={capture}
                                className="h-16 px-10 rounded-full bg-emerald-600 text-white font-bold flex items-center gap-3 shadow-xl hover:bg-emerald-700 hover:scale-105 transition-all transform"
                            >
                                <Camera className="w-6 h-6" /> CAPTURE PHOTO
                            </button>
                            <p className="mt-4 text-xs text-center text-gray-400 font-medium">Align your tongue within the oval guide</p>
                        </div>
                    ) : (
                        /* PREVIEW & ANALYSIS VIEW */
                        <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
                            {analyzing ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-emerald-100 animate-pulse"></div>
                                        <div className="absolute inset-0 border-t-4 border-emerald-600 rounded-full animate-spin"></div>
                                        <Zap className="absolute inset-0 m-auto text-emerald-600 w-8 h-8 animate-pulse" />
                                    </div>
                                    <h3 className="mt-8 text-xl font-bold text-gray-800">Analyzing Metabolic Markers...</h3>
                                    <p className="text-gray-500 mt-2">Checking coating, color, and texture</p>
                                </div>
                            ) : result ? (
                                /* RESULT DISPLAY */
                                <div className="space-y-8">
                                    <div className="flex items-start gap-6">
                                        <img src={imgSrc} alt="Captured" className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg" />
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                                                <CheckCircle className="w-3 h-3" /> Analysis Complete
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-1">
                                                {result.dosha_analysis.primary_dosha} Dominance
                                            </h3>
                                            <p className="text-gray-500 font-medium">
                                                Balanced status: <span className="text-emerald-600">{result.dosha_analysis.balance_status}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-orange-500" /> Key Observations
                                            </h4>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li className="flex justify-between">
                                                    <span>Color:</span> <span className="font-semibold text-gray-900">{result.tongue_observation.color}</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span>Coating:</span> <span className="font-semibold text-gray-900">{result.tongue_observation.coating}</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span>Texture:</span> <span className="font-semibold text-gray-900">{result.tongue_observation.texture}</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-blue-600" /> Digestive Fire (Agni)
                                            </h4>
                                            <ul className="space-y-2 text-sm text-blue-800">
                                                <li className="flex justify-between">
                                                    <span>Ama Presence:</span> <span className="font-bold">{result.digestive_assessment.ama_presence}</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span>Status:</span> <span className="font-bold">{result.digestive_assessment.agni_status}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <h4 className="font-bold text-emerald-900 mb-4">Ayurvedic Insights</h4>
                                        <ul className="space-y-3">
                                            {result.ayurvedic_insights.map((insight, idx) => (
                                                <li key={idx} className="flex gap-3 text-sm text-emerald-800">
                                                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-60" />
                                                    {insight}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">{result.disclaimer}</p>
                                </div>
                            ) : (
                                /* PREVIEW CONFIRMATION */
                                <div className="flex flex-col items-center">
                                    <img src={imgSrc} alt="Preview" className="h-64 rounded-2xl border-4 border-gray-900 shadow-xl mb-8" />
                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" /> {error}
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <button onClick={retake} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">
                                            Retake Photo
                                        </button>
                                        <button onClick={analyzeImage} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg hover:bg-emerald-700 transition flex items-center gap-2">
                                            <Zap className="w-5 h-5 fill-current" /> Analyze Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-600" /> How to Scan
                        </h4>
                        <ul className="space-y-6">
                            <Step num="01" title="Proper Lighting" desc="Stand in front of a mirror with good natural light." />
                            <Step num="02" title="Steady Frame" desc="Keep your face within the guide and stick out your tongue." />
                            <Step num="03" title="AI Analysis" desc="Wait 10-15 seconds for the metabolic report." />
                        </ul>
                    </div>

                    <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                            <h5 className="font-bold text-amber-900 mb-1">Morning Best</h5>
                            <p className="text-xs text-amber-700 leading-relaxed font-medium">For best results, perform Jivha Pariksha first thing in the morning before brushing.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Step({ num, title, desc }) {
    return (
        <li className="flex gap-4">
            <span className="text-xs font-black text-emerald-600 pt-1 tracking-tighter">{num}</span>
            <div>
                <h5 className="text-sm font-bold text-gray-800">{title}</h5>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
            </div>
        </li>
    );
}
