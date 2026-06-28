import { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFiles(files: File[]): void;
}

export default function FileDropzone({
  onFiles,
}: Props) {
  const folderInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!folderInputRef.current) {
      return;
    }

    folderInputRef.current.setAttribute(
      "webkitdirectory",
      ""
    );

    folderInputRef.current.setAttribute(
      "directory",
      ""
    );
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    multiple: true,

    onDrop(files) {
      onFiles(files);
    },
  });

  function openFolderPicker() {
    folderInputRef.current?.click();
  }

  function folderChanged(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length > 0) {
      onFiles(files);
    }

    event.target.value = "";
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted"
        }`}
      >
        <input
          {...getInputProps()}
        />

        <h2 className="text-2xl font-bold">
          {isDragActive
            ? "Drop files here"
            : "Drag & Drop Files"}
        </h2>

        <p className="mt-3 text-muted-foreground">
          CSV, Excel, JSON, TXT and DOCX
        </p>

        <button
          type="button"
          className="mt-6 rounded-xl bg-primary px-5 py-3 text-primary-foreground"
        >
          Choose Files
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openFolderPicker}
          className="rounded-xl border px-5 py-3"
        >
          📁 Import Folder
        </button>

        <span className="text-sm text-muted-foreground">
          Import every supported file from a
          folder.
        </span>
      </div>

      <input
        ref={folderInputRef}
        type="file"
        multiple
        hidden
        onChange={folderChanged}
      />
    </div>
  );
}