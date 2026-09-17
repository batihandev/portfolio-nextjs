import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name}, ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Centred so the name survives the square crop that chat apps use for small previews.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4efe4",
          color: "#1f1b16",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", fontSize: 108, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>
          <span>{site.firstName}</span>
          <span>{site.familyName}</span>
        </div>
        <div style={{ marginTop: 26, fontSize: 44, fontWeight: 700, color: "#e4572e" }}>{site.role}</div>
        <div style={{ marginTop: 22, fontSize: 30, color: "#6b6154" }}>{site.tagline}</div>
        <div style={{ position: "absolute", bottom: 44, fontSize: 24, letterSpacing: 2, color: "#6b6154" }}>
          {site.url.replace("https://", "")}
        </div>
      </div>
    ),
    size,
  );
}
