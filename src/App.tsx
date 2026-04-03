import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppErrorBoundary from "@/components/app/AppErrorBoundary";
import RouteFallback from "@/components/app/RouteFallback";
import { archiveBrand } from "@/lib/archive-reference";
import { buildDocumentTitle, resolveRouteManifest } from "@/lib/route-manifest";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const HomePage = lazy(() => import("./pages/HomePage"));
const CampaignPage = lazy(() => import("./pages/CampaignPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));
const OraclePage = lazy(() => import("./pages/OraclePage"));
const MesaPage = lazy(() => import("./pages/MesaPage"));
const MapaPage = lazy(() => import("./pages/MapaPage"));
const LocationMapPage = lazy(() => import("./pages/LocationMapPage"));
const RegionMapPage = lazy(() => import("./pages/RegionMapPage"));
const SubRegionMapPage = lazy(() => import("./pages/SubRegionMapPage"));
const RegionalAtlasPage = lazy(() => import("./pages/RegionalAtlasPage"));
const FichaPage = lazy(() => import("./pages/FichaPage"));
const CriacaoPage = lazy(() => import("./pages/CriacaoPage"));
const MestrePage = lazy(() => import("./pages/MestrePage"));
const UniversePage = lazy(() => import("./pages/UniversePage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const StorePage = lazy(() => import("./pages/StorePage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function upsertMetaTag(selector: string, attributes: Record<string, string>) {
  if (typeof document === "undefined") {
    return;
  }

  const element = document.head.querySelector(selector) ?? document.createElement("meta");

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  if (!element.parentElement) {
    document.head.appendChild(element);
  }
}

function RouteMetaController() {
  const location = useLocation();

  useEffect(() => {
    const entry = resolveRouteManifest(location.pathname);
    const title = buildDocumentTitle(entry?.title ?? archiveBrand.title);
    const description =
      entry?.description ??
      "Arquivo do Continente reune dossies, bestiario, cronicas, cartografia e sessao em torno de Areias de Zerrikania.";

    document.title = title;
    upsertMetaTag('meta[name="description"]', { name: "description", content: description });
    upsertMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMetaTag('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMetaTag('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMetaTag('meta[name="robots"]', {
      name: "robots",
      content: entry?.noIndex ? "noindex, nofollow" : "index, follow",
    });
  }, [location.pathname]);

  return null;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AppErrorBoundary resetKey={location.pathname}>
      <RouteMetaController />
      <Suspense fallback={<RouteFallback />}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/campanha" element={<CampaignPage />} />
            <Route path="/cronicas" element={<CampaignPage />} />
            <Route path="/cronicas/:entrySlug" element={<UniversePage />} />
            <Route path="/jogar" element={<PlayPage />} />
            <Route path="/jogar/oraculo" element={<OraclePage />} />
            <Route path="/oraculo" element={<OraclePage />} />
            <Route path="/luna" element={<OraclePage />} />
            <Route path="/mesa" element={<MesaPage />} />
            <Route path="/mesa/:campaignId" element={<MesaPage />} />
            <Route path="/mesa/:campaignId/:sceneId" element={<MesaPage />} />
            <Route path="/mapa" element={<MapaPage />} />
            <Route path="/mapa/regional/:mapId" element={<RegionalAtlasPage />} />
            <Route path="/mapa/:regionSlug/:subRegionSlug/:locationSlug" element={<LocationMapPage />} />
            <Route path="/mapa/:regionSlug/:subRegionSlug" element={<SubRegionMapPage />} />
            <Route path="/mapa/:regionSlug" element={<RegionMapPage />} />
            <Route path="/ficha" element={<FichaPage />} />
            <Route path="/ficha/:sheetId" element={<FichaPage />} />
            <Route path="/criacao" element={<CriacaoPage />} />
            <Route path="/mestre" element={<MestrePage />} />
            <Route path="/universo" element={<UniversePage />} />
            <Route path="/universo/:entrySlug" element={<UniversePage />} />
            <Route path="/bestiario" element={<UniversePage />} />
            <Route path="/bestiario/:entrySlug" element={<UniversePage />} />
            <Route path="/comunidade" element={<CommunityPage />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/loja" element={<StorePage />} />
            <Route path="/conta" element={<AccountPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Suspense>
    </AppErrorBoundary>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
