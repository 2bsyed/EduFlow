"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { quickSearchAction, SearchResult } from "@/actions/search";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>({ students: [], teachers: [], batches: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ students: [], teachers: [], batches: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await quickSearchAction(query);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results.students.length > 0 || results.teachers.length > 0 || results.batches.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-[500px]">
      <div className="relative w-full">
        <Icon
          name="search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search students, batches, teachers..."
          className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-[#F9FAFB] pl-10 pr-20 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1570EF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500 shadow-2xs">
          Ctrl + K
        </span>
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          {loading ? (
            <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-[#1570EF]" />
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="py-4 text-center text-xs text-slate-500">
              No matching students, batches, or teachers found.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-3 divide-y divide-slate-100 text-sm">
              {results.students.length > 0 && (
                <div className="pt-1 first:pt-0">
                  <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Students
                  </p>
                  {results.students.map((s) => (
                    <Link
                      key={s.id}
                      href={s.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-800">{s.name}</span>
                      {s.rollNo && (
                        <span className="text-xs text-slate-500">Roll: {s.rollNo}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {results.batches.length > 0 && (
                <div className="pt-2">
                  <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Batches
                  </p>
                  {results.batches.map((b) => (
                    <Link
                      key={b.id}
                      href={b.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-800">{b.name}</span>
                      {b.subject && (
                        <span className="text-xs text-slate-500">{b.subject}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {results.teachers.length > 0 && (
                <div className="pt-2">
                  <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Teachers
                  </p>
                  {results.teachers.map((t) => (
                    <Link
                      key={t.id}
                      href={t.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-800">{t.name}</span>
                      {t.subject && (
                        <span className="text-xs text-slate-500">{t.subject}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
