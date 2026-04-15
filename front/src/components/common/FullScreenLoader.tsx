import { Center, Loader } from "@mantine/core";
export default function FullScreenLoader() {
  return (
    <Center style={{ width: "100vw", height: "100vh" }}>
      <Loader size="xl" />
    </Center>
  );
}
