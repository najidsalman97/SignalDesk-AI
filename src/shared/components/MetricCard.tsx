import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import clsx from "clsx";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "text-blue-500",
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        "group rounded-2xl border bg-card p-6 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl"
      )}
    >
      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}

        </div>

        <div
          className={clsx(
            "rounded-xl bg-muted p-3",
            color
          )}
        >
          <Icon size={24} />
        </div>

      </div>

      {trend && (

        <div className="mt-5 flex items-center gap-2 text-sm">

          <TrendingUp size={16} />

          {trend}

        </div>

      )}

    </div>
  );
}