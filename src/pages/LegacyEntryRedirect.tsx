import { Navigate, useParams } from "react-router-dom";

import { getEncyclopediaEntry } from "@/lib/encyclopedia";

export default function LegacyEntryRedirect() {
  const { entrySlug } = useParams<{ entrySlug: string }>();
  const entry = entrySlug ? getEncyclopediaEntry(entrySlug) : null;

  if (!entry) {
    return <Navigate to="/mundo" replace />;
  }

  if (entry.category === "personagens") {
    return <Navigate to={`/personagem/${entry.slug}`} replace />;
  }

  if (entry.category === "monstros") {
    return <Navigate to={`/criatura/${entry.slug}`} replace />;
  }

  return <Navigate to="/mundo" replace />;
}
