import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Mail, Lock, Award, ArrowRight, ShieldCheck } from "lucide-react";

export default function DoctorAuth({ onSuccess }) {
    const [mode, setMode] = useState("signup");

    const [form, setForm] = useState({
        name: "",
        email: "",
        qualifications: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        let newErrors = {};

        if (mode === "signup") {
            if (!form.name.trim()) newErrors.name = "Doctor name required.";
            if (!form.qualifications.trim())
                newErrors.qualifications = "Qualifications required.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Enter a valid email.";

        if (form.password.length < 6)
            newErrors.password = "Password must be at least 6 characters.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const url = mode === "signup" ? "/api/register" : "/api/login";
            let payload = mode === "signup"
                ? { name: form.name, email: form.email, password: form.password, role: 'doctor', qualifications: form.qualifications }
                : { email: form.email, password: form.password };

            if (showOtp) {
                payload.otp = otp;
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ ...errors, api: data.message || "Authentication failed" });
                setIsLoading(false);
                return;
            }

            // 2FA check
            if (data.status === "2FA_REQUIRED") {
                setShowOtp(true);
                setIsLoading(false);
                return;
            }

            if (mode === "signup") {
                setMode("login");
                setForm({ ...form, password: "" });
                setIsLoading(false);
                // Note: Consider a better notification than alert
            } else {
                if (typeof onSuccess === "function") {
                    onSuccess({
                        role: "doctor",
                        doctorName: data.user.name,
                        email: data.user.email,
                        id: data.user.id
                    });
                }
            }
        } catch (err) {
            setErrors({ ...errors, api: "Server connection failed." });
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div>
            {/* Mode Switch Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 mt-2">
                <div className="text-left">
                    <h2 className="font-serif text-3xl font-bold text-gray-900 leading-none">
                        Doctor <span className="text-emerald-700">{mode === "signup" ? "Onboarding" : "Portal"}</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 font-medium">Join our network of Ayurvedic experts</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                    <button
                        onClick={() => { setMode("signup"); setErrors({}); setShowOtp(false); }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "signup" ? "bg-white text-emerald-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Register
                    </button>
                    <button
                        onClick={() => { setMode("login"); setErrors({}); setShowOtp(false); }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "login" ? "bg-white text-emerald-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Login
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
                >
                    <AnimatePresence mode="popLayout">
                        {mode === "signup" && (
                            <>
                                <motion.div variants={itemVariants} key="name" className="md:col-span-1">
                                    <Field
                                        label="Full Name"
                                        name="name"
                                        icon={Stethoscope}
                                        value={form.name}
                                        onChange={handleChange}
                                        error={errors.name}
                                        placeholder="Dr. Arjun Gupta"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} key="qualifications" className="md:col-span-1">
                                    <Field
                                        label="Qualifications"
                                        name="qualifications"
                                        icon={Award}
                                        value={form.qualifications}
                                        onChange={handleChange}
                                        error={errors.qualifications}
                                        placeholder="BAMS, MD (Ayurveda)"
                                    />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <motion.div variants={itemVariants} key="email">
                        <Field
                            label="Professional Email"
                            name="email"
                            icon={Mail}
                            value={form.email}
                            onChange={handleChange}
                            error={errors.email}
                            type="email"
                            placeholder="doctor@ayurpulse.com"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} key="password">
                        <Field
                            label="Secret Password"
                            name="password"
                            icon={Lock}
                            value={form.password}
                            onChange={handleChange}
                            error={errors.password}
                            type="password"
                            placeholder="••••••••"
                        />
                    </motion.div>

                    <AnimatePresence>
                        {showOtp && (
                            <motion.div
                                key="otp-field"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:col-span-2"
                            >
                                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem] mt-2 mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-emerald-900 font-bold">Two-Factor Authentication</p>
                                            <p className="text-[11px] text-emerald-600 font-medium">Please enter the security code sent to you</p>
                                        </div>
                                    </div>
                                    <Field
                                        label="Security Code"
                                        name="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        type="text"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div variants={itemVariants} className="md:col-span-2 mt-4">
                        {errors.api && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 text-xs font-bold text-red-600 bg-red-50/50 rounded-2xl border border-red-100 flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {errors.api}
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.01, translateY: -2 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            type="submit"
                            className={`w-full py-4 rounded-[1.25rem] font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200/50 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-800 hover:bg-emerald-900 text-white"
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === "signup" ? "Join Network" : "Secure Login"}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>

                        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                            {mode === "signup" ? "Already have a practice?" : "Need to register your clinic?"}{" "}
                            <button
                                type="button"
                                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                                className="text-emerald-700 font-black hover:underline underline-offset-4"
                            >
                                {mode === "signup" ? "Sign In" : "Get Started"}
                            </button>
                        </p>
                    </motion.div>
                </motion.div>
            </form>
        </div>
    );
}

function Field({ label, name, value, onChange, error, type = "text", placeholder, icon: Icon }) {
    return (
        <div className="relative group">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block transition-colors group-focus-within:text-emerald-800">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-3.5 bg-gray-50/50 rounded-2xl border ${error ? 'border-red-200 focus:ring-red-500/10 focus:border-red-500/50' : 'border-gray-100 focus:ring-emerald-500/20 focus:border-emerald-500/50'} outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300`}
                />
            </div>
            {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-[11px] font-bold text-red-500 ml-1">{error}</motion.p>}
        </div>
    );
}
