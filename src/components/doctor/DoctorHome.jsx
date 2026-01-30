import React from "react";
import {
    Users,
    Droplet,
    Calendar,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import NotificationBell from "../NotificationBell"; // Verify path

export default function DoctorHome({ userId = 1 }) { // Default to 1 for demo
    const [stats, setStats] = React.useState({
        totalPatients: 0,
        todayVisits: 0,
        activePanchakarma: 0,
        followUps: 0
    });
    const [analytics, setAnalytics] = React.useState({
        vikrutiTrends: [],
        prakrutiMix: { vata: 0, pitta: 0, kapha: 0 }
    });

    React.useEffect(() => {
        // Fetch Stats (Poll every 10s)
        const fetchStats = () => {
            fetch('/api/doctor/stats')
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error("Failed to fetch stats", err));
        };

        // Fetch Analytics (Once on mount)
        fetch('/api/doctor/analytics')
            .then(res => res.json())
            .then(data => setAnalytics(data))
            .catch(err => console.error("Failed to fetch analytics", err));

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Live updates

        return () => clearInterval(interval);
    }, [userId]);


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
            className="max-w-6xl mx-auto"
        >
            {/* Title */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight">DASHBOARD</h2>
                <div className="relative">
                    <NotificationBell doctorId={userId} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card
                    title="TOTAL PATIENTS"
                    value={stats.totalPatients}
                    trend="Live"
                    trendUp={true}
                    icon={Users}
                    color="emerald"
                />
                <Card
                    title="TODAY'S VISITS"
                    value={stats.todayVisits}
                    trend="Today"
                    trendUp={true}
                    icon={Calendar}
                    color="emerald"
                />
                <Card
                    title="PANCHAKARMA ACTIVE"
                    value={stats.activePanchakarma}
                    trend="Active"
                    trendUp={true}
                    icon={Droplet}
                    color="blue"
                />
                <Card
                    title="FOLLOW-UPS"
                    value={stats.followUps}
                    trend="Pending"
                    trendUp={false}
                    icon={Activity}
                    color="red"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dosha Imbalance Trends */}
                <motion.div variants={item} className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-lg">Patient Activity Overview</h3>
                        <div className="flex gap-4 text-xs font-bold">
                            <span className="text-gray-400">Monthly Volume</span>
                        </div>
                    </div>

                    {/* Dynamic Bar Chart */}
                    <div className="h-64 flex items-end justify-between px-4 gap-4">
                        {analytics.vikrutiTrends.length > 0 ? (
                            analytics.vikrutiTrends.map((item, i) => (
                                <div key={i} className="flex-1 flex gap-2 items-end justify-center h-full">
                                    {/* Using Vata/Pitta/Kapha as stacked bars for visual flair, though they represent volume split now */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${item.vata}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="w-full bg-emerald-500 rounded-t-lg"
                                    ></motion.div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${item.pitta}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                                        className="w-full bg-orange-500 rounded-t-lg"
                                    ></motion.div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${item.kapha}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 + 0.4 }}
                                        className="w-full bg-blue-500 rounded-t-lg"
                                    ></motion.div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                No activity data yet
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between px-8 mt-4 text-sm text-gray-500 font-semibold">
                        {analytics.vikrutiTrends.map((item, i) => <span key={i}>{item.month}</span>)}
                    </div>
                </motion.div>

                {/* Patient Prakruti Mix */}
                <motion.div variants={item} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-8">Patient Prakruti Mix</h3>

                    <div className="relative h-64 flex items-center justify-center">
                        {/* Simple CSS Donut Chart */}
                        <motion.div
                            initial={{ rotate: -90, scale: 0 }}
                            animate={{ rotate: 45, scale: 1 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="w-48 h-48 rounded-full border-[20px] border-emerald-500 border-r-orange-500 border-b-blue-500"
                        ></motion.div>
                        <div className="absolute font-black text-2xl text-gray-700">MIX</div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-emerald-700">VATA DOMINANT</span>
                            <span>{analytics.prakrutiMix.vata}%</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-orange-700">PITTA DOMINANT</span>
                            <span>{analytics.prakrutiMix.pitta}%</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-blue-700">KAPHA DOMINANT</span>
                            <span>{analytics.prakrutiMix.kapha}%</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

function Card({ title, value, trend, trendUp, icon: Icon, color }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                        {title}
                    </div>
                    <div className="text-3xl font-black text-gray-900">{value}</div>
                </div>
                <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className={`mt-4 flex items-center gap-1 text-sm font-bold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {trend}
            </div>
        </motion.div>
    );
}
