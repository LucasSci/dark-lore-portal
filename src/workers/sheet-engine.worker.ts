/// <reference lib="webworker" />

import {
  createAttributeStore,
  importCompendiumRow,
  runDerivedValues,
  setAttributeValue,
  validateWizardStep,
} from "@/lib/sheets/engine";
import type { SheetEngineRequest, SheetEngineResponse } from "@/lib/sheets/types";

function respond(message: SheetEngineResponse) {
  self.postMessage(message);
}

self.onmessage = (event: MessageEvent<SheetEngineRequest>) => {
  const message = event.data;

  try {
    switch (message.type) {
      case "INIT_SHEET": {
        const store = createAttributeStore(
          message.payload.definition,
          message.payload.characterId,
          message.payload.initialValues,
          message.payload.repeaters,
        );

        respond({ requestId: message.requestId, ok: true, store });
        break;
      }
      case "SET_ATTRIBUTE": {
        const store = setAttributeValue(
          message.payload.definition,
          message.payload.store,
          message.payload.key,
          message.payload.value,
        );

        respond({ requestId: message.requestId, ok: true, store });
        break;
      }
      case "RUN_DERIVATIONS": {
        const store = {
          ...message.payload.store,
          derived: runDerivedValues(
            message.payload.definition,
            message.payload.store.values,
            message.payload.store.repeaters,
          ),
        };

        respond({ requestId: message.requestId, ok: true, store });
        break;
      }
      case "IMPORT_COMPENDIUM_DATA": {
        const store = importCompendiumRow(
          message.payload.definition,
          message.payload.store,
          message.payload.binding,
          message.payload.entry,
        );

        respond({ requestId: message.requestId, ok: true, store });
        break;
      }
      case "VALIDATE_STEP": {
        const validation = validateWizardStep(
          message.payload.definition,
          message.payload.store,
          message.payload.stepId,
        );

        respond({
          requestId: message.requestId,
          ok: true,
          store: message.payload.store,
          validation,
        });
        break;
      }
      default: {
        const unknownMessage = message as { requestId?: string };
        respond({
          requestId: unknownMessage.requestId ?? "unknown",
          ok: false,
          error: "Unsupported worker message.",
        });
      }
    }
  } catch (error) {
    respond({
      requestId: message.requestId,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown worker error.",
    });
  }
};

export {};
