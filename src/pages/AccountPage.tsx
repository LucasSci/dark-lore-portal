import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Library, LogIn, LogOut, ShieldCheck, User } from "lucide-react";
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
import { formatStorePrice } from "@/lib/store";

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

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <div className="text-center">
          <User className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="mb-4 font-display text-3xl text-gold-gradient md:text-4xl">
            Dashboard da conta
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Login, historico de compras e biblioteca digital para acessar PDFs, mapas,
            tokens, aventuras, classes e itens quando quiser.
          </p>
        </div>

        {loading ? (
          <Card variant="panel">
            <CardContent className="p-10 text-center text-muted-foreground">
              Carregando sua conta...
            </CardContent>
          </Card>
        ) : user ? (
          <div className="space-y-8">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card variant="elevated">
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                        Conta autenticada
                      </Badge>
                      <h2 className="mt-3 font-heading text-2xl text-foreground">
                        {user.user_metadata?.display_name ?? "Aventureiro"}
                      </h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <DataSection
                      label="Produtos"
                      value={storefrontQuery.data?.summary.ownedCount ?? 0}
                      variant="quiet"
                    />
                    <DataSection
                      label="Investido"
                      value={formatStorePrice(storefrontQuery.data?.summary.totalSpentCents ?? 0, "BRL")}
                      variant="quiet"
                    />
                    <DataSection
                      label="Biblioteca"
                      value={storefrontQuery.data?.library.length ?? 0}
                      variant="quiet"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card variant="panel">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-primary/20 bg-background/50 p-3">
                      <Library className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-foreground">
                        Biblioteca conectada
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Re-download instantaneo sem precisar recomprar.
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-foreground/90">
                    Suas compras pagas pelo Stripe ficam associadas ao usuario e podem ser
                    baixadas novamente pela conta ou pela pagina da loja.
                  </p>

                  <Button asChild className="w-full">
                    <Link to="/loja">Ir para a loja</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl text-foreground">Biblioteca do usuario</h2>
                <p className="text-sm text-muted-foreground">
                  Conteudo liberado automaticamente apos a compra.
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
            </div>
          </div>
        ) : (
          <Card variant="elevated" className="mx-auto max-w-5xl">
            <CardContent className="grid gap-8 p-6 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-4 rounded-2xl border border-border/70 bg-background/50 p-6">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Conta + Biblioteca
                </Badge>
                <h2 className="font-heading text-2xl text-foreground">
                  Entre no seu dashboard narrativo
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Depois da compra, o conteudo vai para sua biblioteca pessoal e pode ser
                  baixado quantas vezes voce precisar.
                </p>

                <div className="space-y-3 text-sm text-foreground/90">
                  <p>1. Crie sua conta do arquivo de campanha.</p>
                  <p>2. Compre pelo Stripe em ambiente seguro.</p>
                  <p>3. Receba o arquivo e guarde tudo na sua biblioteca.</p>
                </div>
              </div>

              <div className="space-y-6">
                <Tabs value={authTab} onValueChange={setAuthTab} className="space-y-5">
                  <TabsList className="grid h-auto max-w-sm grid-cols-2">
                    <TabsTrigger value="entrar" className="font-heading uppercase tracking-[0.18em]">
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="criar" className="font-heading uppercase tracking-[0.18em]">
                      Criar conta
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="entrar" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <label className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="seu@email.com"
                        className="bg-background/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Senha
                      </label>
                      <Input
                        type="password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        placeholder="********"
                        className="bg-background/60"
                      />
                    </div>
                    <Button onClick={handleSignIn} disabled={authBusy} className="w-full">
                      <LogIn className="mr-2 h-4 w-4" />
                      {authBusy ? "Entrando..." : "Entrar"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="criar" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <label className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Nome
                      </label>
                      <Input
                        value={signupName}
                        onChange={(event) => setSignupName(event.target.value)}
                        placeholder="Seu nome de aventureiro"
                        className="bg-background/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        placeholder="seu@email.com"
                        className="bg-background/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Senha
                      </label>
                      <Input
                        type="password"
                        value={signupPassword}
                        onChange={(event) => setSignupPassword(event.target.value)}
                        placeholder="Crie uma senha forte"
                        className="bg-background/60"
                      />
                    </div>
                    <Button onClick={handleSignUp} disabled={authBusy} className="w-full">
                      {authBusy ? "Criando..." : "Criar conta"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
