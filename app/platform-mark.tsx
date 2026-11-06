import type { Platform } from "@/lib/db/schema";

import { platformPaths } from "./platform-paths";

export function PlatformMark({ platform }: { platform: Platform }) {
  return (
    <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d={platformPaths[platform]} />
    </svg>
  );
}
