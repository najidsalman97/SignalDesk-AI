import { useState } from "react";

interface Props {
  onImport(text: string): void;
}

export default function PasteReviews({
  onImport,
}: Props) {
  const [value, setValue] =
    useState("");

  return (
    <div className="rounded-3xl border p-8">

      <h2 className="text-2xl font-bold">

        Paste Reviews

      </h2>

      <p className="mt-2 text-muted-foreground">

        One review per line.

      </p>

      <textarea
        value={value}
        onChange={(e) =>
          setValue(e.target.value)
        }
        className="mt-6 h-60 w-full rounded-xl border p-4"
      />

      <button
        className="mt-5 rounded-xl bg-primary px-6 py-3 text-primary-foreground"
        onClick={() => {
          onImport(value);

          setValue("");
        }}
      >
        Import Reviews
      </button>

    </div>
  );
}