import React, { useState, useEffect } from "react";
import {
    Filter,
    Download,
    FileText,
    ChevronRight,
    X,
    FileSpreadsheet,
    File as FileIcon // Renamed to avoid naming conflict if any
} from "lucide-react";

export default function DoctorAnalytics() {
    const [data, setData] = useState({
        kpi: {
            retention: { value: '0%', change: '+0%' },
            revenue: { value: '₹0', change: '+0%' },
            newRegistrations: { value: 0, change: '+0' }
        },
        activity: { regular: 0, followUp: 0, new: 0 },
        prakrutiMix: { vata: 0, pitta: 0, kapha: 0 }
    });
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        // Fetch Analytics
        fetch('/api/doctor/analytics')
            .then(res => res.json())
            .then(d => {
                if (d && d.kpi) setData(d);
            })
            .catch(console.error);

        // Fetch Reports List
        fetch('/api/reports')
            .then(res => res.json())
            .then(setReports)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const openDownloadModal = (type) => {
        setSelectedReport(type);
        setShowModal(true);
    };

    const downloadFile = (format) => {
        if (!selectedReport) return;
        window.location.href = `/api/reports/download/${selectedReport}?format=${format}`;
        setShowModal(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading analytics...</div>;

    // Calculate percentages for Activity Bar
    const totalActivity = data.activity.regular + data.activity.followUp + data.activity.new;
    const getActivityPercent = (val) => totalActivity === 0 ? 0 : (val / totalActivity) * 100;

    // Calculate percentages for Prakruti Donut
    const totalPrakruti = data.prakrutiMix.vata + data.prakrutiMix.pitta + data.prakrutiMix.kapha;
    const getPrakrutiPercent = (val) => totalPrakruti === 0 ? 0 : Math.round((val / totalPrakruti) * 100);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
            {/* Title */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight text-gray-900">Clinical Analytics</h2>
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-semibold text-sm transition">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button
                        onClick={() => openDownloadModal('all')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition"
                    >
                        <Download className="w-4 h-4" />
                        Export All
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">PATIENT RETENTION</div>
                    <div className="flex items-end gap-3">
                        <div className="text-4xl font-black text-gray-900">{data.kpi.retention.value}</div>
                        <div className="text-sm font-bold text-emerald-600 mb-1.5">{data.kpi.retention.change}</div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">REVENUE (MONTHLY)</div>
                    <div className="flex items-end gap-3">
                        <div className="text-4xl font-black text-gray-900">{data.kpi.revenue.value}</div>
                        <div className="text-sm font-bold text-emerald-600 mb-1.5">{data.kpi.revenue.change}</div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
                    <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">NEW REGISTRATIONS</div>
                    <div className="flex items-end gap-3">
                        <div className="text-4xl font-black text-gray-900">{data.kpi.newRegistrations.value}</div>
                        <div className="text-sm font-bold text-emerald-600 mb-1.5">{data.kpi.newRegistrations.change}</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient Activity Overview */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="font-bold text-lg text-gray-900">Patient Activity Overview</h3>
                        <div className="flex gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Regular
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Follow-up
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> New
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end justify-between gap-4 h-48 px-4">
                        {/* Jan Data (Mocked as Current Month for now) */}
                        <div className="w-full flex justify-center gap-2 items-end h-full relative group">
                            <div className="w-full bg-emerald-500 rounded-t-lg transition-all duration-700 relative hover:opacity-90" style={{ height: `${getActivityPercent(data.activity.regular)}%` }}></div>
                            <div className="w-full bg-orange-500 rounded-t-lg transition-all duration-700 relative hover:opacity-90" style={{ height: `${getActivityPercent(data.activity.followUp)}%` }}></div>
                            <div className="w-full bg-blue-500 rounded-t-lg transition-all duration-700 relative hover:opacity-90" style={{ height: `${getActivityPercent(data.activity.new)}%` }}></div>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 mt-0"></div>
                    <div className="mt-4 text-xs font-bold text-gray-400 text-center uppercase tracking-widest">
                        Current Month
                    </div>
                </div>

                {/* Patient Prakruti Mix */}
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
                    <h3 className="font-bold text-lg text-gray-900 mb-6">Patient Prakruti Mix</h3>

                    <div className="relative w-48 h-48 mx-auto">
                        <div
                            className="w-full h-full rounded-full transition-all duration-1000"
                            style={{
                                background: `conic-gradient(
                                    #10b981 0% ${getPrakrutiPercent(data.prakrutiMix.vata)}%, 
                                    #f97316 ${getPrakrutiPercent(data.prakrutiMix.vata)}% ${getPrakrutiPercent(data.prakrutiMix.vata) + getPrakrutiPercent(data.prakrutiMix.pitta)}%, 
                                    #3b82f6 ${getPrakrutiPercent(data.prakrutiMix.vata) + getPrakrutiPercent(data.prakrutiMix.pitta)}% 100%
                                )`
                            }}
                        />
                        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-inner">
                            <div className="text-center">
                                <div className="text-3xl font-black text-gray-800 tracking-tight">{totalPrakruti}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Total Patients</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">VATA DOMINANT</span>
                            <span className="text-sm font-black text-gray-900">{getPrakrutiPercent(data.prakrutiMix.vata)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${getPrakrutiPercent(data.prakrutiMix.vata)}%` }} />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">PITTA DOMINANT</span>
                            <span className="text-sm font-black text-gray-900">{getPrakrutiPercent(data.prakrutiMix.pitta)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${getPrakrutiPercent(data.prakrutiMix.pitta)}%` }} />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">KAPHA DOMINANT</span>
                            <span className="text-sm font-black text-gray-900">{getPrakrutiPercent(data.prakrutiMix.kapha)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${getPrakrutiPercent(data.prakrutiMix.kapha)}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm relative z-0">
                <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-t-3xl">
                    <h3 className="font-bold text-lg text-gray-900">Available Reports</h3>
                    <div className="text-xs font-bold tracking-widest text-gray-400 uppercase bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-emerald-500 mr-2">●</span>
                        Automatic Generation: On
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {reports.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold">No reports available</div>
                    ) : (
                        reports.map((report, i) => (
                            <ReportItem
                                key={report.id}
                                title={report.title}
                                lastRun="Generated Live"
                                size={report.size}
                                format={report.format}
                                isLast={i === reports.length - 1}
                                onDownload={() => openDownloadModal(report.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Download Modal - Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-gray-900">Download Format</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-gray-500 font-medium mb-4">
                                Select your preferred format for
                                <span className="font-bold text-gray-900 ml-1">
                                    {selectedReport === 'all' ? 'Full System Export' : reports.find(r => r.id === selectedReport)?.title || 'Report'}
                                </span>
                            </p>

                            <button
                                onClick={() => downloadFile('csv')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition group"
                            >
                                <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold">CSV</div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 group-hover:text-emerald-700">Excel / CSV</div>
                                    <div className="text-xs text-gray-400">Best for data analysis</div>
                                </div>
                            </button>

                            <button
                                onClick={() => downloadFile('pdf')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50 transition group"
                            >
                                <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">PDF</div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 group-hover:text-red-700">PDF Document</div>
                                    <div className="text-xs text-gray-400">Best for printing & sharing</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


function ReportItem({ title, lastRun, size, format, isLast, onDownload }) {
    return (
        <div
            onClick={onDownload}
            className={`flex items-center justify-between p-6 hover:bg-gray-50 transition cursor-pointer group ${isLast ? 'rounded-b-3xl' : ''}`}
        >
            <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <div className="font-bold text-gray-900 text-[15px] group-hover:text-emerald-700 transition-colors">{title}</div>
                    <div className="text-xs font-semibold text-gray-400 mt-1">Last run: {lastRun} • Format: {format || 'CSV'}</div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg text-[10px]">Download</span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 text-gray-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                    <Download className="w-4 h-4" />
                </div>
            </div>
        </div>
    )
}

