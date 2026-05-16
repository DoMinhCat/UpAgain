import { Box, Paper, Text, useComputedColorScheme } from "@mantine/core";
import {
  Map,
  AdvancedMarker,
  APIProvider,
  useMap,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconMapPin } from "@tabler/icons-react";

const COLORS = {
  primary: "#45a575",
  primaryDark: "#357a58",
  selected: "#e3b23c",
  selectedDark: "#c99a2e",
  white: "#ffffff",
  markerShadow: "rgba(0, 0, 0, 0.25)",
} as const;

export interface MapLocation {
  id: number;
  lat: number;
  lng: number;
  label?: string;
}

interface EmbeddedMapProps {
  /** Array of locations to display as markers */
  locations: MapLocation[];
  /** When set, the map smoothly pans & zooms to this location */
  centerOnId?: number | null;
  /** Callback fired when a marker is clicked */
  onMarkerClick?: (id: number) => void;
  /** Map container height — accepts any CSS value */
  height?: string | number;
  /** Default zoom level when showing a single location */
  zoom?: number;
}

function CustomMarker({
  label,
  isSelected,
  onClick,
}: {
  label?: string;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const bg = isSelected ? COLORS.selected : COLORS.primary;
  const bgDark = isSelected ? COLORS.selectedDark : COLORS.primaryDark;

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        filter: `drop-shadow(0 2px 4px ${COLORS.markerShadow})`,
        transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isSelected ? "scale(1.2)" : "scale(1)",
      }}
    >
      {label && (
        <div
          style={{
            background: bg,
            color: COLORS.white,
            fontSize: "11px",
            fontWeight: 700,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            padding: "3px 8px",
            borderRadius: "6px",
            marginBottom: "4px",
            whiteSpace: "nowrap",
            letterSpacing: "0.3px",
            boxShadow: `0 1px 3px ${COLORS.markerShadow}`,
          }}
        >
          {label}
        </div>
      )}

      <div
        style={{
          width: isSelected ? 36 : 30,
          height: isSelected ? 36 : 30,
          borderRadius: "50% 50% 50% 0",
          background: `linear-gradient(135deg, ${bg} 0%, ${bgDark} 100%)`,
          transform: "rotate(-45deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2.5px solid ${COLORS.white}`,
          boxShadow: isSelected
            ? `0 0 0 3px ${bg}44, 0 4px 12px ${COLORS.markerShadow}`
            : `0 2px 6px ${COLORS.markerShadow}`,
          transition: "width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <IconMapPin
          size={isSelected ? 18 : 15}
          color={COLORS.white}
          style={{
            transform: "rotate(45deg)",
            transition: "all 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Map Controller (smooth pan + zoom) ───
function MapController({
  locations,
  centerOnId,
  zoom,
}: {
  locations: MapLocation[];
  centerOnId?: number | null;
  zoom: number;
}) {
  const map = useMap();
  const prevCenterRef = useRef<number | null | undefined>(undefined);
  const isInitialMount = useRef(true);

  // Fit bounds to show all locations on initial mount
  const fitAllMarkers = useCallback(() => {
    if (!map || locations.length === 0) return;

    if (locations.length === 1) {
      map.setCenter({ lat: locations[0].lat, lng: locations[0].lng });
      map.setZoom(zoom);
      return;
    }

    const bounds = {
      north: Math.max(...locations.map((l) => l.lat)),
      south: Math.min(...locations.map((l) => l.lat)),
      east: Math.max(...locations.map((l) => l.lng)),
      west: Math.min(...locations.map((l) => l.lng)),
    };
    map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
  }, [map, locations, zoom]);

  useEffect(() => {
    if (!map || locations.length === 0) return;

    // Initial mount: show all markers or single location
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!centerOnId) {
        fitAllMarkers();
      }
    }

    // A location was selected → smooth pan
    if (centerOnId && centerOnId !== prevCenterRef.current) {
      const target = locations.find((l) => l.id === centerOnId);
      if (target) {
        // Smooth zoom-out → pan → zoom-in for a "span" feel
        const currentZoom = map.getZoom() || zoom;
        const targetZoom = Math.max(zoom, 16);

        // If we're already zoomed in on something, do a cinematic transition
        if (currentZoom >= 14 && prevCenterRef.current) {
          // Step 1: Zoom out slightly
          map.setZoom(Math.min(currentZoom, 13));

          // Step 2: After a brief pause, pan and zoom in
          setTimeout(() => {
            map.panTo({ lat: target.lat, lng: target.lng });
            setTimeout(() => {
              map.setZoom(targetZoom);
            }, 300);
          }, 250);
        } else {
          // First selection or already zoomed out: simple smooth pan
          map.panTo({ lat: target.lat, lng: target.lng });
          map.setZoom(targetZoom);
        }
      }
    }

    // Selection was cleared → zoom out to show all
    if (!centerOnId && prevCenterRef.current) {
      fitAllMarkers();
    }

    prevCenterRef.current = centerOnId;
  }, [map, centerOnId, locations, zoom, fitAllMarkers]);

  return null;
}

// ─── Main Component ───
export default function EmbeddedMap({
  locations,
  centerOnId,
  onMarkerClick,
  height = "100%",
  zoom = 14,
}: EmbeddedMapProps) {
  const theme = useComputedColorScheme();
  const [cameraProps, setCameraProps] = useState({
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: zoom,
  });

  const apiKey = import.meta.env.VITE_JS_MAP_API;

  // Fallback if API key is missing
  if (!apiKey) {
    return (
      <Box
        h={height}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, var(--mantine-color-gray-1) 0%, var(--mantine-color-gray-2) 100%)",
          border: "1px dashed var(--mantine-color-gray-4)",
        }}
      >
        <Text size="sm" c="dimmed" fw={500}>
          Map unavailable
        </Text>
      </Box>
    );
  }

  // No locations to display
  if (locations.length === 0) {
    return (
      <Box
        h={height}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, var(--mantine-color-gray-1) 0%, var(--mantine-color-gray-2) 100%)",
          border: "1px dashed var(--mantine-color-gray-4)",
        }}
      >
        <Text size="sm" c="dimmed" fw={500}>
          No locations to display
        </Text>
      </Box>
    );
  }

  return (
    <Paper
      radius="md"
      shadow="sm"
      withBorder
      style={{
        overflow: "hidden",
        height,
        minHeight: 280,
      }}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          {...cameraProps}
          onCameraChanged={(ev) => setCameraProps(ev.detail)}
          mapId={import.meta.env.VITE_JS_MAP_ID}
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
          colorScheme={theme === "dark" ? "DARK" : "LIGHT"}
          style={{ width: "100%", height: "100%" }}
        >
          <MapController
            locations={locations}
            centerOnId={centerOnId}
            zoom={zoom}
          />

          {locations.map((loc) => (
            <AdvancedMarker
              key={loc.id}
              position={{ lat: loc.lat, lng: loc.lng }}
              onClick={() => onMarkerClick?.(loc.id)}
            >
              <CustomMarker
                label={loc.label}
                isSelected={loc.id === centerOnId}
                onClick={() => onMarkerClick?.(loc.id)}
              />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </Paper>
  );
}
