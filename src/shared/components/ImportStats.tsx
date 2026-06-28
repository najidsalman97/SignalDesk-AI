import { BarChart3, Upload } from "lucide-react";

interface Props {
  reviews: number;
  files: number;
}

export default function ImportStats({ reviews, files }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Files Uploaded</p>
            <h2 className="mt-2 text-4xl font-bold">{files}</h2>
          </div>
          <div className="rounded-xl bg-blue-500/10 p-3">
            <Upload size={24} className="text-blue-500" />
          </div>
        </div>
      </div>

      <div className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Reviews Imported</p>
            <h2 className="mt-2 text-4xl font-bold">{reviews}</h2>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <BarChart3 size={24} className="text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
