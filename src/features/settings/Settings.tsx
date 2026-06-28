import { useState } from "react";

import { useSettingsStore } from "@/store/settings.store";

export default function Settings() {
  const { providers, addProvider } =
    useSettingsStore();

  const [provider, setProvider] =
    useState("gemini");

  const [model, setModel] =
    useState("");

  const [key, setKey] =
    useState("");

  return (
    <div className="mx-auto max-w-3xl space-y-8">

      <div>

        <h1 className="text-4xl font-bold">

          AI Settings

        </h1>

        <p className="text-muted-foreground">

          API keys stay inside this browser.

        </p>

      </div>

      <div className="space-y-5 rounded-2xl border p-8">

        <select
          value={provider}
          onChange={(e) =>
            setProvider(e.target.value)
          }
          className="w-full rounded-xl border p-3"
        >
          <option value="gemini">

            Gemini

          </option>

          <option value="openai">

            OpenAI

          </option>

          <option value="openrouter">

            OpenRouter

          </option>

        </select>

        <input
          placeholder="Model"

          value={model}

          onChange={(e) =>
            setModel(e.target.value)
          }

          className="w-full rounded-xl border p-3"
        />

        <input
          placeholder="API Key"

          type="password"

          value={key}

          onChange={(e) =>
            setKey(e.target.value)
          }

          className="w-full rounded-xl border p-3"
        />

        <button
          className="rounded-xl bg-primary px-6 py-3 text-primary-foreground"
          onClick={() => {
            addProvider({
              provider: provider as any,
              model,
              apiKey: key,
              enabled: true,
            });

            setKey("");

            alert("Saved");
          }}
        >
          Save Provider
        </button>

      </div>

      <div className="rounded-2xl border p-6">

        <h2 className="mb-6 text-2xl font-bold">

          Configured Providers

        </h2>

        {providers.length === 0 && (

          <p>

            None configured

          </p>

        )}

        {providers.map((provider) => (

          <div
            key={provider.provider}
            className="mb-3 flex items-center justify-between rounded-xl border p-4"
          >

            <div>

              <h3 className="font-semibold">

                {provider.provider}

              </h3>

              <p className="text-sm text-muted-foreground">

                {provider.model}

              </p>

            </div>

            <div>

              ✅

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}