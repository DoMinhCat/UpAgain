import { useEffect, useRef } from "react";
import {
  Container,
  Stack,
  Title,
  Group,
  Button,
  Paper,
  Text,
  ScrollArea,
  Loader,
  Center,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconRefresh, IconTerminal } from "@tabler/icons-react";
import { PATHS } from "../../../routes/paths";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { useGetBackendLogs } from "../../../hooks/logHooks";
import GlobalStyles from "../../../styles/GlobalStyles.module.css";

export default function AdminLogsModule() {
  const { t } = useTranslation(["admin", "common"]);
  const {
    data: logs,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetBackendLogs();

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logs) {
      const timer = setTimeout(() => {
        if (viewportRef.current) {
          viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [logs]);

  return (
    <Container px="md" size="xl">
      <Group justify="space-between" align="center" mt="xs" mb="sm">
        <Stack gap={2}>
          <Title order={2}>{t("logs.title")}</Title>
          <MyBreadcrumbs
            breadcrumbs={[
              {
                title: t("admin:dashboard.title", {
                  defaultValue: "Overview Dashboard",
                }),
                href: PATHS.ADMIN.HOME,
              },
              { title: t("logs.title"), href: "#" },
            ]}
          />
        </Stack>
        <Button
          classNames={{ root: GlobalStyles.button }}
          variant="secondary"
          leftSection={<IconRefresh size={16} />}
          loading={isLoading || isFetching}
          onClick={() => refetch()}
        >
          {t("logs.refresh")}
        </Button>
      </Group>

      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          backgroundColor: "var(--mantine-color-dark-8, #1a1b1e)",
          borderColor: "var(--mantine-color-dark-4, #373a40)",
          color: "#e0e0e0",
          fontFamily: "var(--mantine-font-family-monospace, monospace)",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
      >
        <Group
          gap="xs"
          mb="xs"
          style={{
            borderBottom: "1px solid var(--mantine-color-dark-4, #373a40)",
            paddingBottom: "8px",
          }}
        >
          <IconTerminal
            size={16}
            color="var(--upagain-neutral-green, #40c057)"
          />
          <Text size="xs" fw={700} c="dimmed" style={{ letterSpacing: "1px" }}>
            CONSOLE OUTPUT
          </Text>
        </Group>

        {isLoading ? (
          <Center py="xl" style={{ height: "400px" }}>
            <Stack align="center" gap="sm">
              <Loader color="var(--upagain-neutral-green, green)" size="md" />
              <Text size="sm" c="dimmed">
                Loading system logs...
              </Text>
            </Stack>
          </Center>
        ) : error ? (
          <Center py="xl" style={{ height: "400px" }}>
            <Text c="red">{t("logs.notifications.error_message")}</Text>
          </Center>
        ) : !logs || logs.trim() === "" ? (
          <Center py="xl" style={{ height: "400px" }}>
            <Text c="dimmed">{t("logs.no_logs")}</Text>
          </Center>
        ) : (
          <ScrollArea
            viewportRef={viewportRef}
            style={{ height: "calc(100vh - 280px)" }}
            scrollbarSize={8}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {logs}
            </pre>
          </ScrollArea>
        )}
      </Paper>
    </Container>
  );
}
