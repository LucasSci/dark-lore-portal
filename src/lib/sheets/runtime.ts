import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildAttributeValuesFromCharacterRow,
  buildCharacterDraftFromStore,
  createAttributeStore,
} from "@/lib/sheets/engine";
import { generateSecureShortId } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";
import type {
  AttributeStore,
  CharacterSheetDraft,
  SheetDefinition,
  SheetEngineRequest,
  SheetEngineResponse,
  SheetImportPayload,
  SheetScalarValue,
  SheetStepValidation,
} from "@/lib/sheets/types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];

let workerSingleton: Worker | null = null;
const pendingRequests = new Map<
  string,
  {
    resolve: (message: SheetEngineResponse) => void;
    reject: (reason?: unknown) => void;
  }
>();

function createRequestId() {
  return generateSecureShortId("sheet");
}

function getWorker() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!workerSingleton) {
    workerSingleton = new Worker(new URL("../../workers/sheet-engine.worker.ts", import.meta.url), {
      type: "module",
    });

    workerSingleton.onmessage = (event: MessageEvent<SheetEngineResponse>) => {
      const response = event.data;
      const pending = pendingRequests.get(response.requestId);

      if (!pending) {
        return;
      }

      pendingRequests.delete(response.requestId);

      if (!response.ok) {
        pending.reject(new Error(response.error ?? "Sheet worker failed."));
        return;
      }

      pending.resolve(response);
    };
  }

  return workerSingleton;
}

async function dispatchWorker(message: Omit<SheetEngineRequest, "requestId">) {
  const worker = getWorker();

  if (!worker) {
    throw new Error("Sheet worker is unavailable in this environment.");
  }

  const requestId = createRequestId();

  const request = {
    ...message,
    requestId,
  } as SheetEngineRequest;

  return new Promise<SheetEngineResponse>((resolve, reject) => {
    pendingRequests.set(requestId, { resolve, reject });
    worker.postMessage(request);
  });
}

interface UseCharacterSheetRuntimeOptions {
  definition: SheetDefinition;
  character?: CharacterRow | null;
  initialValues?: Record<string, SheetScalarValue>;
  initialStore?: AttributeStore | null;
}

export function useCharacterSheetRuntime({
  definition,
  character,
  initialValues,
  initialStore,
}: UseCharacterSheetRuntimeOptions) {
  const initialPayload = useMemo(
    () => ({
      characterId: initialStore?.characterId ?? character?.id ?? "draft-character",
      values: initialStore?.values ?? (character ? buildAttributeValuesFromCharacterRow(character) : initialValues),
      repeaters: initialStore?.repeaters ?? {},
    }),
    [character, initialStore, initialValues],
  );
  const fallbackStore = useMemo(
    () => initialStore ??
      createAttributeStore(
        definition,
        initialPayload.characterId,
        initialPayload.values,
        initialPayload.repeaters,
      ),
    [definition, initialPayload, initialStore],
  );
  const [store, setStore] = useState<AttributeStore>(fallbackStore);
  const [validation, setValidation] = useState<Record<string, SheetStepValidation>>({});
  const [workerReady, setWorkerReady] = useState(false);
  const storeRef = useRef(store);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    let active = true;

    dispatchWorker({
      type: "INIT_SHEET",
      payload: {
        definition,
        characterId: initialPayload.characterId,
        initialValues: initialPayload.values,
        repeaters: initialPayload.repeaters,
      },
    })
      .then((response) => {
        if (!active || !response.store) {
          return;
        }

        setStore(response.store);
        setWorkerReady(true);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setStore(fallbackStore);
        setWorkerReady(false);
      });

    return () => {
      active = false;
    };
  }, [definition, fallbackStore, initialPayload]);

  const syncStore = async (message: Omit<SheetEngineRequest, "requestId">) => {
    const response = await dispatchWorker(message);

    if (response.store) {
      setStore(response.store);
    }

    if (response.validation) {
      setValidation((previous) => ({
        ...previous,
        [response.validation!.stepId]: response.validation!,
      }));
    }

    return response;
  };

  const setAttribute = async (key: string, value: SheetScalarValue) => {
    const response = await syncStore({
      type: "SET_ATTRIBUTE",
      payload: {
        definition,
        store: storeRef.current,
        key,
        value,
      },
    });

    return response.store ?? store;
  };

  const validateStep = async (stepId: string) => {
    const response = await syncStore({
      type: "VALIDATE_STEP",
      payload: {
        definition,
        store: storeRef.current,
        stepId,
      },
    });

    return (
      response.validation ?? {
        stepId,
        valid: true,
        errors: {},
      }
    );
  };

  const importCompendiumData = async (binding: string, entry: SheetImportPayload) => {
    const response = await syncStore({
      type: "IMPORT_COMPENDIUM_DATA",
      payload: {
        definition,
        store: storeRef.current,
        binding,
        entry,
      },
    });

    return response.store ?? store;
  };

  const rerunDerivations = async () => {
    const response = await syncStore({
      type: "RUN_DERIVATIONS",
      payload: {
        definition,
        store: storeRef.current,
      },
    });

    return response.store ?? store;
  };

  return {
    store,
    validation,
    workerReady,
    setAttribute,
    validateStep,
    importCompendiumData,
    rerunDerivations,
    toDraft: (): CharacterSheetDraft => buildCharacterDraftFromStore(store),
  };
}
