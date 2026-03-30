import { useEffect, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import {
  Apple,
  Coins,
  FlaskConical,
  Gem,
  ScrollText,
  Shield,
  ShoppingBag,
  Sparkles,
  Sword,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { TgaIcon } from "@/components/store/TgaIcon";
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
  getShopItemIconUrl,
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
type ShopArtSize = "list" | "detail";

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

function ShopItemArt({
  item,
  size,
  className,
}: {
  item: GameShopItem;
  size: ShopArtSize;
  className?: string;
}) {
  const Icon = categoryIcons[item.category];
  const [iconFailed, setIconFailed] = useState(false);
  const iconUrl = getShopItemIconUrl(item);

  useEffect(() => {
    setIconFailed(false);
  }, [iconUrl]);

  return (
    <div
      className={cn(
        "tool-stage-frame relative overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.22),transparent_52%),linear-gradient(180deg,hsl(var(--background)/0.84),hsl(var(--background)/0.98))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.05),0_20px_40px_hsl(var(--background)/0.26)]",
        size === "detail" ? "h-24 w-24 md:h-28 md:w-28" : "h-12 w-12 md:h-14 md:w-14",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,hsl(var(--primary)/0.14),transparent_45%)]" />
      {!iconFailed ? (
        <TgaIcon
          src={iconUrl}
          alt={item.name}
          renderSize={size === "detail" ? 88 : 44}
          onError={() => setIconFailed(true)}
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]",
            size === "detail" ? "h-[5.5rem] w-[5.5rem]" : "h-11 w-11",
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={cn("text-primary", size === "detail" ? "h-12 w-12" : "h-6 w-6")} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-5 bottom-1 h-4 bg-primary/10 blur-xl" />
    </div>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric-panel px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-lg text-foreground">{value}</p>
    </div>
  );
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
            <div className="space-y-3 pb-1">
              {items.map((item) => {
                const active = selected?.owner === owner && selected.itemId === item.id;
                const tradePrice = getTradePrice(item, owner);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect({ owner, itemId: item.id })}
                    className={cn(
                      "group relative flex flex-col gap-4 border p-4 text-left transition-all sm:flex-row sm:items-center",
                      active
                        ? "border-primary/60 bg-primary/10 shadow-brand"
                        : "info-panel hover:border-primary/28 hover:bg-background/78",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <ShopItemArt item={item} size="list" className="shrink-0" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-heading text-base leading-6 text-foreground">
                            {item.name}
                          </p>
                          <Badge variant={rarityVariants[item.rarity]} className="shrink-0">
                            {shopRarityLabels[item.rarity]}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-sm leading-6 text-foreground/78">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em]">
                          <span className="metric-panel px-2.5 py-1 text-primary/85">
                            {shopCategoryLabels[item.category]}
                          </span>
                          <span className="metric-panel px-2.5 py-1 text-muted-foreground">
                            x{item.quantity}
                          </span>
                          <span className="metric-panel px-2.5 py-1 text-muted-foreground">
                            {item.weight} kg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-border/60 pt-3 sm:min-w-[130px] sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {owner === "merchant" ? "Compra" : "Venda"}
                      </p>
                      <p className="font-heading text-lg text-primary">
                        {formatShopGold(tradePrice)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="tool-empty-state p-5 text-center text-sm text-muted-foreground">
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
  const [selected, setSelected] = useState<SelectedEntry | null>(null);

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
                    Mercado de fronteira
                  </Badge>
                  <Badge variant="secondary">Negociacao aberta ao grupo</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="icon-slot h-12 w-12">
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
                    {merchantProfile.summary} Entre laminas, reagentes e trofeus, a banca foi
                    erguida para compras urgentes, barganhas secas e acordos fechados sob poeira
                    e vigia.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="info-panel p-4">
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
                  <div className="info-panel p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Caixa do mercador
                    </p>
                    <p className="mt-2 font-heading text-xl text-primary">
                      {formatShopGold(shopState.merchantGold)}
                    </p>
                  </div>
                  <div className="info-panel p-4">
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
                <div className="icon-slot h-11 w-11">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading text-lg text-foreground">Resumo da troca</h2>
                  <p className="text-sm text-muted-foreground">
                    Marwen cobra caro por raridade e paga menos do que promete quando sente pressa.
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
                label="Arquivo pessoal"
                value="Acesso ao cofre da companhia"
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

        <div className="grid items-start gap-6 xl:h-[calc(100vh-10rem)] xl:grid-cols-[minmax(0,1fr)_420px_minmax(0,1fr)]">
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
                      <div className="grid gap-5 md:grid-cols-[132px_minmax(0,1fr)]">
                        <div className="space-y-3">
                          <ShopItemArt
                            item={selectedItem}
                            size="detail"
                            className="mx-auto md:mx-0"
                          />
                          <div className="field-note px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                              Procedencia
                            </p>
                            <p className="mt-2 text-sm leading-6 text-foreground/88">
                              {selectedOwner === "merchant"
                                ? "Separado nas prateleiras de Marwen para venda imediata."
                                : "Guardado na mochila da companhia e pronto para revenda."}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                                {shopCategoryLabels[selectedItem.category]}
                              </p>
                              <p className="font-heading text-base text-foreground">
                              {selectedOwner === "merchant"
                                  ? "Oferta do mercador"
                                  : "Item da companhia"}
                              </p>
                            </div>
                            <Badge variant={rarityVariants[selectedItem.rarity]}>
                              {shopRarityLabels[selectedItem.rarity]}
                            </Badge>
                          </div>

                          <p className="text-sm leading-7 text-foreground/88">
                            Peca separada na banca com peso, raridade e valor prontos para fechar
                            negocio sem atrasar a caravana.
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <DetailMetric
                              label="Valor de troca"
                              value={formatShopGold(detailPrice)}
                            />
                            <DetailMetric label="Quantidade" value={`x${selectedItem.quantity}`} />
                            <DetailMetric
                              label="Peso unitario"
                              value={`${selectedItem.weight} kg`}
                            />
                            <DetailMetric
                              label="Valor base"
                              value={formatShopGold(selectedItem.baseValue)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="info-panel p-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            Descricao
                          </p>
                          <p className="mt-3 text-sm leading-7 text-foreground/90">
                            {selectedItem.description}
                          </p>
                        </div>

                        <div className="info-panel p-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            Aplicacao
                          </p>
                          <p className="mt-3 text-sm leading-7 text-foreground/90">
                            {selectedItem.effect}
                          </p>
                        </div>
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
                <div className="tool-empty-state p-6 text-center text-sm text-muted-foreground">
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
                  className="field-note px-4 py-3 text-sm leading-6 text-foreground/90"
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
                Termos da banca enquanto a estrada ainda permite negocio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-foreground/88">
              <p>Marwen vende pelo valor cheio de tabela e compra por cerca de 45% do valor base.</p>
              <p>Itens vendidos voltam para o estoque da banca e itens comprados entram na mochila da companhia.</p>
              <p>Cada troca altera ouro, peso e quantidades no mesmo instante em que o acordo e fechado.</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
