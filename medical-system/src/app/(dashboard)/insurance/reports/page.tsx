
import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react";

export default function InsuranceReportsPage() {
    const stats = [
        { label: "Claims Growth", value: "+12.5%", sub: "vs last month", icon: TrendingUp, color: "text-emerald-400" },
        { label: "Processing Speed", value: "2.4 Days", sub: "Avg per claim", icon: Calendar, color: "text-blue-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-blue-400" />
                        Reports & Analytics
                    </h1>
                    <p className="text-white/50 mt-2">Comprehensive overview of insurance performance.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium text-sm">
                    <Download className="h-4 w-4" /> Export Data
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="glass p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white/40">{stat.label}</span>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-bold text-white">{stat.value}</h2>
                            <span className="text-xs text-white/30">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass p-8 h-64 flex items-center justify-center border-dashed">
                <p className="text-white/20 font-medium">Chart visualization loading...</p>
            </div>
        </div>
    );
}
