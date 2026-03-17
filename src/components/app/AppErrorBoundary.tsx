import { type ErrorInfo, type ReactNode, Component } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App shell crashed", error, errorInfo);
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
          <Card variant="elevated" className="w-full max-w-2xl">
            <CardHeader className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                Recuperacao da interface
              </p>
              <CardTitle className="font-display text-3xl text-gold-gradient">
                Algo saiu do trilho nesta rota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                A interface encontrou uma falha inesperada. O restante do projeto
                continua intacto, e voce pode tentar recarregar apenas esta tela.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={this.handleReset}>Tentar novamente</Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recarregar pagina
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
