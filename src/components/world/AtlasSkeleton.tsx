import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AtlasSkeletonProps {
  className?: string;
  compact?: boolean;
  immersive?: boolean;
}

export default function AtlasSkeleton({
  className,
  compact = false,
  immersive = false,
}: AtlasSkeletonProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(173,132,77,0.16),transparent_32%),linear-gradient(180deg,rgba(16,12,9,0.96),rgba(9,7,6,0.98))] p-4 md:p-6",
        className,
      )}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-56 max-w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        <div className="tool-stage-frame relative flex-1 overflow-hidden bg-background/30">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute inset-x-8 top-8 flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="absolute left-[14%] top-[24%] h-14 w-14 border border-primary/30 bg-primary/15" />
          <div className="absolute left-[44%] top-[44%] h-20 w-20 border border-primary/30 bg-primary/15" />
          <div className="absolute right-[18%] top-[28%] h-16 w-16 border border-primary/30 bg-primary/15" />
          <div className="absolute bottom-[18%] left-[28%] h-12 w-12 border border-primary/30 bg-primary/15" />
        </div>

        <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-3")}>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          {!compact || immersive ? <Skeleton className="h-20 w-full" /> : null}
        </div>
      </div>
    </div>
  );
}
