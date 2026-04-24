import { Center, Loader } from "@mantine/core";
export default function FullScreenLoader() {
  return (
    <Center
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        zIndex: 9999,
      }}
    >
      <Loader size="xl" />
    </Center>
  );
}
