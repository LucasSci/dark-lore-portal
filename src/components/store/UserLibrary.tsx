import { motion } from "framer-motion";
import { BookMarked, Download, Library, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatStoreDate,
  formatStorePrice,
  productTypeLabels,
  type LibraryItem,
} from "@/lib/storefront";

interface UserLibraryProps {
  items: LibraryItem[];
  userAuthenticated: boolean;
  busyProductId: string | null;
  onDownload: (productId: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function UserLibrary({
  items,
  userAuthenticated,
  busyProductId,
  onDownload,
  emptyTitle = "Sua biblioteca ainda esta vazia.",
  emptyDescription = "Compre um produto digital e ele aparecera aqui com acesso imediato para download.",
}: UserLibraryProps) {
  if (!userAuthenticated) {
    return (
      <Card className="border-gold/15 bg-card-gradient shadow-card">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="icon-slot mx-auto h-16 w-16">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-xl text-foreground">
              Entre para acessar sua biblioteca
            </h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Seus PDFs, mapas, tokens, aventuras, classes e itens digitais ficam guardados
              na conta para download sempre que precisar.
            </p>
          </div>
          <Button asChild>
            <Link to="/conta">Entrar na conta</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className="border-gold/15 bg-card-gradient shadow-card">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="icon-slot mx-auto h-16 w-16">
            <Library className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-xl text-foreground">{emptyTitle}</h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              {emptyDescription}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <Card className="h-full border-gold/15 bg-card-gradient shadow-card">
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    {productTypeLabels[item.product.product_type]}
                  </Badge>
                  <h3 className="mt-3 font-heading text-lg text-foreground">
                    {item.product.title}
                  </h3>
                </div>
                <div className="icon-slot h-12 w-12">
                  <BookMarked className="h-5 w-5 text-primary" />
                </div>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                {item.product.short_description ?? item.product.description}
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="metric-panel p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Compra
                  </p>
                  <p className="mt-1 font-heading text-sm text-foreground">
                    {formatStoreDate(item.purchasedAt)}
                  </p>
                </div>
                <div className="metric-panel p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Downloads
                  </p>
                  <p className="mt-1 font-heading text-sm text-foreground">
                    {item.downloadCount}
                  </p>
                </div>
                <div className="metric-panel p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Valor
                  </p>
                  <p className="mt-1 font-heading text-sm text-foreground">
                    {formatStorePrice(item.amountTotal, item.currency)}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/70 pt-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Entrega
                  </p>
                  <p className="font-heading text-sm text-foreground">
                    {item.product.download_size_label}
                  </p>
                </div>
                <Button
                  onClick={() => onDownload(item.productId)}
                  disabled={busyProductId === item.productId}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {busyProductId === item.productId ? "Gerando..." : "Baixar agora"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
