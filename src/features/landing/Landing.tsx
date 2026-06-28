import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  Shield,
  Upload,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Shield size={40} className="text-primary" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight">
          Welcome to SignalDesk AI
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
          Transform customer feedback into actionable insights. Import reviews,
          analyze with AI, and generate crisis response materials in minutes.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/sources"
            data-testid="get-started-btn"
            className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <Upload size={22} />
            Get Started
            <ArrowRight size={20} />
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-2xl border px-8 py-4 text-lg font-semibold transition-colors hover:bg-accent"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mt-20 grid max-w-4xl gap-8 md:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
            <Upload size={24} className="text-blue-500" />
          </div>
          <h3 className="font-semibold">Universal Import</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            CSV, Excel, JSON, TXT, DOCX. Paste or drag & drop.
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10">
            <BrainCircuit size={24} className="text-violet-500" />
          </div>
          <h3 className="font-semibold">AI Analysis</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Powered by Gemini. Instant issue detection and clustering.
          </p>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10">
            <FileText size={24} className="text-emerald-500" />
          </div>
          <h3 className="font-semibold">Ready Reports</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Jira tickets, customer emails, status page updates.
          </p>
        </div>
      </div>
    </div>
  );
}
