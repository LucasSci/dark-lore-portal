import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PageContainerSize = "narrow" | "default" | "wide" | "full";

const sizeClasses: Record<PageContainerSize, string> = {
  narrow: "mx-auto w-full max-w-5xl px-4 md:px-6",
  default: "mx-auto w-full max-w-7xl px-4 md:px-6",
  wide: "mx-auto w-full max-w-[88rem] px-4 md:px-6",
  full: "mx-auto w-full px-4 md:px-6",
};

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: PageContainerSize;
}

export default function PageContainer({
  className,
  size = "default",
  ...props
}: PageContainerProps) {
  return <div className={cn(sizeClasses[size], className)} {...props} />;
}
