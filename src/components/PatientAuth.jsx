import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, MapPin, Mail, Lock, Calendar, Globe, ArrowRight } from "lucide-react";

export default function PatientAuth({ onSuccess }) {
    const [mode, setMode] = useState("signup");

    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        gender: "",
        dob: "",
        place: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        let newErrors = {};

        if (mode === "signup") {
            if (!form.name.trim()) newErrors.name = "Full name is required.";
            if (!/^[0-9]{10}$/.test(form.phone))
                newErrors.phone = "Phone must be 10 digits.";
            if (!form.address.trim()) newErrors.address = "Address is required.";
            if (!form.gender) newErrors.gender = "Gender is required.";
            if (!form.dob) newErrors.dob = "DOB is required.";
            if (!form.place.trim()) newErrors.place = "Place is required.";
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
            const payload = mode === "signup"
                ? {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: 'patient',
                    phone: form.phone,
                    address: form.address,
                    gender: form.gender,
                    dob: form.dob,
                    place: form.place
                }
                : { email: form.email, password: form.password };

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

            if (mode === "signup") {
                setMode("login");
                setForm({ ...form, password: "" });
                // Note: Consider a better notification than alert
                setIsLoading(false);
            } else {
                if (typeof onSuccess === "function") {
                    onSuccess({
                        role: "patient",
                        patientName: data.user.name,
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
                        Patient <span className="text-emerald-700">{mode === "signup" ? "Registration" : "Login"}</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 font-medium">Please enter your details to continue</p>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                    <button
                        onClick={() => { setMode("signup"); setErrors({}); }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "signup" ? "bg-white text-emerald-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Signup
                    </button>
                    <button
                        onClick={() => { setMode("login"); setErrors({}); }}
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
                                <motion.div variants={itemVariants} key="name">
                                    <Field
                                        label="Full Name"
                                        name="name"
                                        icon={User}
                                        value={form.name}
                                        onChange={handleChange}
                                        error={errors.name}
                                        placeholder="Rahul Sharma"
                                    />
                                </motion.div>
                                <motion.div variants={itemVariants} key="phone">
                                    <Field
                                        label="Phone Number"
                                        name="phone"
                                        icon={Phone}
                                        value={form.phone}
                                        onChange={handleChange}
                                        error={errors.phone}
                                        placeholder="10-digit mobile number"
                                    />
                                </motion.div>
                                <motion.div variants={itemVariants} key="place">
                                    <Field
                                        label="City / Place"
                                        name="place"
                                        icon={Globe}
                                        value={form.place}
                                        onChange={handleChange}
                                        error={errors.place}
                                        placeholder="e.g. New Delhi"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} key="gender">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Gender
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium text-gray-700 appearance-none"
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    {errors.gender && (
                                        <p className="mt-1.5 text-[11px] font-bold text-red-500 ml-1">{errors.gender}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants} key="dob">
                                    <Field
                                        label="Date of Birth"
                                        name="dob"
                                        type="date"
                                        icon={Calendar}
                                        value={form.dob}
                                        onChange={handleChange}
                                        error={errors.dob}
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} key="address" className="md:col-span-2">
                                    <Field
                                        label="Full Residential Address"
                                        name="address"
                                        icon={MapPin}
                                        value={form.address}
                                        onChange={handleChange}
                                        error={errors.address}
                                        placeholder="Street, Area, Pincode"
                                    />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <motion.div variants={itemVariants} key="email">
                        <Field
                            label="Email Address"
                            name="email"
                            icon={Mail}
                            value={form.email}
                            onChange={handleChange}
                            error={errors.email}
                            type="email"
                            placeholder="rahul@example.com"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} key="password">
                        <Field
                            label="Password"
                            name="password"
                            icon={Lock}
                            value={form.password}
                            onChange={handleChange}
                            error={errors.password}
                            type="password"
                            placeholder="••••••••"
                        />
                    </motion.div>

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
                            className={`w-full py-4 rounded-[1.25rem] font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200/50 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === "signup" ? "Complete Registration" : "Authenticate Account"}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>

                        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                            {mode === "signup" ? "Already have an account?" : "New to AyurPulse?"}{" "}
                            <button
                                type="button"
                                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                                className="text-emerald-700 font-black hover:underline underline-offset-4"
                            >
                                {mode === "signup" ? "Sign In" : "Create Account"}
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
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block transition-colors group-focus-within:text-emerald-600">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
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
