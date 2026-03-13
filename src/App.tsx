import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CampaignPage from "./pages/CampaignPage";
import PlayPage from "./pages/PlayPage";
import UniversePage from "./pages/UniversePage";
import CommunityPage from "./pages/CommunityPage";
import StorePage from "./pages/StorePage";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/campanha" element={<CampaignPage />} />
            <Route path="/jogar" element={<PlayPage />} />
            <Route path="/universo" element={<UniversePage />} />
            <Route path="/universo/:entrySlug" element={<UniversePage />} />
            <Route path="/comunidade" element={<CommunityPage />} />
            <Route path="/loja" element={<StorePage />} />
            <Route path="/conta" element={<AccountPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
