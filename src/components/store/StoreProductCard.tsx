import type { ComponentType } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Download,
  Map,
  Package,
  ScrollText,
  ShieldPlus,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatStorePrice,
  productTypeLabels,
  type DigitalProductType,
  type StoreProduct,
} from "@/lib/storefront";

const productIcons: Record<DigitalProductType, ComponentType<{ className?: string }>> = {
  livro_pdf: BookOpen,
  mapa: Map,
  token: Sparkles,
  aventura: ScrollText,
  classe: ShieldPlus,
  item: Package,
};

interface StoreProductCardProps {
  product: StoreProduct;
  owned: boolean;
  userAuthenticated: boolean;
  busy: boolean;
  onBuy: (productId: string) => void;
  onDownload: (productId: string) => void;
}

export default function StoreProductCard({
  product,
  owned,
  userAuthenticated,
  busy,
  onBuy,
  onDownload,
}: StoreProductCardProps) {
  const Icon = productIcons[product.product_type];

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full overflow-hidden border-gold/15 bg-card-gradient shadow-card">
        <CardContent className="flex h-full flex-col gap-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {productTypeLabels[product.product_type]}
              </Badge>
              {product.is_featured && (
                <Badge className="ml-2 bg-primary/15 text-primary hover:bg-primary/15">
                  Destaque
                </Badge>
              )}
            </div>
            <div className="icon-slot h-11 w-11">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-heading text-xl text-foreground">{product.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {product.short_description ?? product.description ?? "Conteudo digital para sua mesa."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="metric-panel p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Formato
              </p>
              <p className="mt-1 font-heading text-sm text-foreground">
                {product.format_details}
              </p>
            </div>
            <div className="metric-panel p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Entrega
              </p>
              <p className="mt-1 font-heading text-sm text-foreground">
                {product.download_size_label}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {product.preview_points.slice(0, 3).map((point) => (
              <div
                key={point}
                className="field-note px-3 py-2 text-sm text-foreground/90"
              >
                {point}
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-secondary/70">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Preco
              </p>
              <p className="font-heading text-2xl text-primary">
                {formatStorePrice(product.price_cents, product.currency)}
              </p>
            </div>

            {owned ? (
              <Button onClick={() => onDownload(product.id)} disabled={busy}>
                <Download className="mr-2 h-4 w-4" />
                {busy ? "Gerando..." : "Baixar"}
              </Button>
            ) : (
              <Button
                variant={userAuthenticated ? "default" : "outline"}
                onClick={() => onBuy(product.id)}
                disabled={busy}
              >
                {busy ? "Abrindo..." : userAuthenticated ? "Comprar" : "Entrar para comprar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
