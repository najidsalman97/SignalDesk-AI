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
          "group relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 overflow-hidden",
          isDragActive
            ? "border-indigo-500/50 bg-indigo-500/5 scale-[1.01]"
            : "border-white/[0.1] hover:border-indigo-500/30 hover:bg-white/[0.02]",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        {/* Animated gradient border on drag */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse" />
        )}

        <input {...getInputProps()} data-testid="file-input" />

        <div
          className={clsx(
            "relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
            isDragActive
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-110 shadow-lg shadow-indigo-500/30"
              : "bg-white/[0.04] text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
          )}
        >
          {isDragActive ? (
            <FileUp size={28} className="animate-bounce" />
          ) : (
            <Upload size={28} />
          )}
        </div>

        <h2 className="relative mt-5 text-xl font-semibold text-white">
          {isDragActive ? "Drop files here" : "Drag & Drop Files"}
        </h2>

        <p className="relative mt-2 text-sm text-slate-500">
          CSV, Excel, JSON, TXT, DOCX — or click to browse
        </p>

        <div className="relative mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl"
          >
            Choose Files
          </button>
        </div>

        {/* Supported formats */}
        <div className="relative mt-6 flex items-center justify-center gap-3 text-xs text-slate-600">
          {[".csv", ".xlsx", ".json", ".txt", ".docx"].map((ext) => (
            <span key={ext} className="rounded-md bg-white/[0.04] px-2 py-1">
              {ext}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openFolderPicker}
          disabled={disabled}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 font-medium text-slate-300 transition-all hover:bg-white/[0.06] disabled:opacity-50"
        >
          <FolderOpen size={18} />
          Import Folder
        </button>
        <span className="text-sm text-slate-600">
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
