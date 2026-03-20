import { Skeleton } from "@/components/ui/skeleton";

export default function RouteFallback() {
  return (
    <div className="container space-y-6 py-8 md:py-10">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-[22rem] max-w-full" />
        <Skeleton className="h-4 w-[34rem] max-w-full" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-[70vh] min-h-[520px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    </div>
  );
}
