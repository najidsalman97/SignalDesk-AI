import { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, FolderOpen, Upload } from "lucide-react";
import clsx from "clsx";

interface Props {
  onFiles(files: File[]): void;
  disabled?: boolean;
}

export default function FileDropzone({ onFiles, disabled }: Props) {
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!folderInputRef.current) return;
    folderInputRef.current.setAttribute("webkitdirectory", "");
    folderInputRef.current.setAttribute("directory", "");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    disabled,
    onDrop(files) {
      onFiles(files);
    },
  });

  function openFolderPicker() {
    folderInputRef.current?.click();
  }

  function folderChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      onFiles(files);
    }
    event.target.value = "";
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={clsx(
          "group cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-muted hover:border-primary/50 hover:bg-accent/50",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} data-testid="file-input" />

        <div
          className={clsx(
            "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
            isDragActive
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
        >
          {isDragActive ? (
            <FileUp size={28} className="animate-bounce" />
          ) : (
            <Upload size={28} />
          )}
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          {isDragActive ? "Drop files here" : "Drag & Drop Files"}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          CSV, Excel, JSON, TXT, DOCX — or click to browse
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            Choose Files
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openFolderPicker}
          disabled={disabled}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          <FolderOpen size={18} />
          Import Folder
        </button>
        <span className="text-sm text-muted-foreground">
          Import all supported files from a folder
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
