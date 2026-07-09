"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { DepartmentScore } from "@/lib/simulation/types";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @react-three/fiber renders WebGL, which doesn't exist on the server, and its
 * internals aren't compatible with React 19's SSR export shape. We load the
 * real Canvas-based component with `ssr: false` so it only ever mounts in the
 * browser. Every place that needs the 3D twin should import THIS file, not
 * digital-twin-3d.tsx directly.
 */
const DigitalTwin3DImpl = dynamic(
  () => import("./digital-twin-3d").then((mod) => mod.DigitalTwin3D),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <Skeleton className="h-3/4 w-3/4 rounded-full" />
      </div>
    ),
  }
);

export function DigitalTwin3DClient({ departments, interactive = true }: { departments: DepartmentScore[]; interactive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // The 3D canvas measures its container's exact size the instant it mounts,
  // to set up its camera correctly. If fonts are still loading or an
  // entrance animation is still settling at that exact moment, it can grab
  // a slightly-wrong size — which is why scrolling (an unrelated browser
  // event that happens to force a re-measure) used to "accidentally" fix
  // it. Dispatching a resize event ourselves, once, shortly after mount,
  // makes it self-correct immediately instead of waiting on that.
  useEffect(() => {
    const timers = [100, 400, 900].map((delay) =>
      setTimeout(() => window.dispatchEvent(new Event("resize")), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <DigitalTwin3DImpl departments={departments} interactive={interactive} />
    </div>
  );
}