import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientAppointments({ userId }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        doctor_id: "",
        date: "",
        time: "",
        type: "General Checkup",
    });

    const [msg, setMsg] = useState("");
    const [doctors, setDoctors] = useState([]);

    // Fetch doctors
    useEffect(() => {
        fetch("/api/doctors")
            .then((res) => res.json())
            .then((data) => {
                setDoctors(data);
                if (data.length > 0) {
                    setForm((f) => ({ ...f, doctor_id: String(data[0].id) }));
                }
            })
            .catch(console.error);
    }, []);

    // Fetch appointments
    useEffect(() => {
        if (!userId) return;
        fetchAppointments();
    }, [userId]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/patient/appointments/${userId}`);
            if (res.ok) {
                setAppointments(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Submit booking
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");

        if (!form.doctor_id || !form.date || !form.time) {
            setMsg("Please select doctor, date and time.");
            return;
        }

        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, patient_id: userId }),
            });

            const data = await res.json();

            if (res.ok) {
                setMsg("Appointment Booked Successfully!");
                setForm((f) => ({ ...f, date: "", time: "" }));
                fetchAppointments(); // 🔥 THIS WAS MISSING
            } else {
                setMsg("Error: " + data.message);
            }
        } catch {
            setMsg("Failed to connect to server.");
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <motion.div variants={item}>
                <h2 className="text-2xl font-black text-gray-900">My Appointments</h2>
                <p className="text-gray-500">Schedule and manage your visits.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Form */}
                <motion.div variants={item} className="bg-white p-8 rounded-[2rem] border shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-600" /> Book New Visit
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Doctor */}
                        <div>
                            <label className="text-sm font-bold">Select Doctor</label>
                            <div className="relative mt-2">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                    value={form.doctor_id}
                                    onChange={(e) =>
                                        setForm({ ...form, doctor_id: e.target.value })
                                    }
                                >
                                    {doctors.map((d) => (
                                        <option key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) =>
                                    setForm({ ...form, date: e.target.value })
                                }
                                className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            />
                            <input
                                type="time"
                                value={form.time}
                                onChange={(e) =>
                                    setForm({ ...form, time: e.target.value })
                                }
                                className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            />
                        </div>

                        {/* Type */}
                        <select
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            <option>General Checkup</option>
                            <option>Follow Up</option>
                            <option>Panchakarma Session</option>
                            <option>Nadi Pariksha</option>
                        </select>

                        <AnimatePresence>
                            {msg && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`p-3 rounded-xl text-sm font-bold flex gap-2 ${msg.includes("Success")
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-red-50 text-red-600"
                                        }`}
                                >
                                    {msg.includes("Success") ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4" />
                                    )}
                                    {msg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all"
                        >
                            Confirm Booking
                        </motion.button>
                    </form>
                </motion.div>

                {/* Appointments List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <p className="text-gray-400">Loading appointments...</p>
                    ) : appointments.length === 0 ? (
                        <p className="text-gray-500">No appointments found.</p>
                    ) : (
                        <AnimatePresence>
                            {appointments.map((apt, i) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-6 rounded-[2rem] shadow-sm flex justify-between items-center group hover:shadow-md transition-all border border-transparent hover:border-gray-100"
                                >
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">{apt.type}</h4>
                                        <div className="text-sm text-gray-500 flex gap-4 mt-2 font-medium">
                                            <span className="flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4 text-emerald-500" />
                                                Approved
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> {apt.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />{" "}
                                                {
                                                    doctors.find(
                                                        (d) => String(d.id) === String(apt.doctor_id)
                                                    )?.name
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                                        {new Date(apt.date).getDate()}
                                        <br />
                                        {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
