"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";

interface LocationSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  searchable?: boolean;
}

export function LocationSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
  required = false,
  searchable = false,
}: LocationSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filtered = searchable && query.trim()
    ? options.filter((o) => o.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")))
    : options;

  const triggerClass = [
    "location-select-trigger",
    value ? "has-value" : "",
    error ? "is-error" : "",
    open ? "is-open" : "",
    disabled ? "is-disabled" : "",
  ].filter(Boolean).join(" ");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlight(0);
    }
  }, [open]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function selectOption(opt: string) {
    onChange(opt);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight(0);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
    if (e.key === "Enter" && filtered[highlight]) {
      e.preventDefault();
      selectOption(filtered[highlight]);
    }
  }

  return (
    <div className="location-select" ref={wrapRef}>
      <label className={`form-label${required ? " form-label-required" : ""}`}>
        {label}
      </label>

      <button
        type="button"
        className={triggerClass}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <MapPin size={14} className="location-select-icon" aria-hidden />
        <span className={value ? "location-select-value" : "location-select-placeholder"}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className="location-select-chevron" aria-hidden />
      </button>

      {open && !disabled && (
        <div className="location-select-panel" onKeyDown={onListKeyDown}>
          {searchable && (
            <div className="location-select-search">
              <Search size={14} aria-hidden />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                placeholder="Ara..."
                autoFocus
              />
            </div>
          )}
          <ul id={listId} role="listbox" className="location-select-list">
            {filtered.length === 0 ? (
              <li className="location-select-empty">Sonuç bulunamadı</li>
            ) : (
              filtered.map((opt, i) => (
                <li key={opt} role="option" aria-selected={value === opt}>
                  <button
                    type="button"
                    className={[
                      "location-select-option",
                      value === opt ? "is-selected" : "",
                      highlight === i ? "is-highlighted" : "",
                    ].filter(Boolean).join(" ")}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => selectOption(opt)}
                  >
                    <span>{opt}</span>
                    {value === opt && <Check size={14} strokeWidth={2.5} aria-hidden />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
