import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  Library,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Link, useSearchParams, type SetURLSearchParams } from "react-router-dom";
import { toast } from "sonner";
import StoreProductCard from "@/components/store/StoreProductCard";
import UserLibrary from "@/components/store/UserLibrary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  confirmStorePurchase,
  createDownloadLink,
  createStoreCheckout,
  fetchStorefrontData,
} from "@/lib/store-api";
import {
  formatStorePrice,
  productTypeLabels,
  type DigitalProductType,
} from "@/lib/store";

type ProductFilter = "todos" | DigitalProductType;

const filters: ProductFilter[] = [
  "todos",
  "livro_pdf",
  "mapa",
  "token",
  "aventura",
  "classe",
  "item",
];

function stripCheckoutParams(
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
) {
  const next = new URLSearchParams(searchParams);
  next.delete("checkout");
  next.delete("session_id");
  setSearchParams(next, { replace: true });
}

export default function StorePage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("catalogo");
  const [activeFilter, setActiveFilter] = useState<ProductFilter>("todos");
  const [checkoutProductId, setCheckoutProductId] = useState<string | null>(null);
  const [downloadProductId, setDownloadProductId] = useState<string | null>(null);
  const [handledSessionId, setHandledSessionId] = useState<string | null>(null);

  const storefrontQuery = useQuery({
    queryKey: ["storefront", user?.id ?? "guest"],
    queryFn: fetchStorefrontData,
    staleTime: 60_000,
  });

  const library = storefrontQuery.data?.library ?? [];
  const ownedProductIds = new Set(library.map((item) => item.productId));
  const filteredProducts = (storefrontQuery.data?.products ?? []).filter((product) =>
    activeFilter === "todos" ? true : product.product_type === activeFilter,
  );

  const checkoutMutation = useMutation({
    mutationFn: createStoreCheckout,
    onSuccess: (data) => {
      if (!data.url) {
        toast.error("Nao foi possivel abrir o checkout do Stripe.");
        return;
      }

      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message);
      setCheckoutProductId(null);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: confirmStorePurchase,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["storefront"] });
      toast.success("Compra confirmada. Produto liberado na sua biblioteca.");

      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
      }

      stripCheckoutParams(searchParams, setSearchParams);
    },
    onError: (error) => {
      toast.error(error.message);
      stripCheckoutParams(searchParams, setSearchParams);
    },
  });

  const downloadMutation = useMutation({
    mutationFn: createDownloadLink,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["storefront"] });
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
      setDownloadProductId(null);
      toast.success("Download liberado.");
    },
    onError: (error) => {
      toast.error(error.message);
      setDownloadProductId(null);
    },
  });

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");

    if (checkoutStatus === "cancelled") {
      toast.message("Pagamento cancelado. Seu carrinho digital continua pronto na loja.");
      stripCheckoutParams(searchParams, setSearchParams);
      return;
    }

    if (
      checkoutStatus !== "success" ||
      !sessionId ||
      handledSessionId === sessionId ||
      authLoading ||
      !user
    ) {
      return;
    }

    setHandledSessionId(sessionId);
    setActiveTab("biblioteca");
    confirmMutation.mutate(sessionId);
  }, [
    authLoading,
    confirmMutation,
    handledSessionId,
    searchParams,
    setSearchParams,
    user,
  ]);

  const handleCheckout = (productId: string) => {
    if (!user) {
      toast.message("Entre na sua conta para concluir a compra.");
      return;
    }

    setCheckoutProductId(productId);
    checkoutMutation.mutate(productId);
  };

  const handleDownload = (productId: string) => {
    if (!user) {
      toast.message("Entre na sua conta para baixar seu conteudo.");
      return;
    }

    setDownloadProductId(productId);
    downloadMutation.mutate(productId);
  };

  const totalSpent = storefrontQuery.data?.summary.totalSpentCents ?? 0;

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 space-y-8"
      >
        <div className="text-center">
          <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="mb-4 font-display text-3xl text-gold-gradient md:text-5xl">
            Loja Digital de RPG
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Venda e entrega de livros PDF, mapas, tokens, aventuras, classes e itens
            diretamente no site, com checkout Stripe e biblioteca do usuario.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="border-gold/15 bg-card-gradient shadow-card">
            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Catalogo ativo
                </p>
                <p className="mt-2 font-heading text-3xl text-foreground">
                  {storefrontQuery.data?.products.length ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Na biblioteca
                </p>
                <p className="mt-2 font-heading text-3xl text-foreground">
                  {storefrontQuery.data?.summary.ownedCount ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Total investido
                </p>
                <p className="mt-2 font-heading text-3xl text-foreground">
                  {formatStorePrice(totalSpent, "BRL")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold/15 bg-card-gradient shadow-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-primary/20 bg-background/50 p-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-lg text-foreground">Fluxo de compra</h2>
                  <p className="text-sm text-muted-foreground">
                    Checkout Stripe + download automatico + re-download pela conta.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-foreground/90">
                <p>1. O usuario escolhe um produto e entra no checkout Stripe.</p>
                <p>2. A compra confirmada libera o arquivo e registra a biblioteca.</p>
                <p>3. O download continua disponivel depois na conta do usuario.</p>
              </div>

              {!user && (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/conta">Entrar para comprar</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid h-auto max-w-md grid-cols-2 bg-secondary/60 p-1">
          <TabsTrigger value="catalogo" className="font-heading uppercase tracking-[0.18em]">
            Catalogo
          </TabsTrigger>
          <TabsTrigger value="biblioteca" className="font-heading uppercase tracking-[0.18em]">
            Biblioteca
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalogo" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "todos" ? "Todos" : productTypeLabels[filter]}
              </Button>
            ))}
          </div>

          {storefrontQuery.isLoading ? (
            <Card className="border-gold/15 bg-card-gradient shadow-card">
              <CardContent className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando catalogo da loja...
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  owned={ownedProductIds.has(product.id)}
                  userAuthenticated={!!user}
                  busy={
                    checkoutMutation.isPending && checkoutProductId === product.id ||
                    downloadMutation.isPending && downloadProductId === product.id
                  }
                  onBuy={handleCheckout}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="biblioteca" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl text-foreground">Biblioteca do usuario</h2>
              <p className="text-sm text-muted-foreground">
                Todos os downloads liberados apos o pagamento ficam guardados aqui.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Library className="mr-2 h-3.5 w-3.5" />
                {storefrontQuery.data?.summary.ownedCount ?? 0} itens
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Download className="mr-2 h-3.5 w-3.5" />
                Download automatico
              </Badge>
            </div>
          </div>

          <UserLibrary
            items={library}
            userAuthenticated={!!user}
            busyProductId={downloadMutation.isPending ? downloadProductId : null}
            onDownload={handleDownload}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
