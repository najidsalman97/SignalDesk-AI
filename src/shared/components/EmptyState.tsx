import { Inbox } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

export default function EmptyState({
  title,
  description,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed p-20">

      <div className="rounded-full bg-muted p-5">

        <Inbox size={36} />

      </div>

      <h2 className="mt-6 text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-3 max-w-lg text-center text-muted-foreground">
        {description}
      </p>

    </div>
  );
}