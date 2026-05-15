import { Button, Container, Group, Paper, Stack, Title } from "@mantine/core";
import { Map, AdvancedMarker, APIProvider } from "@vis.gl/react-google-maps";
import { useState } from "react";

export default function EmbeddedMap() {
  const locations = [
    { id: 1, name: "Paris", lat: 48.8566, lng: 2.3522 },
    { id: 2, name: "London", lat: 51.5074, lng: -0.1278 },
    { id: 3, name: "Berlin", lat: 52.52, lng: 13.405 },
    { id: 4, name: "Rome", lat: 41.9028, lng: 12.4964 },
  ];

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [cameraProps, setCameraProps] = useState({
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: 4,
  });

  const handleFocus = (loc: (typeof locations)[0]) => {
    setSelectedId(loc.id);
    // This updates the map view
    setCameraProps({
      center: { lat: loc.lat, lng: loc.lng },
      zoom: 15, // Zoom in closer when focusing
    });
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Title order={2}>Our Locations</Title>

        <Group align="flex-start">
          {/* External Controls (Mantine Buttons) */}
          <Paper withBorder p="md" shadow="xs" style={{ flex: 1 }}>
            <Stack>
              {locations.map((loc) => (
                <Button
                  key={loc.id}
                  variant={selectedId === loc.id ? "filled" : "light"}
                  onClick={() => handleFocus(loc)}
                  fullWidth
                >
                  Focus on {loc.name}
                </Button>
              ))}
              <Button
                variant="subtle"
                onClick={() =>
                  setCameraProps({ center: { lat: 48, lng: 2 }, zoom: 4 })
                }
              >
                Reset View
              </Button>
            </Stack>
          </Paper>

          {/* Map Container */}
          <Paper
            withBorder
            radius="md"
            style={{ flex: 2, height: "500px", overflow: "hidden" }}
          >
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <Map
                {...cameraProps}
                onCameraChanged={(ev) => setCameraProps(ev.detail)}
                mapId="YOUR_MAP_ID" // Required for AdvancedMarker
              >
                {locations.map((loc) => (
                  <AdvancedMarker
                    key={loc.id}
                    position={{ lat: loc.lat, lng: loc.lng }}
                    title={loc.name}
                  />
                ))}
              </Map>
            </APIProvider>
          </Paper>
        </Group>
      </Stack>
    </Container>
  );
}
