import { useEffect, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import {
  Apple,
  Coins,
  FlaskConical,
  Gem,
  Package,
  ScrollText,
  Shield,
  ShoppingBag,
  Sparkles,
  Sword,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  buyMerchantItem,
  createInitialShopState,
  formatShopGold,
  getInventoryWeight,
  getTradePrice,
  merchantProfile,
  sellPlayerItem,
  shopCategoryLabels,
  shopRarityLabels,
  type GameShopCategory,
  type GameShopItem,
  type GameShopRarity,
  type ShopInventoryOwner,
} from "@/lib/in-game-shop";
import { cn } from "@/lib/utils";

type ShopFilter = "todas" | GameShopCategory;

interface SelectedEntry {
  owner: ShopInventoryOwner;
  itemId: string;
}

const filters: ShopFilter[] = [
  "todas",
  "armas",
  "armaduras",
  "alquimia",
  "ingredientes",
  "provisoes",
  "runas",
  "curios",
];

const categoryIcons: Record<GameShopCategory, ComponentType<{ className?: string }>> = {
  armas: Sword,
  armaduras: Shield,
  alquimia: FlaskConical,
  ingredientes: Sparkles,
  provisoes: Apple,
  runas: Gem,
  curios: ScrollText,
};

const rarityVariants: Record<GameShopRarity, "outline" | "secondary" | "info" | "warning"> = {
  comum: "outline",
  incomum: "secondary",
  raro: "info",
  reliquia: "warning",
};

function filterItems(items: GameShopItem[], search: string, filter: ShopFilter) {
  const term = search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesFilter = filter === "todas" ? true : item.category === filter;
    const searchable = `${item.name} ${item.description} ${item.effect}`.toLowerCase();
    const matchesSearch = term ? searchable.includes(term) : true;

    return matchesFilter && matchesSearch;
  });
}

function InventoryGrid({
  title,
  description,
  owner,
  items,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  owner: ShopInventoryOwner;
  items: GameShopItem[];
  selected: SelectedEntry | null;
  onSelect: (next: SelectedEntry) => void;
}) {
  return (
    <Card variant="panel" className="relative z-0 flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        {items.length ? (
          <ScrollArea className="min-h-0 flex-1 pr-3">
            <div className="grid grid-cols-4 gap-2 pb-1 sm:grid-cols-5 xl:grid-cols-4">
              {items.map((item) => {
                const Icon = categoryIcons[item.category];
                const active =
                  selected?.owner === owner && selected.itemId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect({ owner, itemId: item.id })}
                    className={cn(
                      "group relative aspect-square rounded-[calc(var(--radius)-4px)] border bg-background/55 p-2 text-left transition-all",
                      active
                        ? "border-primary/55 bg-primary/10 shadow-brand"
                        : "border-border/70 hover:border-primary/28 hover:bg-background/72",
                    )}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="rounded-lg border border-primary/18 bg-background/66 p-2">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="rounded-full bg-background/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          x{item.quantity}
                        </span>
                      </div>

                      <div>
                        <p className="line-clamp-2 font-heading text-xs leading-5 text-foreground">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-primary/80">
                          {shopCategoryLabels[item.category]}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="rounded-[var(--radius)] border border-dashed border-border/70 bg-background/40 p-5 text-center text-sm text-muted-foreground">
            Nenhum item encontrado nesta secao.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function StorePage() {
  const [shopState, setShopState] = useState(() => createInitialShopState());
  const [activeFilter, setActiveFilter] = useState<ShopFilter>("todas");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedEntry | null>(() => ({
    owner: "merchant",
    itemId: createInitialShopState().merchantItems[0]?.id ?? "",
  }));

  const filteredMerchantItems = filterItems(shopState.merchantItems, search, activeFilter);
  const filteredPlayerItems = filterItems(shopState.playerItems, search, activeFilter);
  const selectedItems =
    selected?.owner === "player" ? shopState.playerItems : shopState.merchantItems;
  const selectedItem = selected
    ? selectedItems.find((item) => item.id === selected.itemId) ?? null
    : null;
  const selectedOwner = selected?.owner ?? "merchant";
  const detailPrice = selectedItem ? getTradePrice(selectedItem, selectedOwner) : 0;

  useEffect(() => {
    if (selectedItem) {
      return;
    }

    const fallbackMerchant = shopState.merchantItems[0];
    const fallbackPlayer = shopState.playerItems[0];

    if (fallbackMerchant) {
      setSelected({ owner: "merchant", itemId: fallbackMerchant.id });
      return;
    }

    if (fallbackPlayer) {
      setSelected({ owner: "player", itemId: fallbackPlayer.id });
      return;
    }

    setSelected(null);
  }, [selectedItem, shopState.merchantItems, shopState.playerItems]);

  const handleTrade = () => {
    if (!selectedItem || !selected) {
      return;
    }

    const result =
      selected.owner === "merchant"
        ? buyMerchantItem(shopState, selected.itemId)
        : sellPlayerItem(shopState, selected.itemId);

    setShopState(result.state);

    if (result.ok) {
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  return (
    <div className="container py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="relative p-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_28%),radial-gradient(circle_at_bottom_right,hsl(var(--destructive)/0.16),transparent_28%)]" />
              <div className="relative space-y-6 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    Ambiente in-game
                  </Badge>
                  <Badge variant="secondary">Compra e venda de campanha</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-primary/20 bg-background/55 p-3">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                        Posto mercante
                      </p>
                      <h1 className="font-display text-4xl text-gold-gradient md:text-5xl">
                        {merchantProfile.name}
                      </h1>
                    </div>
                  </div>
                  <p className="max-w-3xl text-base leading-8 text-foreground/90">
                    {merchantProfile.summary} A tela de loja agora funciona como um mercador de RPG:
                    sua companhia compra recursos, vende trofeus e administra ouro sem sair da fantasia.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[var(--radius)] border border-border/70 bg-background/50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Mercador
                    </p>
                    <p className="mt-2 font-heading text-xl text-foreground">
                      {merchantProfile.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {merchantProfile.location}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius)] border border-border/70 bg-background/50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Caixa do mercador
                    </p>
                    <p className="mt-2 font-heading text-xl text-primary">
                      {formatShopGold(shopState.merchantGold)}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius)] border border-border/70 bg-background/50 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Ouro da companhia
                    </p>
                    <p className="mt-2 font-heading text-xl text-primary">
                      {formatShopGold(shopState.playerGold)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="panel">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-primary/20 bg-background/55 p-3">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-lg text-foreground">Resumo da troca</h2>
                  <p className="text-sm text-muted-foreground">
                    O mercador vende pelo valor cheio e compra por uma fração do valor base.
                  </p>
                </div>
              </div>

              <DataSection
                label="Peso da mochila"
                value={`${getInventoryWeight(shopState.playerItems)} / 80`}
                variant="quiet"
              />
              <DataSection
                label="Estoque do mercador"
                value={`${shopState.merchantItems.length} tipos de item`}
                variant="quiet"
              />
              <DataSection
                label="Biblioteca digital"
                value="Continua disponivel na conta"
                variant="quiet"
              />

              <Button asChild variant="outline" className="w-full">
                <Link to="/conta">Abrir conta e downloads</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card variant="panel">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, efeito ou descricao..."
                className="max-w-md bg-background/60"
              />
              <Badge variant="outline" className="border-primary/30 text-primary">
                {filteredPlayerItems.length + filteredMerchantItems.length} itens visiveis
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={activeFilter === filter ? "primary" : "outline"}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === "todas" ? "Todas" : shopCategoryLabels[filter]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid items-start gap-6 xl:h-[calc(100vh-10rem)] xl:grid-cols-[minmax(0,1fr)_380px_minmax(0,1fr)]">
          <InventoryGrid
            title="Mochila da companhia"
            description="Recursos, trofeus e equipamentos que o grupo pode vender ou reaproveitar."
            owner="player"
            items={filteredPlayerItems}
            selected={selected}
            onSelect={setSelected}
          />

          <Card
            variant="elevated"
            className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">
                {selectedItem ? selectedItem.name : "Selecione um item"}
              </CardTitle>
              <CardDescription>
                {selectedItem
                  ? selectedOwner === "merchant"
                    ? "Item disponivel nas prateleiras de Marwen."
                    : "Item atualmente guardado no inventario da companhia."
                  : "Clique em um item para ver detalhes e negociar."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-5">
              {selectedItem ? (
                <>
                  <ScrollArea className="min-h-0 flex-1 pr-3">
                    <div className="space-y-5 pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl border border-primary/20 bg-background/55 p-3">
                            {(() => {
                              const Icon = categoryIcons[selectedItem.category];
                              return <Icon className="h-5 w-5 text-primary" />;
                            })()}
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                              {shopCategoryLabels[selectedItem.category]}
                            </p>
                            <p className="font-heading text-base text-foreground">
                              {selectedOwner === "merchant" ? "Oferta do mercador" : "Item da companhia"}
                            </p>
                          </div>
                        </div>
                        <Badge variant={rarityVariants[selectedItem.rarity]}>
                          {shopRarityLabels[selectedItem.rarity]}
                        </Badge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <DataSection
                          label="Valor de troca"
                          value={formatShopGold(detailPrice)}
                          variant="quiet"
                        />
                        <DataSection
                          label="Quantidade"
                          value={`x${selectedItem.quantity}`}
                          variant="quiet"
                        />
                        <DataSection
                          label="Peso unitario"
                          value={`${selectedItem.weight} kg`}
                          variant="quiet"
                        />
                        <DataSection
                          label="Valor base"
                          value={formatShopGold(selectedItem.baseValue)}
                          variant="quiet"
                        />
                      </div>

                      <div className="rounded-[var(--radius)] border border-border/70 bg-background/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          Descricao
                        </p>
                        <p className="mt-3 text-sm leading-7 text-foreground/90">
                          {selectedItem.description}
                        </p>
                      </div>

                      <div className="rounded-[var(--radius)] border border-border/70 bg-background/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          Efeito
                        </p>
                        <p className="mt-3 text-sm leading-7 text-foreground/90">
                          {selectedItem.effect}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>

                  <Button className="w-full" onClick={handleTrade}>
                    {selectedOwner === "merchant"
                      ? `Comprar por ${detailPrice} ouro`
                      : `Vender por ${detailPrice} ouro`}
                  </Button>
                </>
              ) : (
                <div className="rounded-[var(--radius)] border border-dashed border-border/70 bg-background/40 p-6 text-center text-sm text-muted-foreground">
                  Nenhum item selecionado.
                </div>
              )}
            </CardContent>
          </Card>

          <InventoryGrid
            title="Estoque de Marwen"
            description="Armas, runas, reagentes e equipamentos para quem encara a fronteira."
            owner="merchant"
            items={filteredMerchantItems}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card variant="panel">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Registro de transacoes</CardTitle>
              <CardDescription>
                Ultimas movimentacoes feitas nesta banca de campanha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {shopState.tradeLog.map((entry) => (
                <div
                  key={entry}
                  className="rounded-[calc(var(--radius)-4px)] border border-border/70 bg-background/45 px-4 py-3 text-sm leading-6 text-foreground/90"
                >
                  {entry}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card variant="panel">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Regras da banca</CardTitle>
              <CardDescription>
                Economia simples para mesa, inspirada em mercadores de RPG dark fantasy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-foreground/88">
              <p>O mercador vende pelo valor cheio de tabela e compra por cerca de 45% do valor base.</p>
              <p>Itens vendidos voltam para o estoque de Marwen, e itens comprados entram na mochila da companhia.</p>
              <p>Ouro e quantidades sao atualizados na hora, mantendo a loja como um ambiente totalmente in-game.</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
