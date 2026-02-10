import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, GitCompare, Search, BookOpen, Settings, Bell, LogOut, X, Check, Menu } from 'lucide-react';
import InternReasoningExplorer from './intern/InternReasoningExplorer';
import InternDiseaseSearch from './intern/InternDiseaseSearch';
import InternCaseLibrary from './intern/InternCaseLibrary';
import InternSettings from './intern/InternSettings';

// Inner component for Hub view
const InternHub = ({ onNavigate }) => {
    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-indigo-900 text-white p-10 shadow-2xl shadow-indigo-100">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-800/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

                <div className="relative z-10 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                        <Settings className="w-3 h-3" />
                        <span className="text-xs font-bold tracking-wider">ACADEMIC LEARNING LAYER</span>
                    </div>

                    <h2 className="text-4xl font-black tracking-tight mb-4">WELCOME, CLINICAL INTERN</h2>
                    <p className="text-lg text-indigo-100/80 leading-relaxed max-w-2xl">
                        This portal is strictly for educational observation. Patient records are anonymized for HIPAA compliance.
                        No clinical actions performed here will affect real patient outcomes.
                    </p>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => onNavigate('reasoning')}
                    className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <GitCompare className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">Reasoning Explorer</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Compare cases side-by-side to understand clinical decision patterns.</p>
                </div>

                <div
                    onClick={() => onNavigate('search')}
                    className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">Disease Search</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Study how common conditions like Fever or Ortho Pain are managed.</p>
                </div>

                <div
                    onClick={() => onNavigate('library')}
                    className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">Case Library</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Explore anonymized real-world cases with deep clinical reasoning.</p>
                </div>
            </div>

            {/* Focus Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex items-center justify-between mt-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">THIS WEEK'S FOCUS: CASE COMPARISON</h3>
                        <p className="text-gray-500 text-sm">Use the Reasoning Explorer to understand why similar symptoms lead to different therapies.</p>
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('reasoning')}
                    className="px-6 py-3 bg-indigo-900 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-indigo-800 transition-colors shadow-lg shadow-indigo-200"
                >
                    OPEN EXPLORER
                </button>
            </div>
        </div>
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("InternDashboard Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong.</h2>
                    <p className="text-red-600 mb-4">The component failed to load.</p>
                    <details className="text-left bg-white p-4 rounded-xl border border-red-100 overflow-auto max-h-64" open>
                        <summary className="cursor-pointer font-medium text-red-700">Error Details</summary>
                        <pre className="mt-2 text-xs text-red-800 whitespace-pre-wrap">
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const InternDashboard = ({ userData, onLogout }) => {
    const [activeTab, setActiveTab] = useState('hub');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Added state

    const sidebarItems = [
        { id: 'hub', label: 'Intern Hub', icon: LayoutDashboard },
        { id: 'reasoning', label: 'Reasoning Explorer', icon: GitCompare },
        { id: 'search', label: 'Disease Search', icon: Search },
        { id: 'library', label: 'Case Library', icon: BookOpen },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    useEffect(() => {
        if (userData?.id) {
            fetchNotifications();
            // Poll for notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userData]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/notifications/${userData.id}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'hub':
                return <InternHub onNavigate={setActiveTab} />;
            case 'reasoning':
                return <InternReasoningExplorer />;
            case 'search':
                return <InternDiseaseSearch />;
            case 'library':
                return <InternCaseLibrary />;
            case 'settings':
                return <InternSettings userData={userData} />;
            default:
                return <InternHub onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`w-72 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                            A
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight text-gray-900">AyurPulse</h1>
                            <p className="text-xs font-medium text-gray-500 tracking-wider">INTERN PORTAL</p>
                        </div>
                    </div>
                    <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === item.id
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                } `}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'} `} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto p-6 space-y-4">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>

                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-0 overflow-y-auto h-screen">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                            {activeTab === 'hub' ? 'DASHBOARD' : sidebarItems.find(i => i.id === activeTab)?.label.toUpperCase()}
                        </h2>
                    </div>

                    <div className="relative w-96 mx-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search history or appointments..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border-none text-sm focus:ring-2 focus:ring-indigo-100 transition-all font-medium placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Bell className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900">Notifications</h3>
                                            <button onClick={() => setShowNotifications(false)}>
                                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                                                        onClick={() => markAsRead(n.id)}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full ${!n.is_read ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                                                            <div>
                                                                <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-400 text-sm">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 leading-none">{userData?.name || 'Intern'}</p>
                                <p className="text-xs text-indigo-600 font-bold mt-1 tracking-wide">CLINICAL INTERN</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-yellow-100 border-2 border-white shadow-sm overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'Intern'}`} alt="Profile" className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ErrorBoundary>
                            {renderContent()}
                        </ErrorBoundary>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default InternDashboard;
