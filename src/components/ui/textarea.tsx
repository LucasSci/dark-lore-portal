import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
      <textarea
        className={cn(
          "flex min-h-[110px] w-full rounded-none border border-[hsl(var(--outline-variant)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.86),hsl(var(--surface-base)/0.94))] px-3 py-3 text-sm leading-6 text-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)] ring-offset-background transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground/88 focus-visible:border-[hsl(var(--brand)/0.46)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
