import { cn } from "@/lib/utils";

const iconMap = {
  health: "/witcher-system/icons/health.png",
  stamina: "/witcher-system/icons/stamina.png",
  focus: "/witcher-system/icons/focus.png",
  resolve: "/witcher-system/icons/resolve.png",
  adrenaline: "/witcher-system/icons/adrenaline.png",
  scrollWitcher: "/witcher-system/icons/scroll-unfurled-witcher.png",
  scrollFormulae: "/witcher-system/icons/scroll-unfurled-formulae.png",
  necrophages: "/witcher-system/icons/monster-necrophages.png",
  specters: "/witcher-system/icons/monster-specters.png",
  relicts: "/witcher-system/icons/monster-relicts.png",
} as const;

export type WitcherAssetIconName = keyof typeof iconMap;

interface WitcherAssetIconProps {
  name: WitcherAssetIconName;
  alt?: string;
  className?: string;
}

export default function WitcherAssetIcon({
  name,
  alt = "",
  className,
}: WitcherAssetIconProps) {
  return (
    <img
      src={iconMap[name]}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      loading="lazy"
      decoding="async"
      className={cn("h-4 w-4 object-contain", className)}
    />
  );
}
