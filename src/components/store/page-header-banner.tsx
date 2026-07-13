import { ReactNode } from "react";

interface PageHeaderBannerProps {
  image: string;
  children: ReactNode;
  align?: "left" | "center";
  padding?: string;
}

/** İç sayfa başlık banner'ı — arka plan görseli + koyu pembe overlay */
export function PageHeaderBanner({
  image,
  children,
  align = "left",
  padding = "3.5rem 0 2.5rem",
}: PageHeaderBannerProps) {
  return (
    <div style={{ width: "100%", position: "relative", overflow: "hidden" }}>
      <img
        src={image}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(13,13,26,0.93) 0%, rgba(45,10,31,0.85) 55%, rgba(13,13,26,0.9) 100%)",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 20% 50%, rgba(255,79,163,0.12) 0%, transparent 60%)",
      }} />
      <div
        className="container"
        style={{
          position: "relative",
          padding,
          textAlign: align === "center" ? "center" : "left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
