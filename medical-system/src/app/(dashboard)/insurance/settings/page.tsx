
import { Settings, Shield, Bell, User, Lock } from "lucide-react";

export default function InsuranceSettingsPage() {
    const sections = [
        { name: "Account Profile", icon: User, desc: "Manage your personal information and profile picture." },
        { name: "Security", icon: Lock, desc: "Update your password and 2FA settings." },
        { name: "Notifications", icon: Bell, desc: "Choose what alerts you want to receive." },
        { name: "Access Control", icon: Shield, desc: "Manage API keys and department permissions." },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Settings className="h-8 w-8 text-purple-400" />
                    Portal Settings
                </h1>
                <p className="text-white/50 mt-2">Configure your portal experience and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sections.map((section, i) => (
                    <div key={i} className="glass p-6 flex items-center justify-between group hover:bg-white/[0.04] transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-purple-500/10 transition-colors">
                                <section.icon className="h-6 w-6 text-white/40 group-hover:text-purple-400 transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{section.name}</h3>
                                <p className="text-sm text-white/30">{section.desc}</p>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-blue-400 hover:text-blue-300">Edit</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
