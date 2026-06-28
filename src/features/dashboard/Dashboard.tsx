import {
  BarChart3,
  BrainCircuit,
  Database,
  FileText,
  FolderKanban,
  TriangleAlert,
} from "lucide-react";

import EmptyState from "@/shared/components/EmptyState";
import MetricCard from "@/shared/components/MetricCard";
import PageHeader from "@/shared/components/PageHeader";
import { useReviewStore } from "@/store/review.store";

export default function Dashboard() {
  const { items } = useReviewStore();

  return (
    <div className="space-y-10">

      <PageHeader
        title="Dashboard"
        description="Monitor customer feedback, incidents and AI powered insights."
      />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">

        <MetricCard
          title="Projects"
          value="0"
          subtitle="No active projects"
          icon={FolderKanban}
        />

        <MetricCard
          title="Sources"
          value="0"
          subtitle="No connected sources"
          icon={Database}
        />

        <MetricCard
          title="Reviews Imported"
          value={items.length}
          subtitle="Imported records"
          icon={BarChart3}
        />

        <MetricCard
          title="Critical Issues"
          value="—"
          subtitle="No analysis"
          icon={TriangleAlert}
          color="text-red-500"
        />

        <MetricCard
          title="AI Analysis"
          value="—"
          subtitle="Not started"
          icon={BrainCircuit}
          color="text-violet-500"
        />

        <MetricCard
          title="Reports"
          value="0"
          subtitle="Nothing exported"
          icon={FileText}
        />

      </div>

      <EmptyState
        title="No customer data imported"
        description="Connect Google Play, App Store, Reddit, GitHub, Trustpilot, upload Excel or CSV files, or paste customer feedback to begin."
      />

    </div>
  );
}