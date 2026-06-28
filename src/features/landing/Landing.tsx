import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  Shield,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center max-w-3xl">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30">
          <Shield size={40} className="text-white" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            SignalDesk AI
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-400 leading-relaxed">
          Transform customer feedback into actionable insights. Import reviews,
          analyze with AI, and generate crisis response materials in minutes.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/sources"
            data-testid="get-started-btn"
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:scale-[1.02]"
          >
            <Upload size={22} />
            Get Started
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.02] px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.2]"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mt-24 grid max-w-4xl gap-6 md:grid-cols-3">
        {[
          {
            icon: Upload,
            title: "Universal Import",
            desc: "CSV, Excel, JSON, TXT, DOCX. Paste or drag & drop.",
            color: "blue",
          },
          {
            icon: BrainCircuit,
            title: "AI Analysis",
            desc: "Powered by Gemini. Instant issue detection and clustering.",
            color: "purple",
          },
          {
            icon: FileText,
            title: "Ready Reports",
            desc: "Jira tickets, customer emails, status page updates.",
            color: "cyan",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br border transition-all duration-300 group-hover:scale-110 ${
                feature.color === "blue"
                  ? "from-blue-500/20 to-blue-600/10 border-blue-500/20"
                  : feature.color === "purple"
                  ? "from-purple-500/20 to-purple-600/10 border-purple-500/20"
                  : "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20"
              }`}
            >
              <feature.icon
                size={24}
                className={
                  feature.color === "blue"
                    ? "text-blue-400"
                    : feature.color === "purple"
                    ? "text-purple-400"
                    : "text-cyan-400"
                }
              />
            </div>
            <h3 className="font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Powered by */}
      <div className="mt-16 flex items-center gap-2 text-sm text-slate-600">
        <Sparkles size={14} className="text-indigo-500" />
        Powered by advanced AI models
        <span className="mx-2">•</span>
        <Zap size={14} className="text-amber-500" />
        Real-time analysis
      </div>
    </div>
  );
}
