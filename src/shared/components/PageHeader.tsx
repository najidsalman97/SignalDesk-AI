interface Props {
  title: string;
  description: string;
}

export default function PageHeader({
  title,
  description,
}: Props) {
  return (
    <div className="space-y-2">

      <h1 className="text-4xl font-bold tracking-tight">
        {title}
      </h1>

      <p className="text-muted-foreground">
        {description}
      </p>

    </div>
  );
}