import { useState, useCallback } from "react";
import type { MouseEvent } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "@vnedyalk0v/react19-simple-maps";
import type { VisitedCountry } from "../../lib/profile";
import { lookupById, isVisited } from "../../lib/travel";
import { useMediaQuery } from "../../lib/use-media-query";
import { CountryPopover } from "./CountryPopover";
import { CountryBottomSheet } from "./CountryBottomSheet";
import { VisitedList } from "./VisitedList";

export interface WorldMapProps {
  countries: readonly VisitedCountry[];
}

type Selection =
  | { kind: "none" }
  | { kind: "country"; id: string; anchor: { x: number; y: number } };

const GEO_URL = "/data/world-110m.json";

const ZOOM_MIN = 1;
const ZOOM_MAX = 8;
const ZOOM_STEP = 1.5;

interface GeoFeature {
  rsmKey: string;
  id: string;
}

export function WorldMap({ countries }: WorldMapProps) {
  const [selection, setSelection] = useState<Selection>({ kind: "none" });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const close = useCallback(() => setSelection({ kind: "none" }), []);

  const openFor = useCallback(
    (id: string, anchor: { x: number; y: number }) => {
      if (!isVisited(countries, id)) return;
      setSelection({ kind: "country", id, anchor });
    },
    [countries],
  );

  const onCountryClick = (id: string, e: MouseEvent) => {
    openFor(id, { x: e.clientX, y: e.clientY });
  };

  const onListSelect = (id: string, e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    openFor(id, { x: rect.left + 16, y: rect.bottom });
  };

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z * ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, z / ZOOM_STEP));
  const reset = () => {
    setZoom(1);
    setCenter([0, 20]);
    close();
  };

  const onMoveStart = () => close();
  const onMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  };

  const selected =
    selection.kind === "country" ? lookupById(countries, selection.id) : undefined;

  return (
    <div className="world-map">
      <div className="world-map__svg-wrap">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          width={800}
          height={420}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={ZOOM_MIN}
            maxZoom={ZOOM_MAX}
            onMoveStart={onMoveStart}
            onMoveEnd={onMoveEnd}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: GeoFeature[] }) =>
                geographies.map((geo) => {
                  const visited = isVisited(countries, geo.id);
                  const isSelected =
                    selection.kind === "country" && selection.id === geo.id;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className={
                        "country" +
                        (visited ? " country--visited" : " country--unvisited") +
                        (isSelected ? " is-selected" : "")
                      }
                      tabIndex={visited ? 0 : -1}
                      aria-label={
                        visited
                          ? `${lookupById(countries, geo.id)?.name}, visited. Click for trip details.`
                          : undefined
                      }
                      onClick={(e: MouseEvent) => {
                        if (visited) onCountryClick(geo.id, e);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        <div className="world-map__controls" role="group" aria-label="Map zoom">
          <button type="button" onClick={zoomIn} aria-label="Zoom in">+</button>
          <button type="button" onClick={zoomOut} aria-label="Zoom out">−</button>
          <button type="button" onClick={reset} aria-label="Reset zoom">⟲</button>
        </div>
      </div>

      <VisitedList countries={countries} onSelect={onListSelect} />

      {selected && isDesktop && (
        <CountryPopover
          country={selected}
          anchor={selection.kind === "country" ? selection.anchor : { x: 0, y: 0 }}
          onClose={close}
        />
      )}
      {selected && !isDesktop && (
        <CountryBottomSheet country={selected} onClose={close} />
      )}

      <style>{`
        .world-map { display: block; }
        .world-map__svg-wrap {
          position: relative;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          overflow: hidden;
        }
        .country--unvisited {
          fill: var(--bg-elev);
          stroke: var(--border);
          stroke-width: 0.5;
          outline: none;
        }
        .country--visited {
          fill: var(--accent);
          stroke: var(--bg);
          stroke-width: 0.5;
          cursor: pointer;
          outline: none;
          transition: filter 200ms ease;
        }
        .country--visited:hover,
        .country--visited:focus-visible,
        .country--visited.is-selected {
          filter: drop-shadow(0 0 8px var(--accent-soft));
        }
        .world-map__controls {
          position: absolute;
          right: var(--space-3);
          bottom: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--bg-elev);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 4px;
        }
        .world-map__controls button {
          width: 32px; height: 32px;
          font-family: var(--font-mono);
          color: var(--fg);
          border-radius: var(--radius-sm);
        }
        .world-map__controls button:hover {
          color: var(--accent);
          background: var(--accent-soft);
        }
      `}</style>
    </div>
  );
}

export default WorldMap;
