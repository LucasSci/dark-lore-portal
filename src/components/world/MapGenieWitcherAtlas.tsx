import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import L from "leaflet";
import { Compass, MapPinned, Route, Search, Sparkles, Trees } from "lucide-react";
import { toast } from "sonner";

import "leaflet/dist/leaflet.css";
import "./leaflet-atlas-overrides.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import AtlasSkeleton from "@/components/world/AtlasSkeleton";
import { cn } from "@/lib/utils";
import {
  getMapGenieWitcherMap,
  getLocalWitcherTileUrl,
  getRegionalMapGenieMaps,
  resolveLocalWitcherTileY,
  resolveAtlasRegionToRegionalMapId,
} from "@/lib/mapgenie-witcher";
import {
  addBattlemap,
  addLocation,
  addPointOfInterest,
  addRegion,
  addSubRegion,
  buildAtlasBattlemapTransition,
  buildAtlasRoute,
  clusterAtlasLocations,
  findLocationPath,
  getAllAtlasLocations,
  getAtlasBattlemapById,
  getAtlasDefaultLayers,
  getAtlasFocusFromRoute,
  getAtlasLayerLabel,
  getAtlasLocationTypeLabel,
  getAtlasViewportPolygon,
  getBoundsCenter,
  getPolygonBounds,
  inferAtlasZoomStage,
  loadAtlasWorld,
  readUploadedImageAsDataUrl,
  searchAtlasWorld,
  slugify,
  type AtlasBounds,
  type AtlasCoordinate,
  type AtlasLayerId,
  type AtlasLocationType,
  type AtlasPoiType,
  type AtlasWorld,
  updateBattlemap,
  updateLocation,
  updateRegion,
  updateSubRegion,
} from "@/lib/hierarchical-atlas";

const atlasCrs = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

const locationTypeOptions: AtlasLocationType[] = [
  "city",
  "village",
  "tradepost",
  "fortress",
  "harbor",
  "ruin",
  "dungeon",
  "wilderness",
];

const atlasStageOrder: AtlasZoomStage[] = [
  "world",
  "region",
  "subregion",
  "location",
  "battlemap",
];

const atlasStageLabels: Record<AtlasZoomStage, string> = {
  world: "Mundo",
  region: "Regiao",
  subregion: "Sub-regiao",
  location: "Local",
  battlemap: "Battlemap",
};

interface AtlasFocusProps {
  regionSlug?: string;
  subRegionSlug?: string;
  locationSlug?: string;
}

interface MapGenieWitcherAtlasProps {
  focus?: AtlasFocusProps;
  compact?: boolean;
  immersive?: boolean;
  className?: string;
}

function toLeafletPoint(point: AtlasCoordinate) {
  return L.latLng(point.y, point.x);
}

function toLeafletBounds(bounds: AtlasBounds) {
  return L.latLngBounds(
    [bounds.northEast.y, bounds.southWest.x],
    [bounds.southWest.y, bounds.northEast.x],
  );
}

function fromLeafletPoint(latLng: L.LatLng): AtlasCoordinate {
  return { x: latLng.lng, y: latLng.lat };
}

function fromLeafletBounds(bounds: L.LatLngBounds): AtlasBounds {
  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();

  return {
    southWest: { x: southWest.lng, y: southWest.lat },
    northEast: { x: northEast.lng, y: northEast.lat },
  };
}

function remapCoordinate(
  pointValue: AtlasCoordinate,
  sourceBounds: AtlasBounds,
  targetBounds: AtlasBounds,
): AtlasCoordinate {
  const sourceWidth = sourceBounds.northEast.x - sourceBounds.southWest.x;
  const sourceHeight = sourceBounds.southWest.y - sourceBounds.northEast.y;
  const targetWidth = targetBounds.northEast.x - targetBounds.southWest.x;
  const targetHeight = targetBounds.southWest.y - targetBounds.northEast.y;

  if (!sourceWidth || !sourceHeight) {
    return pointValue;
  }

  const xRatio = (pointValue.x - sourceBounds.southWest.x) / sourceWidth;
  const yRatio = (pointValue.y - sourceBounds.northEast.y) / sourceHeight;

  return {
    x: targetBounds.southWest.x + xRatio * targetWidth,
    y: targetBounds.northEast.y + yRatio * targetHeight,
  };
}

function buildRectAround(center: AtlasCoordinate, width: number, height: number): AtlasBounds {
  return {
    southWest: { x: center.x - width / 2, y: center.y + height / 2 },
    northEast: { x: center.x + width / 2, y: center.y - height / 2 },
  };
}

function buildIcon(label: string, tone: "region" | "location" | "poi" | "cluster") {
  const colors = {
    region: "rgba(109, 40, 217, 0.92)",
    location: "rgba(22, 163, 74, 0.92)",
    poi: "rgba(220, 38, 38, 0.92)",
    cluster: "rgba(245, 158, 11, 0.92)",
  };

  return L.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;min-width:34px;height:34px;padding:0 10px;border-radius:999px;background:${colors[tone]};border:1px solid rgba(241,206,132,.95);box-shadow:0 10px 30px rgba(0,0,0,.35);color:#f8f1de;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${label}</span>`,
    iconAnchor: [17, 17],
  });
}

function buildPath(focus: AtlasFocusProps) {
  const segments = ["/mapa"];

  if (focus.regionSlug) segments.push(encodeURIComponent(focus.regionSlug));
  if (focus.subRegionSlug) segments.push(encodeURIComponent(focus.subRegionSlug));
  if (focus.locationSlug) segments.push(encodeURIComponent(focus.locationSlug));

  return segments.join("/");
}

function getAtlasImageMaxZoom(nativeZoom: number | undefined, configuredMaxZoom: number, overscale = 0.25) {
  if (!nativeZoom) {
    return configuredMaxZoom;
  }

  return Math.min(configuredMaxZoom, nativeZoom + overscale);
}

function getAtlasMinZoomForViewport(
  map: L.Map,
  bounds: L.LatLngBounds,
  backgroundKind: "tiles" | "image",
  usesRegionalMap: boolean,
  fallbackMinZoom: number,
) {
  const fitZoom = map.getBoundsZoom(bounds, false, L.point(20, 20));

  if (!Number.isFinite(fitZoom)) {
    return fallbackMinZoom;
  }

  if (backgroundKind === "image") {
    return Math.min(fallbackMinZoom, fitZoom - (usesRegionalMap ? 0.15 : 0.45));
  }

  return Math.min(fallbackMinZoom, fitZoom);
}

export default function MapGenieWitcherAtlas({
  focus,
  compact = false,
  immersive = false,
  className,
}: MapGenieWitcherAtlasProps) {
  const navigate = useNavigate();
  const [world, setWorld] = useState<AtlasWorld>(() => loadAtlasWorld());
  const [zoomStage, setZoomStage] = useState(() => inferAtlasZoomStage(1.3));
  const [layers, setLayers] = useState<AtlasLayerId[]>(() => getAtlasDefaultLayers("world"));
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedRouteStart, setSelectedRouteStart] = useState("");
  const [selectedRouteEnd, setSelectedRouteEnd] = useState("");
  const [typeFilters, setTypeFilters] = useState<AtlasLocationType[]>(locationTypeOptions);
  const [rightMode, setRightMode] = useState<"details" | "gm">("details");
  const [battlemapPlacementMode, setBattlemapPlacementMode] = useState(false);
  const [battlemapFile, setBattlemapFile] = useState<File | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const [regionDraft, setRegionDraft] = useState({ name: "", description: "", biomeType: "", climate: "", dangerLevel: 3 });
  const [subRegionDraft, setSubRegionDraft] = useState({ name: "", description: "", terrainType: "", biomeType: "", climate: "", dangerLevel: 3 });
  const [locationDraft, setLocationDraft] = useState({ name: "", description: "", type: "city" as AtlasLocationType, population: "", faction: "" });
  const [poiDraft, setPoiDraft] = useState({ name: "", description: "", type: "tavern" as AtlasPoiType });
  const [battlemapDraft, setBattlemapDraft] = useState({ name: "", description: "", gridSize: 72, scale: 1.5, width: 44, height: 36, rotation: 0 });
  const mundiMap = useMemo(() => getMapGenieWitcherMap("mundi"), []);

  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupsRef = useRef<{
    regions: L.LayerGroup;
    subRegions: L.LayerGroup;
    terrain: L.LayerGroup;
    markers: L.LayerGroup;
    route: L.LayerGroup;
    battlemaps: L.LayerGroup;
    gm: L.LayerGroup;
  } | null>(null);

  const currentFocus = useMemo(
    () => getAtlasFocusFromRoute(world, focus?.regionSlug, focus?.subRegionSlug, focus?.locationSlug),
    [focus?.locationSlug, focus?.regionSlug, focus?.subRegionSlug, world],
  );

  const selectedRegion = currentFocus.region;
  const selectedSubRegion = currentFocus.subRegion;
  const selectedLocation = currentFocus.location;
  const selectedBattlemap = useMemo(
    () => getAtlasBattlemapById(world, selectedLocation?.battlemapId),
    [selectedLocation?.battlemapId, world],
  );
  const regionalMapId = useMemo(
    () =>
      resolveAtlasRegionToRegionalMapId(
        selectedRegion?.slug,
        selectedSubRegion?.slug,
        selectedLocation?.slug,
      ),
    [selectedLocation?.slug, selectedRegion?.slug, selectedSubRegion?.slug],
  );
  const regionalMap = useMemo(
    () =>
      regionalMapId
        ? getRegionalMapGenieMaps().find((entry) => entry.id === regionalMapId) ?? null
        : null,
    [regionalMapId],
  );
  const projection = useMemo(() => {
    if (selectedRegion && regionalMap) {
      const sourceBounds = getPolygonBounds(selectedRegion.polygonCoordinates);
      const targetBounds = {
        southWest: point(regionalMap.southWest[1], regionalMap.northEast[0]),
        northEast: point(regionalMap.northEast[1], regionalMap.southWest[0]),
      };

      return {
        sourceBounds,
        targetBounds,
        backgroundKind: regionalMap.kind,
        imageUrl: regionalMap.imagePath ?? world.imageUrl,
        mapId: regionalMap.id,
        maxZoom: regionalMap.maxZoom,
        minZoom: 2,
        usesRegionalMap: true,
      };
    }

      return {
        sourceBounds: world.bounds,
        targetBounds: world.bounds,
        backgroundKind: "image" as const,
        imageUrl: world.imageUrl,
        mapId: null,
        maxZoom: getAtlasImageMaxZoom(mundiMap.imageNativeZoom, mundiMap.maxZoom, 0.2),
        minZoom: -4,
        usesRegionalMap: false,
      };
    }, [mundiMap.imageNativeZoom, mundiMap.maxZoom, regionalMap?.imagePath, regionalMap?.imageSize, selectedRegion, world.bounds, world.imageUrl]);
  const projectCoordinate = useMemo(
    () => (pointValue: AtlasCoordinate) =>
      projection.usesRegionalMap
        ? remapCoordinate(pointValue, projection.sourceBounds, projection.targetBounds)
        : pointValue,
    [projection],
  );
  const unprojectCoordinate = useMemo(
    () => (pointValue: AtlasCoordinate) =>
      projection.usesRegionalMap
        ? remapCoordinate(pointValue, projection.targetBounds, projection.sourceBounds)
        : pointValue,
    [projection],
  );
  const projectBounds = useMemo(
    () => (boundsValue: AtlasBounds) => ({
      southWest: projectCoordinate(boundsValue.southWest),
      northEast: projectCoordinate(boundsValue.northEast),
    }),
    [projectCoordinate],
  );
  const unprojectBounds = useMemo(
    () => (boundsValue: AtlasBounds) => ({
      southWest: unprojectCoordinate(boundsValue.southWest),
      northEast: unprojectCoordinate(boundsValue.northEast),
    }),
    [unprojectCoordinate],
  );
  const allLocations = useMemo(() => getAllAtlasLocations(world), [world]);
  const filteredLocations = useMemo(
    () => allLocations.filter((location) => typeFilters.includes(location.type)),
    [allLocations, typeFilters],
  );
  const routePlan = useMemo(
    () => (selectedRouteStart && selectedRouteEnd ? buildAtlasRoute(world, selectedRouteStart, selectedRouteEnd) : null),
    [selectedRouteEnd, selectedRouteStart, world],
  );
  const searchResults = useMemo(() => searchAtlasWorld(world, deferredQuery), [deferredQuery, world]);
  const atlasStageTargets = useMemo(() => {
    const firstRegion = world.regions[0] ?? null;
    const firstSubRegion =
      selectedRegion?.subRegions[0] ??
      firstRegion?.subRegions[0] ??
      null;
    const firstLocation =
      selectedSubRegion?.locations[0] ??
      selectedRegion?.subRegions.flatMap((entry) => entry.locations)[0] ??
      firstSubRegion?.locations[0] ??
      null;
    const battlemapLocation =
      (selectedLocation?.battlemapId ? selectedLocation : null) ??
      selectedSubRegion?.locations.find((entry) => entry.battlemapId) ??
      selectedRegion?.subRegions.flatMap((entry) => entry.locations).find((entry) => entry.battlemapId) ??
      firstSubRegion?.locations.find((entry) => entry.battlemapId) ??
      null;

    return {
      world: {} as AtlasFocusProps,
      region: selectedRegion
        ? { regionSlug: selectedRegion.slug }
        : firstRegion
          ? { regionSlug: firstRegion.slug }
          : null,
      subregion: selectedSubRegion
        ? { regionSlug: selectedRegion?.slug, subRegionSlug: selectedSubRegion.slug }
        : selectedRegion && firstSubRegion
          ? { regionSlug: selectedRegion.slug, subRegionSlug: firstSubRegion.slug }
          : firstRegion && firstSubRegion
            ? { regionSlug: firstRegion.slug, subRegionSlug: firstSubRegion.slug }
            : null,
      location: selectedLocation
        ? {
            regionSlug: selectedRegion?.slug,
            subRegionSlug: selectedSubRegion?.slug,
            locationSlug: selectedLocation.slug,
          }
        : selectedRegion && selectedSubRegion && firstLocation
          ? {
              regionSlug: selectedRegion.slug,
              subRegionSlug: selectedSubRegion.slug,
              locationSlug: firstLocation.slug,
            }
          : null,
      battlemap: battlemapLocation
        ? findLocationPath(world, battlemapLocation.id)
        : null,
    };
  }, [selectedLocation, selectedRegion, selectedSubRegion, world]);
  const focusTrail = useMemo(
    () =>
      [selectedRegion?.name, selectedSubRegion?.name, selectedLocation?.name].filter(
        (value): value is string => Boolean(value),
      ),
    [selectedLocation?.name, selectedRegion?.name, selectedSubRegion?.name],
  );

  useEffect(() => {
    if (selectedRegion) {
      setRegionDraft({
        name: selectedRegion.name,
        description: selectedRegion.description,
        biomeType: selectedRegion.biomeType,
        climate: selectedRegion.climate,
        dangerLevel: selectedRegion.dangerLevel,
      });
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedSubRegion) {
      setSubRegionDraft({
        name: selectedSubRegion.name,
        description: selectedSubRegion.description,
        terrainType: selectedSubRegion.terrainType,
        biomeType: selectedSubRegion.biomeType,
        climate: selectedSubRegion.climate,
        dangerLevel: selectedSubRegion.dangerLevel,
      });
    }
  }, [selectedSubRegion]);

  useEffect(() => {
    if (selectedLocation) {
      setLocationDraft({
        name: selectedLocation.name,
        description: selectedLocation.description,
        type: selectedLocation.type,
        population: selectedLocation.population,
        faction: selectedLocation.faction,
      });
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedBattlemap) {
      const width = selectedBattlemap.bounds.northEast.x - selectedBattlemap.bounds.southWest.x;
      const height = selectedBattlemap.bounds.southWest.y - selectedBattlemap.bounds.northEast.y;

      setBattlemapDraft({
        name: selectedBattlemap.name,
        description: selectedBattlemap.description,
        gridSize: selectedBattlemap.gridSize,
        scale: selectedBattlemap.scale,
        width,
        height,
        rotation: selectedBattlemap.rotation ?? 0,
      });
    } else if (selectedLocation) {
      setBattlemapDraft((current) => ({
        ...current,
        name: `Battlemap de ${selectedLocation.name}`,
        description: `Recorte jogavel ligado a ${selectedLocation.name}.`,
      }));
    }
  }, [selectedBattlemap, selectedLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const targetBounds = selectedLocation
      ? projectBounds(buildRectAround(selectedLocation.coordinates, 90, 90))
      : selectedSubRegion
        ? getPolygonBounds(selectedSubRegion.polygonCoordinates.map(projectCoordinate))
        : selectedRegion
          ? projection.targetBounds
          : projection.targetBounds;

    map.flyToBounds(toLeafletBounds(targetBounds), {
      padding: compact ? [20, 20] : [48, 48],
      duration: 0.45,
    });
  }, [compact, projectBounds, projectCoordinate, projection.targetBounds, selectedLocation, selectedRegion, selectedSubRegion]);

  useEffect(() => {
    const groups = groupsRef.current;
    const map = mapRef.current;

    if (!groups || !map) {
      return;
    }

    groups.regions.clearLayers();
    groups.subRegions.clearLayers();
    groups.terrain.clearLayers();
    groups.markers.clearLayers();
    groups.route.clearLayers();
    groups.battlemaps.clearLayers();
    groups.gm.clearLayers();

    const visibleRegions = selectedRegion ? [selectedRegion] : world.regions;
    const visibleSubRegions = selectedSubRegion
      ? [selectedSubRegion]
      : selectedRegion
        ? selectedRegion.subRegions
        : zoomStage === "world"
          ? []
          : world.regions.flatMap((region) => region.subRegions);
    const visibleLocations = selectedSubRegion
      ? selectedSubRegion.locations.filter((location) => typeFilters.includes(location.type))
      : selectedRegion
        ? selectedRegion.subRegions.flatMap((subRegion) =>
            subRegion.locations.filter((location) => typeFilters.includes(location.type)),
          )
        : filteredLocations;

    visibleRegions.forEach((region, index) => {
      const hue = [208, 255, 34, 7][index % 4];
      const projectedRegionPolygon = region.polygonCoordinates.map(projectCoordinate);

      L.polygon(projectedRegionPolygon.map(toLeafletPoint), {
        color: `hsla(${hue}, 85%, 72%, 0.92)`,
        weight: 1.4,
        fillColor: `hsla(${hue}, 85%, 48%, 0.22)`,
        fillOpacity: zoomStage === "world" ? 0.16 : 0.07,
      })
        .bindTooltip(region.name, { sticky: true, direction: "top", opacity: 0.92 })
        .on("click", () => navigate(buildPath({ regionSlug: region.slug })))
        .addTo(groups.regions);

      if (zoomStage === "world") {
        L.marker(toLeafletPoint(getBoundsCenter(getPolygonBounds(projectedRegionPolygon))), {
          icon: buildIcon(region.name.slice(0, 2), "region"),
        })
          .on("click", () => navigate(buildPath({ regionSlug: region.slug })))
          .addTo(groups.markers);
      }
    });

    if (zoomStage !== "world") {
      visibleSubRegions.forEach((subRegion) => {
        const region = world.regions.find((entry) => entry.id === subRegion.regionId);
        const projectedSubRegionPolygon = subRegion.polygonCoordinates.map(projectCoordinate);

        L.polygon(projectedSubRegionPolygon.map(toLeafletPoint), {
          color: "#d6b15f",
          weight: 1,
          fillColor: "#0b1018",
          fillOpacity: 0.08,
          dashArray: "6 4",
        })
          .bindTooltip(subRegion.name, { sticky: true, direction: "center", opacity: 0.9 })
          .on("click", () => {
            if (region) {
              navigate(buildPath({ regionSlug: region.slug, subRegionSlug: subRegion.slug }));
            }
          })
          .addTo(groups.subRegions);

        if (layers.includes("roads")) {
          subRegion.roads.forEach((road) => {
            L.polyline(road.points.map(projectCoordinate).map(toLeafletPoint), {
              color: "#d6b15f",
              weight: zoomStage === "region" ? 1.4 : 2,
              opacity: 0.72,
            })
              .bindTooltip(road.name, { sticky: true })
              .addTo(groups.terrain);
          });
        }

        if (layers.includes("rivers")) {
          subRegion.rivers.forEach((river) => {
            L.polyline(river.points.map(projectCoordinate).map(toLeafletPoint), {
              color: "#38bdf8",
              weight: 2,
              opacity: 0.8,
            })
              .bindTooltip(river.name, { sticky: true })
              .addTo(groups.terrain);
          });
        }

        if (layers.includes("forests")) {
          subRegion.forests.forEach((forest) => {
            L.polygon(forest.points.map(projectCoordinate).map(toLeafletPoint), {
              color: "#16a34a",
              weight: 1,
              fillColor: "#16a34a",
              fillOpacity: 0.16,
            })
              .bindTooltip(forest.name, { sticky: true })
              .addTo(groups.terrain);
          });
        }
      });
    }

    if (zoomStage === "world" || (zoomStage === "region" && !selectedSubRegion)) {
      clusterAtlasLocations(visibleLocations).forEach((cluster) => {
        L.marker(toLeafletPoint(projectCoordinate(cluster.coordinates)), {
          icon: buildIcon(cluster.count > 1 ? String(cluster.count) : "1", "cluster"),
        })
          .bindTooltip(cluster.label, { sticky: true })
          .addTo(groups.markers);
      });
    } else {
      visibleLocations.forEach((location) => {
        const region = world.regions.find((entry) =>
          entry.subRegions.some((subRegion) => subRegion.id === location.subRegionId),
        );
        const subRegion = region?.subRegions.find((entry) => entry.id === location.subRegionId);

        L.marker(toLeafletPoint(projectCoordinate(location.coordinates)), {
          icon: buildIcon(location.name.slice(0, 2), "location"),
        })
          .bindTooltip(location.name, { sticky: true, direction: "top" })
          .on("click", () => {
            if (location.battlemapId && (selectedLocation?.id === location.id || zoomStage === "battlemap")) {
              const transition = buildAtlasBattlemapTransition(world, location.battlemapId);
              const battlemap = getAtlasBattlemapById(world, location.battlemapId);

              if (transition && battlemap) {
                map.flyToBounds(toLeafletBounds(projectBounds(battlemap.bounds)), { padding: [32, 32], duration: 0.35 });
                window.setTimeout(() => navigate(transition.href), 360);
              }
              return;
            }

            if (region && subRegion) {
              navigate(
                buildPath({
                  regionSlug: region.slug,
                  subRegionSlug: subRegion.slug,
                  locationSlug: location.slug,
                }),
              );
            }
          })
          .addTo(groups.markers);

        if (selectedLocation?.id === location.id && layers.includes("pois")) {
          location.pois.forEach((poi) => {
            L.marker(toLeafletPoint(projectCoordinate(poi.coordinates)), {
              icon: buildIcon(poi.name.slice(0, 2), "poi"),
            })
              .bindTooltip(poi.name, { sticky: true, direction: "top" })
              .addTo(groups.markers);
          });
        }
      });
    }

    if (routePlan) {
      L.polyline(routePlan.path.map(projectCoordinate).map(toLeafletPoint), {
        color: routePlan.risk === "high" ? "#ef4444" : routePlan.risk === "moderate" ? "#f59e0b" : "#16a34a",
        weight: 3,
        opacity: 0.92,
        dashArray: "10 10",
      }).addTo(groups.route);
    }

    if (layers.includes("battlemaps")) {
      const visibleBattlemapIds = new Set(
        visibleLocations.flatMap((location) => (location.battlemapId ? [location.battlemapId] : [])),
      );

      world.battlemaps
        .filter((battlemap) => visibleBattlemapIds.has(battlemap.id))
        .forEach((battlemap) => {
          const projectedBattlemapBounds = projectBounds(battlemap.bounds);

          L.rectangle(toLeafletBounds(projectedBattlemapBounds), {
            color: "#f59e0b",
            weight: 1.4,
            fillColor: "#f59e0b",
            fillOpacity: 0.16,
          })
            .bindTooltip(battlemap.name, { sticky: true, direction: "center" })
            .on("click", () => navigate(`/mesa?atlasBattlemap=${battlemap.id}`))
            .addTo(groups.battlemaps);

          if (selectedBattlemap?.id === battlemap.id && rightMode === "gm") {
            L.marker(toLeafletPoint(getBoundsCenter(projectedBattlemapBounds)), {
              icon: buildIcon("+", "poi"),
              draggable: true,
            })
              .on("dragend", (event) => {
                const marker = event.target as L.Marker;
                const center = unprojectCoordinate(fromLeafletPoint(marker.getLatLng()));

                setWorld(
                  updateBattlemap(world, battlemap.id, {
                    bounds: buildRectAround(center, battlemapDraft.width, battlemapDraft.height),
                    gridSize: battlemapDraft.gridSize,
                    scale: battlemapDraft.scale,
                    rotation: battlemapDraft.rotation,
                  }),
                );
                toast.success("Battlemap reposicionado pelo mestre.");
              })
              .addTo(groups.gm);
          }
        });
    }
  }, [
    battlemapDraft.gridSize,
    battlemapDraft.height,
    battlemapDraft.rotation,
    battlemapDraft.scale,
    battlemapDraft.width,
    filteredLocations,
    layers,
    navigate,
    projectBounds,
    projectCoordinate,
    rightMode,
    routePlan,
    selectedBattlemap?.id,
    selectedLocation?.id,
    selectedRegion,
    selectedSubRegion,
    typeFilters,
    unprojectCoordinate,
    world,
    zoomStage,
  ]);

  const currentTitle =
    selectedLocation?.name ?? selectedSubRegion?.name ?? selectedRegion?.name ?? world.name;
  const currentDescription =
    selectedLocation?.description ??
    selectedSubRegion?.description ??
    selectedRegion?.description ??
    world.description;

  const handleLayerToggle = (layer: AtlasLayerId) => {
    setLayers((current) =>
      current.includes(layer)
        ? current.filter((entry) => entry !== layer)
        : [...current, layer],
    );
  };

  const handleLocationFilterToggle = (type: AtlasLocationType) => {
    setTypeFilters((current) =>
      current.includes(type)
        ? current.filter((entry) => entry !== type)
        : [...current, type],
    );
  };

  const handleZoomStageJump = (stage: AtlasZoomStage) => {
    const nextFocus = atlasStageTargets[stage];

    if (!nextFocus) {
      toast("Este nivel ainda nao tem um foco pronto neste recorte.");
      return;
    }

    navigate(buildPath(nextFocus));
  };

  const handleSaveRegion = () => {
    if (!selectedRegion) {
      toast.error("Selecione uma regiao para editar.");
      return;
    }

    const nextWorld = updateRegion(world, selectedRegion.id, {
      name: regionDraft.name,
      slug: slugify(regionDraft.name),
      description: regionDraft.description,
      biomeType: regionDraft.biomeType,
      climate: regionDraft.climate,
      dangerLevel: Number(regionDraft.dangerLevel),
    });

    setWorld(nextWorld);
    navigate(buildPath({ regionSlug: slugify(regionDraft.name) }));
    toast.success("Regiao atualizada.");
  };

  const handleAddRegion = () => {
    const map = mapRef.current;

    if (!map || !regionDraft.name.trim()) {
      toast.error("Defina um nome para a nova regiao.");
      return;
    }

    const nextWorld = addRegion(world, {
      id: `region-${slugify(regionDraft.name)}`,
      slug: slugify(regionDraft.name),
      name: regionDraft.name,
      description: regionDraft.description,
      polygonCoordinates: getAtlasViewportPolygon(unprojectBounds(fromLeafletBounds(map.getBounds()))),
      biomeType: regionDraft.biomeType,
      climate: regionDraft.climate,
      dangerLevel: Number(regionDraft.dangerLevel),
      subRegions: [],
    });

    setWorld(nextWorld);
    navigate(buildPath({ regionSlug: slugify(regionDraft.name) }));
    toast.success("Nova regiao criada.");
  };

  const handleSaveSubRegion = () => {
    if (!selectedSubRegion || !selectedRegion) {
      toast.error("Selecione uma sub-regiao para editar.");
      return;
    }

    const nextWorld = updateSubRegion(world, selectedSubRegion.id, {
      name: subRegionDraft.name,
      slug: slugify(subRegionDraft.name),
      description: subRegionDraft.description,
      terrainType: subRegionDraft.terrainType,
      biomeType: subRegionDraft.biomeType,
      climate: subRegionDraft.climate,
      dangerLevel: Number(subRegionDraft.dangerLevel),
    });

    setWorld(nextWorld);
    navigate(buildPath({ regionSlug: selectedRegion.slug, subRegionSlug: slugify(subRegionDraft.name) }));
    toast.success("Sub-regiao atualizada.");
  };

  const handleAddSubRegion = () => {
    const map = mapRef.current;

    if (!map || !selectedRegion || !subRegionDraft.name.trim()) {
      toast.error("Selecione uma regiao e defina o nome da sub-regiao.");
      return;
    }

    const nextWorld = addSubRegion(world, selectedRegion.id, {
      id: `subregion-${slugify(subRegionDraft.name)}`,
      slug: slugify(subRegionDraft.name),
      regionId: selectedRegion.id,
      name: subRegionDraft.name,
      description: subRegionDraft.description,
      polygonCoordinates: getAtlasViewportPolygon(fromLeafletBounds(map.getBounds())),
      terrainType: subRegionDraft.terrainType,
      biomeType: subRegionDraft.biomeType,
      climate: subRegionDraft.climate,
      dangerLevel: Number(subRegionDraft.dangerLevel),
      roads: [],
      rivers: [],
      forests: [],
      settlements: [],
      secrets: [],
      events: [],
      locations: [],
    });

    setWorld(nextWorld);
    navigate(buildPath({ regionSlug: selectedRegion.slug, subRegionSlug: slugify(subRegionDraft.name) }));
    toast.success("Sub-regiao criada.");
  };

  const handleSaveLocation = () => {
    if (!selectedLocation || !selectedRegion || !selectedSubRegion) {
      toast.error("Selecione um local para editar.");
      return;
    }

    const nextWorld = updateLocation(world, selectedLocation.id, {
      name: locationDraft.name,
      slug: slugify(locationDraft.name),
      description: locationDraft.description,
      type: locationDraft.type,
      population: locationDraft.population,
      faction: locationDraft.faction,
    });

    setWorld(nextWorld);
    navigate(
      buildPath({
        regionSlug: selectedRegion.slug,
        subRegionSlug: selectedSubRegion.slug,
        locationSlug: slugify(locationDraft.name),
      }),
    );
    toast.success("Local atualizado.");
  };

  const handleAddLocation = () => {
    const map = mapRef.current;

    if (!map || !selectedSubRegion || !selectedRegion || !locationDraft.name.trim()) {
      toast.error("Selecione uma sub-regiao e defina o nome do local.");
      return;
    }

    const nextWorld = addLocation(world, selectedSubRegion.id, {
      id: `location-${slugify(locationDraft.name)}`,
      slug: slugify(locationDraft.name),
      subRegionId: selectedSubRegion.id,
      name: locationDraft.name,
      type: locationDraft.type,
      coordinates: fromLeafletPoint(map.getCenter()),
      population: locationDraft.population,
      faction: locationDraft.faction,
      description: locationDraft.description,
      districts: [],
      npcs: [],
      shops: [],
      quests: [],
      events: [],
      pois: [],
    });

    setWorld(nextWorld);
    navigate(
      buildPath({
        regionSlug: selectedRegion.slug,
        subRegionSlug: selectedSubRegion.slug,
        locationSlug: slugify(locationDraft.name),
      }),
    );
    toast.success("Local criado no centro da viewport.");
  };

  const handleAddPoi = () => {
    const map = mapRef.current;

    if (!map || !selectedLocation || !poiDraft.name.trim()) {
      toast.error("Selecione um local e defina o nome do POI.");
      return;
    }

    const nextWorld = addPointOfInterest(world, selectedLocation.id, {
      id: `poi-${slugify(poiDraft.name)}`,
      locationId: selectedLocation.id,
      type: poiDraft.type,
      name: poiDraft.name,
      description: poiDraft.description,
      icon: poiDraft.type,
      coordinates: fromLeafletPoint(map.getCenter()),
    });

    setWorld(nextWorld);
    toast.success("POI adicionado ao local.");
  };

  const handleCreateBattlemap = async () => {
    if (!selectedLocation || !battlemapFile) {
      toast.error("Selecione um local e uma imagem para o battlemap.");
      return;
    }

    const battlemapId =
      selectedLocation.battlemapId ?? `battlemap-${slugify(battlemapDraft.name || selectedLocation.name)}`;
    const imageUrl = await readUploadedImageAsDataUrl(battlemapFile);
    const bounds = buildRectAround(selectedLocation.coordinates, battlemapDraft.width, battlemapDraft.height);

    let nextWorld = selectedLocation.battlemapId
      ? updateBattlemap(world, battlemapId, {
          name: battlemapDraft.name || selectedLocation.name,
          description: battlemapDraft.description,
          imageUrl,
          gridSize: battlemapDraft.gridSize,
          scale: battlemapDraft.scale,
          bounds,
          rotation: battlemapDraft.rotation,
        })
      : addBattlemap(world, {
          id: battlemapId,
          name: battlemapDraft.name || selectedLocation.name,
          description: battlemapDraft.description,
          imageUrl,
          gridSize: battlemapDraft.gridSize,
          scale: battlemapDraft.scale,
          bounds,
          rotation: battlemapDraft.rotation,
          linkedLocationId: selectedLocation.id,
        });

    nextWorld = updateLocation(nextWorld, selectedLocation.id, { battlemapId });
    setWorld(nextWorld);
    toast.success("Battlemap vinculado ao local.");
  };

  useEffect(() => {
    const host = mapHostRef.current;

    if (!host) {
      return;
    }

    setIsMapReady(false);
    host.innerHTML = "";

    const map = L.map(host, {
      crs: regionalMap?.crs === "geo" ? L.CRS.EPSG3857 : atlasCrs,
      attributionControl: false,
      zoomControl: false,
      zoomSnap: projection.backgroundKind === "image" ? 0.125 : 0.25,
      zoomDelta: projection.backgroundKind === "image" ? 0.125 : 0.25,
      minZoom: projection.minZoom,
      maxZoom: projection.maxZoom,
      maxBoundsViscosity: 0.88,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      inertiaDeceleration: 2200,
      easeLinearity: 0.18,
      wheelDebounceTime: 18,
      wheelPxPerZoomLevel: projection.backgroundKind === "image" ? 180 : 140,
    });

    const bounds = toLeafletBounds(projection.targetBounds);

    L.control.zoom({ position: "topright" }).addTo(map);
    if (projection.backgroundKind === "tiles" && projection.mapId) {
      const tileLayerOptions: L.TileLayerOptions = {
        bounds,
        noWrap: true,
        tms: regionalMap?.crs !== "simple",
        keepBuffer: 6,
        updateWhenIdle: true,
        updateWhenZooming: true,
      };

      if (regionalMap?.crs === "simple") {
        tileLayerOptions.continuousWorld = true;
      }

      const tileLayer = L.tileLayer(getLocalWitcherTileUrl(projection.mapId), tileLayerOptions);

      if (regionalMap?.crs === "simple") {
        tileLayer.getTileUrl = (coords) => {
          const resolvedY = resolveLocalWitcherTileY(projection.mapId!, coords.z, coords.y);

          return getLocalWitcherTileUrl(projection.mapId!)
            .replace("{z}", String(coords.z))
            .replace("{x}", String(coords.x))
            .replace("{y}", String(resolvedY));
        };
      }

      tileLayer.addTo(map);
    } else {
      L.imageOverlay(projection.imageUrl, bounds, { opacity: 0.98 }).addTo(map);
    }
    const resolvedMinZoom = getAtlasMinZoomForViewport(
      map,
      bounds,
      projection.backgroundKind,
      projection.usesRegionalMap,
      projection.minZoom,
    );
    map.setMinZoom(resolvedMinZoom);
    map.fitBounds(bounds, { animate: false, padding: [20, 20], maxZoom: projection.maxZoom });
    map.setMaxBounds(bounds.pad(projection.backgroundKind === "tiles" ? 0.04 : 0.16));
    setZoomStage(inferAtlasZoomStage(map.getZoom()));
    map.whenReady(() => {
      map.invalidateSize();
      window.requestAnimationFrame(() => setIsMapReady(true));
    });

    groupsRef.current = {
      regions: L.layerGroup().addTo(map),
      subRegions: L.layerGroup().addTo(map),
      terrain: L.layerGroup().addTo(map),
      markers: L.layerGroup().addTo(map),
      route: L.layerGroup().addTo(map),
      battlemaps: L.layerGroup().addTo(map),
      gm: L.layerGroup().addTo(map),
    };

    mapRef.current = map;
    map.on("zoomend", () => setZoomStage(inferAtlasZoomStage(map.getZoom())));
    map.on("click", (event) => {
      if (!battlemapPlacementMode || !selectedBattlemap) {
        return;
      }

      const center = unprojectCoordinate(fromLeafletPoint(event.latlng));
      setWorld(
        updateBattlemap(world, selectedBattlemap.id, {
          bounds: buildRectAround(center, battlemapDraft.width, battlemapDraft.height),
          gridSize: battlemapDraft.gridSize,
          scale: battlemapDraft.scale,
          rotation: battlemapDraft.rotation,
        }),
      );
      setBattlemapPlacementMode(false);
      toast.success("Battlemap reposicionado no atlas.");
    });

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(host);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      groupsRef.current = null;
    };
  }, [
    battlemapDraft.gridSize,
    battlemapDraft.height,
    battlemapDraft.rotation,
    battlemapDraft.scale,
    battlemapDraft.width,
    battlemapPlacementMode,
    projection,
    regionalMap?.crs,
    selectedBattlemap,
    world,
  ]);

  return (
    <div
      className={cn(
        "grid gap-6",
        immersive
          ? "xl:grid-cols-[280px_minmax(0,1fr)_320px] 2xl:grid-cols-[300px_minmax(0,1fr)_340px]"
          : "xl:grid-cols-[320px_minmax(0,1fr)_360px]",
        className,
      )}
    >
      <Card
        variant="panel"
        className={cn(
          "overflow-hidden backdrop-blur-xl",
          immersive && "xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)]",
        )}
      >
        <CardContent className="flex h-full flex-col gap-4 p-4 md:p-5">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">Atlas hierarquico</p>
            <h2 className="font-heading text-xl text-foreground">Exploracao, camadas e rotas</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cidade, regiao ou battlemap..." className="pl-10" />
            </div>
          </div>
          <ScrollArea
            className={cn(
              "min-h-0 flex-1 pr-3",
              immersive ? "h-[calc(100vh-14rem)]" : "h-[560px]",
            )}
          >
            <div className="space-y-4">
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">Busca global</p>
                </div>
                {searchResults.length ? searchResults.map((result) => (
                  <button key={result.id} type="button" onClick={() => navigate(buildPath(result.path))} className="w-full rounded-xl border border-border/60 bg-background/72 px-3 py-3 text-left backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-primary/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{result.label}</p>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-primary/80">{result.kind}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{result.description}</p>
                  </button>
                )) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-background/72 p-4 text-sm leading-6 text-muted-foreground backdrop-blur-md">
                    Busque por regiao, sub-regiao, local, POI ou battlemap.
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trees className="h-4 w-4 text-primary" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">Camadas e filtros</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["roads", "rivers", "forests", "settlements", "pois", "npcs", "factions", "events", "battlemaps"] as AtlasLayerId[]).map((layer) => (
                    <Button key={layer} type="button" size="sm" variant={layers.includes(layer) ? "primary" : "outline"} onClick={() => handleLayerToggle(layer)} className="text-xs uppercase tracking-[0.16em]">
                      {getAtlasLayerLabel(layer)}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {locationTypeOptions.map((type) => (
                    <Button key={type} type="button" size="sm" variant={typeFilters.includes(type) ? "secondary" : "ghost"} onClick={() => handleLocationFilterToggle(type)} className="text-xs uppercase tracking-[0.16em]">
                      {getAtlasLocationTypeLabel(type)}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="space-y-3 rounded-xl border border-border/60 bg-background/30 p-4">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-primary" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">Rotas</p>
                </div>
                <select value={selectedRouteStart} onChange={(event) => setSelectedRouteStart(event.target.value)} className="flex h-10 w-full rounded-[calc(var(--radius)-4px)] border border-input bg-surface-raised/55 px-3 text-sm text-foreground">
                  <option value="">Origem</option>
                  {allLocations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
                <select value={selectedRouteEnd} onChange={(event) => setSelectedRouteEnd(event.target.value)} className="flex h-10 w-full rounded-[calc(var(--radius)-4px)] border border-input bg-surface-raised/55 px-3 text-sm text-foreground">
                  <option value="">Destino</option>
                  {allLocations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
                {routePlan ? (
                  <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                    <p>Distancia: <span className="text-foreground">{routePlan.distanceKm} km</span></p>
                    <p>Jornada: <span className="text-foreground">{routePlan.estimatedDays} dias</span></p>
                    <p>Perigo: <span className="text-foreground">{routePlan.risk}</span></p>
                    <p className="text-xs">Ameacas: {routePlan.commonThreats.join(", ")}</p>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    Selecione origem e destino para estimar distancia e risco.
                  </p>
                )}
              </section>

              <section className="space-y-3 rounded-xl border border-border/60 bg-background/30 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">Nitidez</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Estrategia ativa: o mundi serve para orientacao macro. Para detalhe fino, abra a carta regional em tiles locais.
                </p>
                {regionalMap ? (
                  <Button asChild className="w-full">
                    <Link to={`/mapa/regional/${regionalMap.id}`}>Abrir {regionalMap.title} em alta</Link>
                  </Button>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    Este foco ainda nao possui carta regional dedicada em alta resolucao.
                  </p>
                )}
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card variant="elevated" className="overflow-hidden border-primary/15 shadow-[0_24px_80px_hsl(var(--background)/0.45)]">
        <CardContent className="space-y-5 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  Navegacao progressiva
                </p>
              </div>
              <h2 className="font-display text-3xl text-gold-gradient">{currentTitle}</h2>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{currentDescription}</p>
              {focusTrail.length ? (
                <div className="flex flex-wrap gap-2">
                  {focusTrail.map((segment) => (
                    <Badge
                      key={segment}
                      variant="outline"
                      className="border-border/60 bg-background/55 text-foreground/90"
                    >
                      {segment}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex max-w-xl flex-wrap items-center justify-end gap-2">
              <Badge variant="outline" className="border-primary/25 text-primary">
                <Compass className="mr-2 h-3.5 w-3.5" />
                {atlasStageLabels[zoomStage]}
              </Badge>
              <Badge variant="outline" className="border-primary/25 text-primary">
                {world.regions.length} regioes
              </Badge>
              {atlasStageOrder.map((stage) => {
                const nextFocus = atlasStageTargets[stage];
                const isActive = zoomStage === stage;

                return (
                  <Button
                    key={stage}
                    type="button"
                    size="sm"
                    variant={isActive ? "primary" : nextFocus ? "outline" : "ghost"}
                    className="text-[10px] uppercase tracking-[0.18em]"
                    onClick={() => handleZoomStageJump(stage)}
                    disabled={!nextFocus}
                  >
                    {atlasStageLabels[stage]}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[var(--radius)] border border-border/70 bg-[#090806]">
            {!isMapReady ? <AtlasSkeleton compact={compact} immersive={immersive} /> : null}
            <div
              className={cn(
                "w-full transition-opacity duration-300",
                isMapReady ? "opacity-100" : "opacity-0",
                immersive
                  ? "h-[calc(100vh-18rem)] min-h-[720px]"
                  : compact
                    ? "h-[420px]"
                    : "h-[70vh] min-h-[560px]",
              )}
            >
              <div ref={mapHostRef} className="h-full w-full" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 p-4">
              <div className="mx-auto flex max-w-4xl justify-center">
                <div className="pointer-events-auto rounded-full border border-border/60 bg-background/68 px-4 py-2 backdrop-blur-xl">
                  <p className="text-center text-xs uppercase tracking-[0.18em] text-primary/80">
                    Visao por camadas: abra o mundo, mergulhe na regiao, entre no local, desca ao battlemap
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        variant="panel"
        className={cn(
          "overflow-hidden backdrop-blur-xl",
          immersive && "xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)]",
        )}
      >
        <CardContent className="flex h-full flex-col gap-4 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">Painel lateral</p>
              <h3 className="font-heading text-xl text-foreground">{rightMode === "details" ? "Lore do local" : "Ferramentas do mestre"}</h3>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={rightMode === "details" ? "primary" : "outline"} onClick={() => setRightMode("details")}>Detalhes</Button>
              <Button size="sm" variant={rightMode === "gm" ? "primary" : "outline"} onClick={() => setRightMode("gm")}>Mestre</Button>
            </div>
          </div>
          <ScrollArea
            className={cn(
              "min-h-0 flex-1 pr-3",
              immersive ? "h-[calc(100vh-14rem)]" : "h-[560px]",
            )}
          >
            {rightMode === "details" ? (
              <div className="space-y-4">
                <section className="rounded-xl border border-border/60 bg-background/30 p-4">
                  <p className="font-heading text-lg text-foreground">{currentTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {currentDescription}
                  </p>
                  {selectedLocation ? (
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Tipo</p>
                        <p className="mt-1 text-foreground">{getAtlasLocationTypeLabel(selectedLocation.type)}</p>
                      </div>
                      <div className="rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">POIs</p>
                        <p className="mt-1 text-foreground">{selectedLocation.pois.length}</p>
                      </div>
                      <div className="rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Populacao</p>
                        <p className="mt-1 text-foreground">{selectedLocation.population}</p>
                      </div>
                      <div className="rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Facao</p>
                        <p className="mt-1 text-foreground">{selectedLocation.faction}</p>
                      </div>
                    </div>
                  ) : null}
                </section>

                {selectedSubRegion ? (
                  <section className="rounded-xl border border-border/60 bg-background/30 p-4 text-sm leading-6 text-muted-foreground">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">Sub-regiao</p>
                    <p className="mt-2">Terreno: {selectedSubRegion.terrainType}</p>
                    <p>Clima: {selectedSubRegion.climate}</p>
                    <p>Perigo: {selectedSubRegion.dangerLevel}/5</p>
                    {selectedSubRegion.events.map((eventItem) => (
                      <p key={eventItem}>- {eventItem}</p>
                    ))}
                  </section>
                ) : null}

                {selectedLocation ? (
                  <>
                    <section className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">Distritos e POIs</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedLocation.districts.map((district) => (
                          <Badge key={district} variant="outline" className="border-border/60 text-foreground">{district}</Badge>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2">
                        {selectedLocation.pois.map((poi) => (
                          <div key={poi.id} className="rounded-lg border border-border/40 bg-background/50 px-3 py-3">
                            <p className="font-medium text-foreground">{poi.name}</p>
                            <p className="text-sm leading-6 text-muted-foreground">{poi.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">NPCs e comercio</p>
                      <div className="mt-3 space-y-3">
                        {selectedLocation.npcs.map((npc) => (
                          <div key={npc.id} className="rounded-lg border border-border/40 bg-background/50 px-3 py-3">
                            <p className="font-medium text-foreground">{npc.name}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-primary/80">{npc.role}</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{npc.description}</p>
                          </div>
                        ))}
                        {selectedLocation.shops.map((shop) => (
                          <div key={shop.id} className="rounded-lg border border-border/40 bg-background/50 px-3 py-3">
                            <p className="font-medium text-foreground">{shop.name}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-primary/80">{shop.specialty}</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">{shop.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-xl border border-border/60 bg-background/30 p-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">Battlemap vinculado</p>
                      {selectedBattlemap ? (
                        <div className="mt-3 space-y-3">
                          <div className="overflow-hidden rounded-lg border border-border/40 bg-background/50">
                            <img src={selectedBattlemap.imageUrl} alt={selectedBattlemap.name} className="h-40 w-full object-cover" />
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{selectedBattlemap.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-lg border border-border/40 bg-background/50 px-3 py-2">Grid: {selectedBattlemap.gridSize}px</div>
                            <div className="rounded-lg border border-border/40 bg-background/50 px-3 py-2">Escala: {selectedBattlemap.scale}m</div>
                          </div>
                          <Button className="w-full" onClick={() => navigate(`/mesa?atlasBattlemap=${selectedBattlemap.id}`)}>
                            Abrir battlemap na mesa
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">Este local ainda nao possui battlemap vinculado.</p>
                      )}
                    </section>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <section className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">Editar regiao</p>
                  <Input value={regionDraft.name} onChange={(event) => setRegionDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nome da regiao" />
                  <Textarea value={regionDraft.description} onChange={(event) => setRegionDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Descricao da regiao" />
                  <Input value={regionDraft.biomeType} onChange={(event) => setRegionDraft((current) => ({ ...current, biomeType: event.target.value }))} placeholder="Bioma" />
                  <Input value={regionDraft.climate} onChange={(event) => setRegionDraft((current) => ({ ...current, climate: event.target.value }))} placeholder="Clima" />
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleSaveRegion}>Salvar</Button>
                    <Button variant="outline" className="flex-1" onClick={handleAddRegion}>Nova</Button>
                  </div>
                </section>

                <section className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">Editar sub-regiao</p>
                  <Input value={subRegionDraft.name} onChange={(event) => setSubRegionDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nome da sub-regiao" />
                  <Textarea value={subRegionDraft.description} onChange={(event) => setSubRegionDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Descricao da sub-regiao" />
                  <Input value={subRegionDraft.terrainType} onChange={(event) => setSubRegionDraft((current) => ({ ...current, terrainType: event.target.value }))} placeholder="Terreno" />
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleSaveSubRegion}>Salvar</Button>
                    <Button variant="outline" className="flex-1" onClick={handleAddSubRegion}>Nova</Button>
                  </div>
                </section>

                <section className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">Editar local</p>
                  <Input value={locationDraft.name} onChange={(event) => setLocationDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do local" />
                  <Textarea value={locationDraft.description} onChange={(event) => setLocationDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Descricao do local" />
                  <select value={locationDraft.type} onChange={(event) => setLocationDraft((current) => ({ ...current, type: event.target.value as AtlasLocationType }))} className="flex h-10 w-full rounded-[calc(var(--radius)-4px)] border border-input bg-surface-raised/55 px-3 text-sm text-foreground">
                    {locationTypeOptions.map((type) => (
                      <option key={type} value={type}>{getAtlasLocationTypeLabel(type)}</option>
                    ))}
                  </select>
                  <Input value={locationDraft.population} onChange={(event) => setLocationDraft((current) => ({ ...current, population: event.target.value }))} placeholder="Populacao" />
                  <Input value={locationDraft.faction} onChange={(event) => setLocationDraft((current) => ({ ...current, faction: event.target.value }))} placeholder="Facao" />
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleSaveLocation}>Salvar</Button>
                    <Button variant="outline" className="flex-1" onClick={handleAddLocation}>Novo</Button>
                  </div>
                </section>

                <section className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">Novo POI</p>
                  <Input value={poiDraft.name} onChange={(event) => setPoiDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do POI" />
                  <Textarea value={poiDraft.description} onChange={(event) => setPoiDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Descricao do POI" />
                  <select value={poiDraft.type} onChange={(event) => setPoiDraft((current) => ({ ...current, type: event.target.value as AtlasPoiType }))} className="flex h-10 w-full rounded-[calc(var(--radius)-4px)] border border-input bg-surface-raised/55 px-3 text-sm text-foreground">
                    <option value="tavern">Taverna</option>
                    <option value="blacksmith">Ferreiro</option>
                    <option value="temple">Templo</option>
                    <option value="market">Mercado</option>
                    <option value="alchemist">Alquimista</option>
                    <option value="notice-board">Quadro</option>
                    <option value="harbor">Porto</option>
                    <option value="hideout">Refugio</option>
                  </select>
                  <Button className="w-full" onClick={handleAddPoi}>Adicionar no centro da viewport</Button>
                </section>

                <section className="rounded-xl border border-border/60 bg-background/30 p-4 space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-primary/80">Battlemap</p>
                  <Input value={battlemapDraft.name} onChange={(event) => setBattlemapDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do battlemap" />
                  <Textarea value={battlemapDraft.description} onChange={(event) => setBattlemapDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Descricao do battlemap" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" min={32} value={battlemapDraft.gridSize} onChange={(event) => setBattlemapDraft((current) => ({ ...current, gridSize: Number(event.target.value) || 72 }))} placeholder="Grid px" />
                    <Input type="number" min={0.5} step={0.1} value={battlemapDraft.scale} onChange={(event) => setBattlemapDraft((current) => ({ ...current, scale: Number(event.target.value) || 1.5 }))} placeholder="Escala" />
                    <Input type="number" min={10} value={battlemapDraft.width} onChange={(event) => setBattlemapDraft((current) => ({ ...current, width: Number(event.target.value) || 44 }))} placeholder="Largura" />
                    <Input type="number" min={10} value={battlemapDraft.height} onChange={(event) => setBattlemapDraft((current) => ({ ...current, height: Number(event.target.value) || 36 }))} placeholder="Altura" />
                  </div>
                  <Input type="number" min={0} max={360} value={battlemapDraft.rotation} onChange={(event) => setBattlemapDraft((current) => ({ ...current, rotation: Number(event.target.value) || 0 }))} placeholder="Rotacao" />
                  <input type="file" accept="image/*" onChange={(event) => setBattlemapFile(event.target.files?.[0] ?? null)} />
                  <div className="grid gap-2 md:grid-cols-2">
                    <Button className="w-full" onClick={() => void handleCreateBattlemap()}>Criar ou atualizar</Button>
                    <Button variant="outline" className="w-full" onClick={() => setBattlemapPlacementMode((current) => !current)} disabled={!selectedBattlemap && !selectedLocation}>
                      {battlemapPlacementMode ? "Clique no mapa" : "Reposicionar"}
                    </Button>
                  </div>
                </section>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
