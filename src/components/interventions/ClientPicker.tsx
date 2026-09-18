"use client";

import { useEffect, useRef, useState } from "react";
import { searchClients, type ClientSearchResult } from "@/lib/actions/clients";

export function ClientPicker({ error }: { error?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [selected, setSelected] = useState<ClientSearchResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const found = await searchClients(query);
      setResults(found);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="client-search" className="text-sm font-medium text-brand-ink">
        Client
      </label>
      <input type="hidden" name="clientId" value={selected?.id ?? ""} />

      {selected ? (
        <div className="flex items-center justify-between rounded-xl border border-brand-green/40 bg-brand-green/10 px-4 py-3">
          <span className="text-sm font-medium text-brand-ink">
            {selected.first_name} {selected.last_name}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setQuery("");
              setResults([]);
            }}
            className="text-xs font-semibold text-brand-green-dark"
          >
            Changer
          </button>
        </div>
      ) : (
        <>
          <input
            id="client-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par prénom ou nom..."
            autoComplete="off"
            className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
          {results.length > 0 ? (
            <div className="flex flex-col overflow-hidden rounded-xl border border-brand-ink/10 bg-white">
              {results.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setSelected(client);
                    setResults([]);
                  }}
                  className="border-b border-brand-ink/5 px-4 py-2.5 text-left text-sm text-brand-ink last:border-0"
                >
                  {client.first_name} {client.last_name}
                  {client.city ? (
                    <span className="text-brand-ink/65"> · {client.city}</span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
