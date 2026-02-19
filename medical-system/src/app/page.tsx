import Link from "next/link";
import { ArrowRight, Shield, Activity, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navbar */}
      <header className="px-6 py-6 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/50 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Shield className="h-6 w-6 text-cyan-400" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">NFC<span className="text-cyan-400">Health</span></span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-5 py-2 rounded-full text-sm font-semibold border border-cyan-500/20 transition-all">
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Glow Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">

          {/* Center Glow Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-cyan-400 backdrop-blur-md mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              System Operational
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Medical Identity.
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Cryptographically secure health records accessible via NFC.
              Connecting patients, hospitals, and insurers in a trustless network.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/signup/patient"
                className="group relative w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:pr-6 hover:pl-10 transition-all flex items-center justify-center gap-2 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
                <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>

              <Link href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 text-white border border-slate-700 rounded-2xl font-semibold text-lg hover:bg-slate-800 hover:border-cyan-500/50 transition-all backdrop-blur-sm">
                Sign In
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="py-8 border-t border-slate-800/50 text-center text-slate-500 text-sm flex justify-between px-8">
        <p>&copy; 2026 NFC Health System. Secured by Cryptography.</p>
        <Link href="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
      </footer>
    </div>
  );
}

function GlassCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 transition-all hover:bg-slate-800/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] group">
      <div className="mb-6 h-12 w-12 rounded-2xl bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}
