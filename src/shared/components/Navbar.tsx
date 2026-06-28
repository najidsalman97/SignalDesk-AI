import {
  Bell,
  Moon,
  Search,
  Sun,
  FolderKanban,
} from "lucide-react";

import { useTheme } from "next-themes";

import { useSettingsStore } from "@/store/settings.store";

export default function Navbar() {

  const { theme, setTheme } =
    useTheme();

  const { project } =
    useSettingsStore();

  return (
    <header className="flex h-20 items-center justify-between border-b px-8">

      <div>

        <div className="flex items-center gap-3">

          <FolderKanban
            size={20}
          />

          <h2 className="font-semibold">

            {project}

          </h2>

        </div>

      </div>

      <div className="relative w-[450px]">

        <Search
          className="absolute left-4 top-3.5"
          size={18}
        />

        <input
          placeholder="Search projects, reports, reviews..."
          className="w-full rounded-xl border py-3 pl-11"
        />

      </div>

      <div className="flex gap-3">

        <button
          className="rounded-xl border p-3"
          onClick={() =>
            setTheme(
              theme === "dark"
                ? "light"
                : "dark"
            )
          }
        >
          {theme === "dark"
            ? <Sun size={18}/>
            : <Moon size={18}/>}
        </button>

        <button
          className="rounded-xl border p-3"
        >
          <Bell size={18}/>
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">

          S

        </div>

      </div>

    </header>
  );
}