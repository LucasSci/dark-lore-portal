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
            "group toast group-[.toaster]:rounded-[var(--radius)] group-[.toaster]:border-border/80 group-[.toaster]:bg-card/95 group-[.toaster]:text-foreground group-[.toaster]:shadow-panel",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:border group-[.toast]:border-primary/35 group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:border group-[.toast]:border-border/70 group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
