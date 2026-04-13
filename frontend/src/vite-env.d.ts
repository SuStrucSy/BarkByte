/// <reference types="vite/client" />

// Allow importing SVG files as React components via the `?react` suffix.
declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";

  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare function gtag(...args: unknown[]): void;
