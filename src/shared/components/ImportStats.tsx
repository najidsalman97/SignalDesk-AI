interface Props {
  reviews: number;

  files: number;
}

export default function ImportStats({
  reviews,
  files,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">

      <div className="rounded-2xl border p-8">

        <p className="text-muted-foreground">

          Files Uploaded

        </p>

        <h2 className="mt-3 text-5xl font-bold">

          {files}

        </h2>

      </div>

      <div className="rounded-2xl border p-8">

        <p className="text-muted-foreground">

          Reviews Imported

        </p>

        <h2 className="mt-3 text-5xl font-bold">

          {reviews}

        </h2>

      </div>

    </div>
  );
}