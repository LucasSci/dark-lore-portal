import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ConfirmActionDialog from "@/components/ui/confirm-action-dialog";
import { alertVariants } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toastVariants } from "@/components/ui/toast";
import { buildCharacterFromCreator, getResourceTone } from "@/lib/rpg-ui";

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

describe("ui system", () => {
  it("exposes semantic button variants", () => {
    expect(buttonVariants({ variant: "success" })).toContain("bg-success");
    expect(buttonVariants({ variant: "danger" })).toContain("bg-destructive");
    expect(buttonVariants({ variant: "primary" })).toContain("bg-primary");
  });

  it("supports panel and elevated card styles", () => {
    expect(cardVariants({ variant: "panel" })).toContain("shadow-panel");
    expect(cardVariants({ variant: "elevated" })).toContain("shadow-elevated");
  });

  it("exposes semantic alert and toast variants", () => {
    expect(alertVariants({ variant: "warning" })).toContain("bg-status-warn/12");
    expect(toastVariants({ variant: "success" })).toContain("toast-success");
  });

  it("maps resource thresholds to semantic tones", () => {
    expect(getResourceTone(88)).toBe("good");
    expect(getResourceTone(52)).toBe("warn");
    expect(getResourceTone(12)).toBe("bad");
  });

  it("builds a playable character row from creator data", () => {
    const character = buildCharacterFromCreator({
      name: "Aveline",
      race: "humano",
      class: "clerigo",
      attributes: {
        forca: 10,
        destreza: 12,
        constituicao: 14,
        inteligencia: 11,
        sabedoria: 16,
        carisma: 13,
      },
      background: "Curadora itinerante.",
      appearance: "Capuz cinza e bastao curto.",
    });

    expect(character.name).toBe("Aveline");
    expect(character.hp_current).toBe(character.hp_max);
    expect(character.mp_current).toBe(character.mp_max);
    expect(character.user_id).toBe("demo-user");
  });

  it("renders semantic progress tones", () => {
    const { container } = render(<Progress value={45} tone="warn" />);
    const indicator = container.querySelector("[style*='translateX']");

    expect(indicator).not.toBeNull();
    expect(indicator?.className).toContain("bg-status-warn");
  });

  it("prevents destructive confirm from running twice while pending", async () => {
    const deferred = createDeferred<void>();
    const onConfirm = vi.fn(() => deferred.promise);
    const onOpenChange = vi.fn();

    render(
      <ConfirmActionDialog
        open
        onOpenChange={onOpenChange}
        title="Remover NPC?"
        description="Esta acao remove o alvo atual."
        confirmLabel="Remover"
        pendingLabel="Removendo..."
        onConfirm={onConfirm}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "Remover" });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);

    deferred.resolve();

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
