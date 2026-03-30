import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookMarked,
  Library,
  LogIn,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import UserLibrary from "@/components/store/UserLibrary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataSection } from "@/components/ui/data-section";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { createDownloadLink, fetchStorefrontData } from "@/lib/store-api";
import { formatStorePrice } from "@/lib/storefront";

function AuthField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AccountPage() {
  const queryClient = useQueryClient();
  const { user, loading, signIn, signOut, signUp } = useAuth();
  const [authTab, setAuthTab] = useState("entrar");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [downloadProductId, setDownloadProductId] = useState<string | null>(null);

  const storefrontQuery = useQuery({
    queryKey: ["storefront", user?.id ?? "guest"],
    queryFn: fetchStorefrontData,
    enabled: !!user,
    staleTime: 60_000,
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
      setDownloadProductId(null);
      toast.error(error.message);
    },
  });

  const handleSignIn = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error("Preencha email e senha para entrar.");
      return;
    }

    setAuthBusy(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setAuthBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Login realizado.");
  };

  const handleSignUp = async () => {
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error("Preencha nome, email e senha para criar sua conta.");
      return;
    }

    setAuthBusy(true);
    const { data, error } = await signUp(signupEmail, signupPassword, signupName);
    setAuthBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      toast.success("Conta criada e autenticada.");
    } else {
      toast.success("Conta criada. Confira seu email para confirmar o acesso.");
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Sessao encerrada.");
  };

  const handleDownload = (productId: string) => {
    setDownloadProductId(productId);
    downloadMutation.mutate(productId);
  };

  const ownedCount = storefrontQuery.data?.summary.ownedCount ?? 0;
  const totalSpent = storefrontQuery.data?.summary.totalSpentCents ?? 0;
  const libraryCount = storefrontQuery.data?.library.length ?? 0;

  return (
    <div className="container py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">
                    <User className="mr-2 h-3.5 w-3.5" />
                    Conta e biblioteca
                  </Badge>
                  <Badge variant={user ? "info" : "secondary"}>
                    {user ? "Sessao autenticada" : "Acesso protegido"}
                  </Badge>
                </div>

                <div className="max-w-3xl space-y-4">
                  <p className="section-kicker">Arquivo pessoal</p>
                  <h1 className="font-display text-5xl leading-[0.95] text-brand-gradient md:text-6xl">
                    Cofre pessoal da campanha, com registros, downloads e rastros do grupo.
                  </h1>
                  <p className="text-base leading-8 text-foreground/88">
                    Sua conta guarda mapas, PDFs, aventuras, classes e itens como parte do mesmo
                    acervo pessoal que acompanha a campanha.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <DataSection
                    label="Produtos"
                    value={String(ownedCount).padStart(2, "0")}
                    variant="quiet"
                  />
                  <DataSection
                    label="Investido"
                    value={formatStorePrice(totalSpent, "BRL")}
                    variant="quiet"
                    tone="info"
                  />
                  <DataSection
                    label="Biblioteca"
                    value={String(libraryCount).padStart(2, "0")}
                    variant="quiet"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="paper-strip p-5">
                  <p className="text-[10px] uppercase tracking-[0.24em]">Status</p>
                  <p className="mt-3 font-display text-3xl">
                    {loading ? "Sincronizando" : user ? "Cofre aberto" : "Cofre fechado"}
                  </p>
                </div>

                <Card variant="panel">
                  <CardContent className="space-y-4 p-5">
                    <p className="section-kicker">Acesso</p>
                    <DataSection
                      label="Compra"
                      value="Stripe seguro + biblioteca conectada"
                      variant="quiet"
                    />
                    <DataSection
                      label="Entrega"
                      value="Re-download instantaneo quando necessario"
                      variant="quiet"
                    />
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/loja">Abrir a loja</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <DataSection
              label="Uso"
              value="Conta, biblioteca e downloads"
              icon={<Library className="h-4 w-4" />}
            >
              <p className="text-sm leading-6 text-muted-foreground">
                Tudo fica acessivel sem sair do clima dark fantasy do restante do portal.
              </p>
            </DataSection>
            <DataSection
              label="Sincronizacao"
              value={loading ? "Aguardando autenticacao" : user ? "Conectada" : "Desconectada"}
              icon={<ShieldCheck className="h-4 w-4" />}
              tone="info"
            >
              <p className="text-sm leading-6 text-muted-foreground">
                Seus arquivos pagos podem ser baixados novamente pela conta ou pela loja.
              </p>
            </DataSection>
          </div>
        </section>

        {loading ? (
          <Card variant="panel">
            <CardContent className="p-10 text-center text-muted-foreground">
              Carregando sua conta...
            </CardContent>
          </Card>
        ) : user ? (
          <div className="space-y-8">
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <Card variant="panel">
                <CardContent className="space-y-6 p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <Badge variant="outline" className="border-[hsl(var(--brand)/0.24)]">
                        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                        Conta autenticada
                      </Badge>
                      <h2 className="mt-4 font-display text-4xl text-foreground">
                        {user.user_metadata?.display_name ?? "Aventureiro"}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <DataSection label="Produtos" value={ownedCount} variant="quiet" />
                    <DataSection
                      label="Investido"
                      value={formatStorePrice(totalSpent, "BRL")}
                      variant="quiet"
                    />
                    <DataSection label="Biblioteca" value={libraryCount} variant="quiet" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="panel">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.88),hsl(var(--surface-base)/0.96))] text-primary">
                    <BookMarked className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="section-kicker">Biblioteca conectada</p>
                    <h3 className="mt-2 font-heading text-2xl text-foreground">
                      Seu acervo fica sempre disponivel
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Suas compras ficam vinculadas ao usuario e podem ser baixadas novamente sempre
                    que precisar, sem recomprar.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/loja">Ir para a loja</Link>
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-4">
              <div className="max-w-2xl">
                  <p className="section-kicker">Cofre digital</p>
                <h2 className="mt-2 font-display text-4xl text-brand-gradient">
                  Biblioteca do usuario
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Conteudo liberado automaticamente apos a compra, com acesso direto para download.
                </p>
              </div>

              <UserLibrary
                items={storefrontQuery.data?.library ?? []}
                userAuthenticated
                busyProductId={downloadMutation.isPending ? downloadProductId : null}
                onDownload={handleDownload}
                emptyTitle="Nenhum conteudo comprado ainda."
                emptyDescription="Visite a loja para adquirir mapas, aventuras, tokens e PDFs digitais."
              />
            </section>
          </div>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Card variant="panel">
              <CardContent className="space-y-5 p-6 md:p-8">
                <div>
                  <p className="section-kicker">Como funciona</p>
                  <h2 className="mt-2 font-heading text-3xl text-foreground">
                    Entre no seu cofre narrativo
                  </h2>
                </div>

                <p className="text-sm leading-7 text-muted-foreground">
                  Depois da compra, o conteudo vai para sua biblioteca pessoal e pode ser baixado
                  quantas vezes voce precisar.
                </p>

                <div className="grid gap-3">
                  <DataSection label="Passo 01" value="Crie sua conta do arquivo" variant="quiet" />
                  <DataSection
                    label="Passo 02"
                    value="Compre em ambiente seguro"
                    variant="quiet"
                    tone="info"
                  />
                  <DataSection label="Passo 03" value="Guarde tudo na biblioteca" variant="quiet" />
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" className="overflow-hidden">
              <CardContent className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div className="space-y-6">
                  <div>
                  <p className="section-kicker">Acesso seguro</p>
                    <h2 className="mt-2 font-display text-4xl text-brand-gradient">
                      Autenticacao e cadastro no mesmo idioma visual do portal.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      Entre, compre e recupere seu acervo sem sair do mesmo reliquiario que guarda
                      atlas, campanha e universo.
                    </p>
                  </div>

                  <Tabs value={authTab} onValueChange={setAuthTab} className="space-y-5">
                    <TabsList className="grid h-auto max-w-sm grid-cols-2">
                      <TabsTrigger value="entrar">Entrar</TabsTrigger>
                      <TabsTrigger value="criar">Criar conta</TabsTrigger>
                    </TabsList>

                    <TabsContent value="entrar" className="mt-0 space-y-4">
                      <AuthField label="Email">
                        <Input
                          type="email"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          placeholder="seu@email.com"
                        />
                      </AuthField>
                      <AuthField label="Senha">
                        <Input
                          type="password"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          placeholder="********"
                        />
                      </AuthField>
                      <Button onClick={handleSignIn} disabled={authBusy} className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        {authBusy ? "Entrando..." : "Entrar"}
                      </Button>
                    </TabsContent>

                    <TabsContent value="criar" className="mt-0 space-y-4">
                      <AuthField label="Nome">
                        <Input
                          value={signupName}
                          onChange={(event) => setSignupName(event.target.value)}
                          placeholder="Seu nome de aventureiro"
                        />
                      </AuthField>
                      <AuthField label="Email">
                        <Input
                          type="email"
                          value={signupEmail}
                          onChange={(event) => setSignupEmail(event.target.value)}
                          placeholder="seu@email.com"
                        />
                      </AuthField>
                      <AuthField label="Senha">
                        <Input
                          type="password"
                          value={signupPassword}
                          onChange={(event) => setSignupPassword(event.target.value)}
                          placeholder="Crie uma senha forte"
                        />
                      </AuthField>
                      <Button onClick={handleSignUp} disabled={authBusy} className="w-full">
                        {authBusy ? "Criando..." : "Criar conta"}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <div className="paper-strip p-4">
                    <p className="text-[10px] uppercase tracking-[0.24em]">Beneficio</p>
                    <p className="mt-3 font-display text-3xl">Re-download sem atrito</p>
                  </div>

                  <DataSection
                    label="Biblioteca"
                    value="PDFs, mapas, aventuras e classes"
                    variant="quiet"
                  />
                  <DataSection
                    label="Entrega"
                    value="Acesso imediato apos a compra"
                    variant="quiet"
                    tone="info"
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </motion.div>
    </div>
  );
}
