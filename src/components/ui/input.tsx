import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-none border-x-0 border-b border-t-0 border-[hsl(var(--outline-variant)/0.4)] bg-transparent px-1 py-2 text-base text-foreground ring-offset-background transition-[border-color,box-shadow,background-color] duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/90 focus-visible:border-[hsl(var(--brand)/0.72)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_12px_32px_hsl(var(--brand)/0.08)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
