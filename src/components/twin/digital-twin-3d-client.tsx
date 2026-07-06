"use client";

import dynamic from "next/dynamic";
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
  return <DigitalTwin3DImpl departments={departments} interactive={interactive} />;
}
