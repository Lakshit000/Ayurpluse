import React from "react";
import {
    Search,
    Filter,
    Phone,
    Star,
    MessageSquare,
    CalendarCheck,
    Languages,
    UserCircle
} from "lucide-react";

const doctors = [
    {
        id: 1,
        name: "Dr. Aditi Kulkarni",
        specialty: "KAYACHIKITSA / INTERNAL MEDICINE",
        rating: 4.9,
        exp: "15Y EXP",
        gender: "FEMALE",
        languages: ["ENGLISH", "HINDI"],
        image: "https://i.pravatar.cc/150?u=aditi"
    },
    {
        id: 2,
        name: "Dr. Vikram Sethi",
        specialty: "PANCHAKARMA SPECIALIST",
        rating: 4.8,
        exp: "10Y EXP",
        gender: "MALE",
        languages: ["ENGLISH", "HINDI"],
        image: "https://i.pravatar.cc/150?u=vikram"
    },
    {
        id: 3,
        name: "Dr. Rajesh Iyer",
        specialty: "SHALAKYA TANTRA",
        rating: 5.0,
        exp: "20Y EXP",
        gender: "MALE",
        languages: ["ENGLISH", "TAMIL"],
        image: "https://i.pravatar.cc/150?u=rajesh"
    },
    {
        id: 4,
        name: "Dr. Meera Nair",
        specialty: "KAUMARBHRITYA / PEDIATRICS",
        rating: 4.7,
        exp: "8Y EXP",
        gender: "FEMALE",
        languages: ["ENGLISH", "MALAYALAM"],
        image: "https://i.pravatar.cc/150?u=meera"
    }
];

export default function PatientDoctors() {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Specialist Directory</h2>
                    <p className="text-gray-500 font-medium">Find and consult with certified Ayurvedic practitioners.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white text-gray-600 border border-gray-200 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition">
                        <Filter className="w-4 h-4" /> SHOW FILTERS
                    </button>
                    <button className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-100 transition shadow-sm">
                        <Phone className="w-4 h-4" /> EMERGENCY CALL
                    </button>
                </div>
            </div>

            {/* Doctor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {doctors.map(doc => (
                    <DoctorCard key={doc.id} doc={doc} />
                ))}
            </div>
        </div>
    );
}

function DoctorCard({ doc }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex gap-8 relative z-10">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-gray-50 shadow-sm">
                        <img src={doc.image} alt={doc.name} className="h-full w-full object-cover group-hover:scale-110 transition duration-500" />
                    </div>
                    <div className="flex items-center justify-center gap-1 bg-amber-50 text-amber-700 py-1 rounded-full text-xs font-black">
                        <Star className="w-3 h-3 fill-current" /> {doc.rating}
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h4 className="text-xl font-black text-gray-900">{doc.name}</h4>
                        <div className="text-[10px] font-black text-emerald-600 tracking-widest mt-1 uppercase">{doc.specialty}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Tag label={doc.exp} />
                        <Tag label={doc.gender} />
                        {doc.languages.map(lang => (
                            <Tag key={lang} label={lang} color="bg-indigo-50 text-indigo-700" />
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button className="flex-1 bg-emerald-600 text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">
                            Book Visit
                        </button>
                        <button className="h-12 w-12 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[80px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition duration-1000" />
        </div>
    );
}

function Tag({ label, color = "bg-gray-50 text-gray-500" }) {
    return (
        <span className={`${color} px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase`}>
            {label}
        </span>
    );
}
