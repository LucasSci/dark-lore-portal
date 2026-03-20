import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "relic-input flex h-11 w-full rounded-none px-3 py-2 text-base text-foreground ring-offset-background transition-[border-color,box-shadow,background-color] duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/90 focus-visible:border-[hsl(var(--brand)/0.48)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_16px_34px_hsl(var(--brand)/0.1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
