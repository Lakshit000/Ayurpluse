import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Server, Save, Shield, AlertCircle, CheckCircle, Bell, Mail, Phone, Globe, Clock, Database, RefreshCw, History } from 'lucide-react';

const Settings = ({ userData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        gender: '',
        dob: '',
        place: '',
        qualifications: ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification State
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        promotional: false
    });

    // System Settings State (Doctor Only)
    const [systemSettings, setSystemSettings] = useState({
        security_auto_logout: 30,
        data_backup_freq: 'daily',
        security_2fa: false,
        locale_timezone: "Asia/Kolkata",
        locale_date_format: "DD/MM/YYYY"
    });

    const [backupStatus, setBackupStatus] = useState(null);

    useEffect(() => {
        if (userData && userData.id) {
            fetchProfile();
            if (userData.role === 'doctor') {
                fetchSystemSettings();
            }
        }
    }, [userData]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/users/${userData.id}`);
            if (res.ok) {
                const data = await res.json();
                setProfileData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    gender: data.gender || '',
                    dob: data.dob || '',
                    place: data.place || '',
                    qualifications: data.qualifications || ''
                });
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    const fetchSystemSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSystemSettings(data);
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch(`/api/users/${userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Update failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error' });
        }
        setLoading(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords don't match" });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch(`/api/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userData.id,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Change failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error' });
        }
        setLoading(false);
    };

    const handleSystemUpdate = async (key, value) => {
        setSystemSettings(prev => ({ ...prev, [key]: value }));
        try {
            await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value, updated_by: userData.name })
            });
        } catch (err) {
            console.error("Failed to update setting", err);
        }
    };

    const triggerBackup = () => {
        setBackupStatus('processing');
        fetch('/api/system/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ triggered_by: userData.name })
        })
            .then(res => res.json())
            .then(data => {
                setBackupStatus('success');
                setTimeout(() => setBackupStatus(null), 3000);
            })
            .catch(err => setBackupStatus('error'));
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === id
                ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900">Settings</h2>
                <p className="text-gray-500 font-medium">Manage your profile, security, and preferences.</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-4">
                <TabButton id="profile" icon={User} label="Profile" />
                <TabButton id="security" icon={Lock} label="Security" />
                <TabButton id="notifications" icon={Bell} label="Notifications" />
                {userData.role === 'doctor' && (
                    <TabButton id="system" icon={Server} label="System" />
                )}
            </div>

            {/* Feedback Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Content Area */}
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email (Read Only)</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone</label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date of Birth</label>
                                <input
                                    type="date"
                                    value={profileData.dob}
                                    onChange={e => setProfileData({ ...profileData, dob: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gender</label>
                                <select
                                    value={profileData.gender}
                                    onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition font-semibold"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">City / Place</label>
                                <input
                                    type="text"
                                    value={profileData.place}
                                    onChange={e => setProfileData({ ...profileData, place: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition font-semibold"
                                />
                            </div>
                            {userData.role === 'doctor' && (
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Qualifications</label>
                                    <input
                                        type="text"
                                        value={profileData.qualifications}
                                        onChange={e => setProfileData({ ...profileData, qualifications: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition font-semibold"
                                    />
                                </div>
                            )}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Address</label>
                                <textarea
                                    value={profileData.address}
                                    onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition resize-none font-semibold"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 transition shadow-lg shadow-emerald-900/20 disabled:opacity-70 font-bold"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="space-y-8 max-w-2xl">
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Change Password</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition shadow-lg shadow-gray-200 disabled:opacity-70 font-bold text-sm"
                            >
                                <Lock className="w-4 h-4" />
                                Update Password
                            </button>
                        </form>

                        {userData.role === 'doctor' && (
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-800" />
                                    Two-Factor Authentication
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-900">Enable 2FA</p>
                                        <p className="text-xs text-gray-500 font-semibold">Require OTP for login</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={systemSettings.security_2fa}
                                            onChange={(e) => handleSystemUpdate('security_2fa', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 max-w-2xl">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Preferences</h3>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="font-bold text-gray-900">Email Notifications</div>
                                    <div className="text-xs text-gray-500 font-semibold">Receive updates about appointments</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="font-bold text-gray-900">SMS Alerts</div>
                                    <div className="text-xs text-gray-500 font-semibold">Get appointment reminders via SMS</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifications.sms}
                                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* SYSTEM TAB (Doctor Only) */}
                {activeTab === 'system' && userData.role === 'doctor' && (
                    <div className="space-y-10">

                        {/* Header Section with Save Button */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">System Settings</h3>
                            </div>
                            <button
                                onClick={() => setMessage({ type: 'success', text: 'All changes saved successfully' })}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 font-bold text-sm"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>

                        {/* Security & Access */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Shield className="w-6 h-6 text-blue-500 mt-1" />
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 leading-none">Security & Access</h4>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Manage hospital roles, MFA, and audit logs.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                                {/* 2FA */}
                                <div className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Two-Factor Authentication</p>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Require code for all doctor logins.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={systemSettings.security_2fa}
                                            onChange={(e) => handleSystemUpdate('security_2fa', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>

                                {/* Auto Logout */}
                                <div className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Auto-Logout</p>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Session timeout after 30 minutes of inactivity.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={systemSettings.security_auto_logout > 0}
                                            onChange={(e) => handleSystemUpdate('security_auto_logout', e.target.checked ? 30 : 0)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Database className="w-6 h-6 text-purple-500 mt-1" />
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 leading-none">Data Management</h4>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Backup frequency and cloud synchronization.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-gray-600">Auto-backup frequency</label>
                                    <select
                                        value={systemSettings.data_backup_freq}
                                        onChange={(e) => handleSystemUpdate('data_backup_freq', e.target.value)}
                                        className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-gray-700 outline-none"
                                    >
                                        <option value="daily">Every 24 hours</option>
                                        <option value="6hours">Every 6 hours</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>

                                <div>
                                    <button
                                        onClick={triggerBackup}
                                        disabled={backupStatus === 'processing'}
                                        className="px-6 py-3 bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-emerald-100 transition"
                                    >
                                        {backupStatus === 'processing' ? 'PROCESSING...' : 'TRIGGER MANUAL DATABASE BACKUP'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Localization */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Globe className="w-6 h-6 text-emerald-500 mt-1" />
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 leading-none">Localization</h4>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Date formats, timezone, and language.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">SYSTEM TIMEZONE</label>
                                        <select
                                            value={systemSettings.locale_timezone}
                                            onChange={(e) => handleSystemUpdate('locale_timezone', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-semibold outline-none"
                                        >
                                            <option value="Asia/Kolkata">UTC +5:30 (India Standard Time)</option>
                                            <option value="America/New_York">UTC -5:00 (Eastern Time)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">DATE FORMAT</label>
                                        <select
                                            value={systemSettings.locale_date_format}
                                            onChange={(e) => handleSystemUpdate('locale_date_format', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-semibold outline-none"
                                        >
                                            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default Settings;
