"use client";

import { useSyncExternalStore } from "react";
import { code128 } from "@/lib/code128";

const subscribe = (onChange: () => void) => {
  const media = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const useDevicePixelRatio = () =>
  useSyncExternalStore(
    subscribe,
    () => devicePixelRatio,
    () => 1,
  );

const bars = (modules: string) =>
  Array.from(modules.matchAll(/1+/g), (run) => ({ x: run.index, width: run[0].length }));

// A real Code 128 barcode, black on white whatever the theme. Each module is a whole number of device pixels, so scanners read it from any screen.
export const Barcode = ({ value }: { value: string }) => {
  const dpr = useDevicePixelRatio();
  const modules = code128(value);
  const width = (modules.length * Math.max(1, Math.floor(dpr))) / dpr;
  return (
    <svg
      viewBox={`0 0 ${modules.length} 48`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      style={{ width, paddingInline: 12 }}
      className="mx-auto mt-3.5 box-content block h-12 bg-white fill-black"
      role="img"
      aria-label="Barcode"
    >
      {bars(modules).map((bar) => (
        <rect key={bar.x} x={bar.x} y="0" width={bar.width} height="48" />
      ))}
    </svg>
  );
};
