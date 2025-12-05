"use client";

import { useState } from "react";

export default function Settings() {
    const [eventSettings, setEventSettings] = useState({
        eventName: "FNB Corporate Event 2025",
        tokensPerEmployee: 18,
        eventDate: "",
        eventLocation: "",
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // Placeholder for save functionality
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        alert("Settings saved successfully!");
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
                <p className="text-[var(--muted)] mt-1">Manage event configuration and system preferences</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Event Settings */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-[var(--fnb-teal-light)]">
                            <svg className="w-5 h-5 text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Event Configuration</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Event Name</label>
                            <input
                                type="text"
                                value={eventSettings.eventName}
                                onChange={(e) => setEventSettings({ ...eventSettings, eventName: e.target.value })}
                                className="input-base w-full text-[var(--foreground)]"
                                placeholder="Enter event name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Tokens Per Employee</label>
                            <input
                                type="number"
                                value={eventSettings.tokensPerEmployee}
                                onChange={(e) => setEventSettings({ ...eventSettings, tokensPerEmployee: parseInt(e.target.value) })}
                                className="input-base w-full text-[var(--foreground)]"
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Event Date</label>
                            <input
                                type="date"
                                value={eventSettings.eventDate}
                                onChange={(e) => setEventSettings({ ...eventSettings, eventDate: e.target.value })}
                                className="input-base w-full text-[var(--foreground)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Event Location</label>
                            <input
                                type="text"
                                value={eventSettings.eventLocation}
                                onChange={(e) => setEventSettings({ ...eventSettings, eventLocation: e.target.value })}
                                className="input-base w-full text-[var(--foreground)]"
                                placeholder="Enter event location"
                            />
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-[#EDE9FE]">
                            <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">System Preferences</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)] border border-[var(--border-light)]">
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Allow Self-Registration</p>
                                <p className="text-sm text-[var(--muted)]">Employees can register themselves via QR code</p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--fnb-teal)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--fnb-teal)] focus:ring-offset-2">
                                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)] border border-[var(--border-light)]">
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Email Notifications</p>
                                <p className="text-sm text-[var(--muted)]">Send email alerts for important events</p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--border)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--fnb-teal)] focus:ring-offset-2">
                                <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--background)] border border-[var(--border-light)]">
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Scanner Sound Feedback</p>
                                <p className="text-sm text-[var(--muted)]">Play sounds on successful/failed scans</p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--fnb-teal)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--fnb-teal)] focus:ring-offset-2">
                                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--error)]/30 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-[var(--error-light)]">
                            <svg className="w-5 h-5 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--error)]">Danger Zone</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--error)]/20">
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Reset All Balances</p>
                                <p className="text-sm text-[var(--muted)]">Set all employee token balances to initial allocation</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error-light)] transition-colors text-sm font-medium">
                                Reset
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--error)]/20">
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Clear Event Data</p>
                                <p className="text-sm text-[var(--muted)]">Delete all transactions and reset event</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error-light)] transition-colors text-sm font-medium">
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-[var(--fnb-orange-light)]">
                            <svg className="w-5 h-5 text-[var(--fnb-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Data Management</h2>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--background)] border border-[var(--border-light)] hover:border-[var(--fnb-teal)] transition-colors group">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <div className="text-left">
                                    <p className="font-medium text-[var(--foreground)]">Import Employees</p>
                                    <p className="text-sm text-[var(--muted)]">Upload CSV or Excel file</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--background)] border border-[var(--border-light)] hover:border-[var(--fnb-teal)] transition-colors group">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <div className="text-left">
                                    <p className="font-medium text-[var(--foreground)]">Export All Data</p>
                                    <p className="text-sm text-[var(--muted)]">Download complete event data</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--background)] border border-[var(--border-light)] hover:border-[var(--fnb-teal)] transition-colors group">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <div className="text-left">
                                    <p className="font-medium text-[var(--foreground)]">Backup Database</p>
                                    <p className="text-sm text-[var(--muted)]">Create a full backup</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60"
                >
                    {saving ? (
                        <>
                            <div className="spinner w-4 h-4" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
