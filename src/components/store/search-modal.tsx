"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string;
  category?: { name: string } | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(n);
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Escape tuşu ile kapat */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  /* Açılınca input'a odaklan */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Debounced arama */
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(val: string) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 350);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div className="search-modal" style={{
        position: "fixed", top: "10%", left: "50%",
        transform: "translateX(-50%)",
        width: "min(640px, 94vw)",
        zIndex: 101,
        background: "white",
        borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        overflow: "hidden",
      }}>
        {/* Input alanı */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "1rem 1.25rem",
          borderBottom: "1px solid #f3f4f6",
        }}>
          {loading
            ? <Loader2 size={20} color="#FF4FA3" style={{ flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
            : <Search size={20} color="#9ca3af" style={{ flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="Ürün ara... (ör. babydoll, korse, jartiyer)"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: "1rem", color: "#111827",
              background: "transparent",
            }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }} style={{
              border: "none", background: "#f3f4f6", borderRadius: 8,
              width: 28, height: 28, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6b7280", flexShrink: 0,
            }}>
              <X size={14} />
            </button>
          )}
          <button onClick={onClose} style={{
            border: "none", background: "none", cursor: "pointer",
            color: "#9ca3af", padding: 4, flexShrink: 0,
          }}>
            <span style={{ fontSize: "0.7rem", background: "#f3f4f6", borderRadius: 6, padding: "3px 7px", color: "#6b7280" }}>ESC</span>
          </button>
        </div>

        {/* Sonuçlar */}
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {query.length < 2 && (
            <div style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>En az 2 karakter girin</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
                {["babydoll", "korse", "jartiyer", "kostüm", "gecelik"].map(tag => (
                  <button key={tag} onClick={() => handleChange(tag)} style={{
                    padding: "5px 14px", borderRadius: 99,
                    border: "1.5px solid #e5e7eb", background: "white",
                    fontSize: "0.8rem", color: "#374151", cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                "<strong style={{ color: "#374151" }}>{query}</strong>" için sonuç bulunamadı
              </p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div style={{ padding: "0.5rem 1.25rem 0.25rem" }}>
                <p style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {results.length} Ürün Bulundu
                </p>
              </div>
              {results.map(r => (
                <Link
                  key={r.id}
                  href={`/products/${r.handle}`}
                  onClick={onClose}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.75rem 1.25rem",
                    textDecoration: "none",
                    borderBottom: "1px solid #f9fafb",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fff0f7")}
                  onMouseLeave={e => (e.currentTarget.style.background = "white")}
                >
                  {/* Görsel */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 10,
                    overflow: "hidden", flexShrink: 0,
                    background: "#f3f4f6",
                  }}>
                    {r.image
                      ? <img src={r.image} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 20 }}>🛍</div>
                    }
                  </div>

                  {/* Bilgi */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.title}
                    </p>
                    {r.category && (
                      <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>{r.category.name}</p>
                    )}
                  </div>

                  {/* Fiyat */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, color: "#FF4FA3", fontSize: "0.95rem" }}>{fmt(r.price)}</p>
                    {r.compareAtPrice && r.compareAtPrice > r.price && (
                      <p style={{ fontSize: "0.72rem", color: "#9ca3af", textDecoration: "line-through" }}>{fmt(r.compareAtPrice)}</p>
                    )}
                  </div>

                  <ArrowRight size={14} color="#d1d5db" style={{ flexShrink: 0 }} />
                </Link>
              ))}

              {/* Tümünü gör */}
              <Link href={`/products?search=${encodeURIComponent(query)}`} onClick={onClose} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "0.875rem",
                background: "#f9fafb", borderTop: "1px solid #f3f4f6",
                color: "#FF4FA3", fontSize: "0.83rem", fontWeight: 600,
                textDecoration: "none",
              }}>
                Tüm sonuçları gör <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
