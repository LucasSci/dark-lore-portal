import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast ornate-frame group-[.toaster]:rounded-none group-[.toaster]:border group-[.toaster]:border-[hsl(var(--brand)/0.16)] group-[.toaster]:bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.94),hsl(var(--surface-raised)/0.94)_36%,hsl(var(--background-strong)/0.98))] group-[.toaster]:text-foreground group-[.toaster]:shadow-elevated",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:rounded-none group-[.toast]:border group-[.toast]:border-[hsl(var(--brand)/0.24)] group-[.toast]:bg-[linear-gradient(135deg,hsl(47_100%_82%),hsl(var(--primary))_42%,hsl(var(--warning))_100%)] group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-none group-[.toast]:border group-[.toast]:border-[hsl(var(--outline-variant)/0.18)] group-[.toast]:bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.9),hsl(var(--surface-base)/0.96))] group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
