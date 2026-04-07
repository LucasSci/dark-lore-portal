import type { ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface StoryEngineReferenceStripProps {
  references: string[];
  onRemoveReference: (index: number) => void;
  onAddReference: (event: ChangeEvent<HTMLInputElement>) => void;
  compact?: boolean;
}

export default function StoryEngineReferenceStrip({
  references,
  onRemoveReference,
  onAddReference,
  compact = false,
}: StoryEngineReferenceStripProps) {
  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4 xl:grid-cols-5")}>
      {references.map((reference, index) => (
        <div
          key={`${reference.slice(0, 48)}-${index}`}
          className="group relative aspect-square overflow-hidden border border-[hsl(var(--outline-variant)/0.16)] bg-[hsl(var(--surface-base)/0.88)]"
        >
          <img
            src={reference}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <button
            type="button"
            onClick={() => onRemoveReference(index)}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center border border-[hsl(var(--destructive-foreground)/0.22)] bg-[hsl(var(--background-strong)/0.86)] text-status-bad opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remover referencia"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <label className="flex aspect-square cursor-pointer items-center justify-center border border-dashed border-[hsl(var(--outline-variant)/0.22)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.82),hsl(var(--surface-base)/0.92))] text-foreground/54 transition-colors hover:border-[hsl(var(--brand)/0.26)] hover:text-brand">
        <Plus className="h-5 w-5" />
        <span className="sr-only">Adicionar referencia</span>
        <input type="file" accept="image/*" onChange={onAddReference} className="hidden" />
      </label>
    </div>
  );
}
