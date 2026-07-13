"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface SlideData {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
  buttonText?: string | null;
  badge?: string;
}

interface HeroSliderProps {
  slides: SlideData[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = useCallback(() => go((current + 1) % slides.length), [current, go, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <section style={{
      width: "100%",
      position: "relative",
      overflow: "hidden",
      background: "#0d0d1a",
    }}>
      {/* Slides */}
      <div style={{ position: "relative", aspectRatio: "21/9", minHeight: 320, maxHeight: 620 }}>
        {slides.map((s, i) => (
          <div key={s.id} style={{
            position: "absolute", inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.7s ease",
            pointerEvents: i === current ? "auto" : "none",
          }}>
            <img
              src={s.image}
              alt={s.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
            {/* Overlay gradient */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)",
            }} />

            {/* Content */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center",
            }}>
              <div className="container">
                <div style={{ maxWidth: 560 }}>
                  {s.badge && (
                    <span className="badge-18" style={{ display: "inline-flex", marginBottom: "1rem" }}>
                      {s.badge}
                    </span>
                  )}
                  <h2 style={{
                    fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    marginBottom: "0.75rem",
                    textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                  }}>
                    {s.title}
                  </h2>
                  {s.subtitle && (
                    <p style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "1rem",
                      marginBottom: "1.75rem",
                      lineHeight: 1.6,
                    }}>
                      {s.subtitle}
                    </p>
                  )}
                  <Link href={s.link ?? "/products"} className="btn-primary">
                    {s.buttonText ?? "Alışverişe Başla"} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button onClick={prev} style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
              zIndex: 10,
            }}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} style={{
              position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
              zIndex: 10,
            }}>
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 8, zIndex: 10,
          }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => go(i)} style={{
                width: i === current ? 28 : 8,
                height: 8,
                borderRadius: 99,
                background: i === current ? "#FF4FA3" : "rgba(255,255,255,0.4)",
                border: "none", cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
