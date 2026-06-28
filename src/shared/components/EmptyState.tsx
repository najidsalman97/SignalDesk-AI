import { Inbox, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionLink?: string;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  actionLink,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 px-8" data-testid="empty-state">
      <div className="rounded-2xl bg-muted p-5">
        <Icon size={32} className="text-muted-foreground" />
      </div>

      <h2 className="mt-6 text-xl font-semibold">{title}</h2>

      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
