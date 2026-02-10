import React, { useEffect, useState } from "react";
import {
    Droplets,
    Calendar,
    ChevronRight,
    Clock,
    Sparkles,
    Wind,
    Flame,
    Waves,
    Flower,
    CheckCircle2,
    X,
    Leaf
} from "lucide-react";

const THERAPIES = [
    { id: 'vamana', name: 'Vamana', desc: 'Therapeutic emesis to balance Kapha.', duration: '7-10 Days', icon: <Droplets className="w-8 h-8" />, color: "bg-emerald-100 text-emerald-600", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80" },
    { id: 'virechana', name: 'Virechana', desc: 'Therapeutic purgation to balance Pitta.', duration: '10-14 Days', icon: <Wind className="w-8 h-8" />, color: "bg-blue-100 text-blue-600", image: "https://images.unsplash.com/photo-1626509653298-e7c624d73289?auto=format&fit=crop&w=800&q=80" },
    { id: 'basti', name: 'Nirooha Basti', desc: 'Decoction enema for Vata disorders.', duration: '8-30 Days', icon: <Waves className="w-8 h-8" />, color: "bg-amber-100 text-amber-600", image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80" },
    { id: 'nasya', name: 'Nasya', desc: 'Nasal administration of medicated oils.', duration: '7-21 Days', icon: <Flower className="w-8 h-8" />, color: "bg-rose-100 text-rose-600", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80" },
    { id: 'raktamokshana', name: 'Raktamokshana', desc: 'Blood-letting for skin diseases.', duration: '1 Day', icon: <Droplets className="w-8 h-8 text-red-500" />, color: "bg-red-50 text-red-600", image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80" },
    { id: 'abhyanga', name: 'Abhyanga', desc: 'Full-body Ayurvedic oil massage.', duration: '7-14 Days', icon: <Sparkles className="w-8 h-8" />, color: "bg-orange-100 text-orange-600", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80" },
    { id: 'swedana', name: 'Swedana', desc: 'Herbal steam therapy to induce sweating.', duration: '7-14 Days', icon: <Flame className="w-8 h-8" />, color: "bg-orange-50 text-orange-500", image: "https://images.unsplash.com/photo-1531862660126-79c095202685?auto=format&fit=crop&w=800&q=80" },
    { id: 'shirodhara', name: 'Shirodhara', desc: 'Pouring liquids over the forehead.', duration: '7-14 Days', icon: <Droplets className="w-8 h-8" />, color: "bg-indigo-100 text-indigo-600", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80" },
    { id: 'snehana', name: 'Snehana', desc: 'Internal or external oleation therapy.', duration: '3-7 Days', icon: <Droplets className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-600", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80" },
    { id: 'katibasti', name: 'Kati Basti', desc: 'Oil retention therapy for lower back.', duration: '7-14 Days', icon: <div className="h-8 w-8 border-4 border-current rounded-full" />, color: "bg-stone-100 text-stone-600", image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=800&q=80" },
];

export default function PatientPanchakarma({ userId }) {
    const [view, setView] = useState('loading'); // loading, discovery, active
    const [cycle, setCycle] = useState(null);
    const [selectedTherapy, setSelectedTherapy] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({ start: '', duration: '7', doctorId: '' });
    const [doctors, setDoctors] = useState([]);

    const fetchCycle = () => {
        if (!userId) return;
        fetch(`/api/patient/panchakarma/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'active') {
                    setCycle(data);
                    setView('active');
                } else {
                    setView('discovery');
                }
            })
            .catch(err => {
                console.error(err);
                setView('discovery');
            });
    };

    useEffect(() => {
        fetchCycle();
        // Fetch doctors
        fetch('/api/doctors')
            .then(res => res.json())
            .then(data => {
                setDoctors(data);
                if (data.length > 0) setBookingData(prev => ({ ...prev, doctorId: data[0].id }));
            })
            .catch(console.error);
    }, [userId]);

    const handleBookClick = (therapy) => {
        setSelectedTherapy(therapy);
        setBookingData(prev => ({ ...prev, start: new Date().toISOString().split('T')[0] }));
        setShowBookingModal(true);
    };

    const confirmBooking = () => {
        fetch('/api/patient/panchakarma/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: userId,
                therapy: selectedTherapy.name,
                duration: bookingData.duration,
                startDate: bookingData.start,
                doctor_id: bookingData.doctorId
            })
        })
            .then(res => res.json())
            .then(() => {
                setShowBookingModal(false);
                fetchCycle();
            })
            .catch(err => console.error(err));
    };


    if (view === 'loading') return <div className="p-10 text-center text-stone-500">Loading therapy details...</div>;

    if (view === 'active' && cycle) {
        return <ActiveCycleView cycle={cycle} refresh={fetchCycle} />;
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Discovery Header */}
            <div>
                <h2 className="text-3xl font-serif text-stone-800 mb-2">Therapy Discovery</h2>
                <p className="text-stone-500">Explore traditional Panchakarma therapies tailored for your wellness.</p>
            </div>

            {/* Therapy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {THERAPIES.map(therapy => (
                    <div key={therapy.id} className="group bg-white rounded-[2rem] border border-stone-100 p-6 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 hover:-translate-y-1">
                        <div className={`h-16 w-16 rounded-2xl ${therapy.color} flex items-center justify-center mb-6`}>
                            {therapy.icon}
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors">{therapy.name}</h3>
                        <p className="text-sm text-stone-500 mb-4 line-clamp-2">{therapy.desc}</p>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-stone-50">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400 uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5" /> {therapy.duration}
                            </div>
                            <button
                                onClick={() => handleBookClick(therapy)}
                                className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center gap-2"
                            >
                                Book <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowBookingModal(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 z-10 p-2 bg-white/50 rounded-full transition">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            {/* Therapy Image Cover */}
                            <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 shadow-md relative">
                                <img
                                    src={selectedTherapy.image}
                                    alt={selectedTherapy.name}
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${selectedTherapy.color} backdrop-blur-sm bg-white/90`}>
                                        {React.cloneElement(selectedTherapy.icon, { className: "w-6 h-6" })}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-serif text-stone-800">Book {selectedTherapy.name}</h3>
                            <p className="text-stone-500 text-sm mt-1">{selectedTherapy.desc}</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={bookingData.start}
                                    onChange={e => setBookingData({ ...bookingData, start: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Program Duration</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setBookingData({ ...bookingData, duration: '7' })}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${bookingData.duration === '7'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                                            : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200'}`}
                                    >
                                        <div className="text-lg mb-1">7 Days</div>
                                        <div className="text-[10px] uppercase tracking-wider opacity-70">Short Cycle</div>
                                    </button>
                                    <button
                                        onClick={() => setBookingData({ ...bookingData, duration: '14' })}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${bookingData.duration === '14'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                                            : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200'}`}
                                    >
                                        <div className="text-lg mb-1">14 Days</div>
                                        <div className="text-[10px] uppercase tracking-wider opacity-70">Full Cycle</div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Assign Doctor</label>
                                <select
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={bookingData.doctorId}
                                    onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                                >
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={confirmBooking}
                                className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-800 transition shadow-lg shadow-emerald-200 mt-4"
                            >
                                Confirm & Start Therapy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActiveCycleView({ cycle, refresh }) {
    // Determine current day index based on start date
    // This is visual only, assuming sequential dates
    const today = new Date();
    const startDate = new Date(cycle.start_date);
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // If future start, diffDays might be weird, but for prototype let's assume it started today or past

    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleCancel = () => {
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        fetch('/api/patient/panchakarma/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient_id: cycle.patient_id || 1 })
        })
            .then(() => {
                setShowCancelModal(false);
                refresh();
            })
            .catch(err => console.error(err));
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active Therapy</span>
                    </div>
                    <h2 className="text-3xl font-serif text-stone-800">{cycle.name}</h2>
                    <p className="text-stone-500 mt-1 flex items-center gap-2">Started on {new Date(cycle.start_date).toLocaleDateString()} <span className="w-1 h-1 rounded-full bg-stone-300" /> {cycle.doctor_name ? `Dr. ${cycle.doctor_name}` : 'Dr. Assigned'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="text-right hidden md:block">
                        <div className="text-3xl font-light text-emerald-600">{cycle.stages ? cycle.stages.length : 0} Day</div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Program</div>
                    </div>
                    <button onClick={handleCancel} className="text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-widest mt-2 bg-red-50 px-3 py-1.5 rounded-lg">End Therapy</button>
                </div>
            </div>

            {/* Calendar Scroll */}
            <div className="flex gap-6 overflow-x-auto pb-8 pt-4 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {cycle.stages && cycle.stages.map((stage, idx) => {
                    const stageDate = new Date(stage.date);
                    const isToday = stageDate.toDateString() === new Date().toDateString();
                    const isPast = stageDate < new Date() && !isToday;

                    return (
                        <div key={idx} className={`min-w-[280px] md:min-w-[320px] p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group ${isToday ? "bg-emerald-900 text-white shadow-xl shadow-emerald-200 scale-105 ring-4 ring-emerald-50" :
                            isPast ? "bg-stone-100 border-stone-200 text-stone-500 grayscale opacity-80" :
                                "bg-white border-stone-100 text-stone-800"
                            }`}>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isToday ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                                    }`}>
                                    Day {idx + 1}
                                </div>
                                {isPast && <CheckCircle2 className="w-6 h-6 text-stone-400" />}
                            </div>

                            <div className="relative z-10">
                                <h4 className={`text-xs font-bold uppercase tracking-widest mb-1 opacity-70`}>{stage.type}</h4>
                                <h3 className="text-xl font-bold mb-4 leading-tight">{stage.name}</h3>

                                <div className={`flex items-center gap-2 text-xs font-medium ${isToday ? "text-emerald-200" : "text-stone-400"}`}>
                                    <Calendar className="w-4 h-4" />
                                    {stageDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Decorative Background Icon */}
                            <div className={`absolute -bottom-4 -right-4 w-32 h-32 rounded-full flex items-center justify-center opacity-10 ${isToday ? "bg-white" : "bg-stone-200"}`}>
                                <Leaf className="w-16 h-16" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Context Note */}
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-amber-800 text-sm flex gap-4 items-start">
                <Sparkles className="w-5 h-5 shrink-0" />
                <p>Remember to drink plenty of warm water throughout your therapy. Avoid cold foods and day sleep.</p>
            </div>


            {/* Cancel Confirmation Modal */}
            {
                showCancelModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200 text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                                <X className="w-8 h-8" />
                            </div>

                            <h3 className="text-2xl font-serif text-stone-800 mb-2">End Therapy Cycle?</h3>
                            <p className="text-stone-500 mb-8">
                                Are you sure you want to end this therapy cycle? <br />
                                <span className="font-bold text-red-500">All progress will be reset.</span>
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-6 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm uppercase tracking-widest hover:bg-stone-50 transition"
                                >
                                    Keep Active
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-200 transition"
                                >
                                    Yes, End It
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
