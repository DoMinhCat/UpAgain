import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Divider,
  Alert,
  PinInput,
  SimpleGrid,
  ThemeIcon,
  Loader,
  Box,
} from "@mantine/core";
import {
  IconLockOpen,
  IconBarcode,
  IconInfoCircle,
  IconCircleCheck,
  IconBinary,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import ImageDropzone from "../../../components/input/ImageDropzone";
import { showErrorNotification } from "../../../components/common/NotificationToast";
import { useOpenContainer } from "../../../hooks/containerHooks";
import { NotFoundPage } from "../../error/404";

export default function OpenContainerPage() {
  const { t } = useTranslation(["marketplace", "home", "common"]);
  const location = useLocation();
  const state = location.state;
  const containerId = state?.id_container || 0;

  const [code, setCode] = useState("");
  const handleSetCode = (value: string) => {
    setCode(value.toUpperCase());
  };
  const [files, setFiles] = useState<any[]>([]);

  const [verifyingType, setVerifyingType] = useState<"code" | "barcode" | null>(
    null,
  );
  const [unlocked, setUnlocked] = useState(false);

  const { mutate: openContainer, isPending } = useOpenContainer();

  // Verification actions
  const handleVerifyCode = () => {
    if (code.length !== 6) {
      showErrorNotification(
        t("marketplace:open_container.validation_error_code", {
          defaultValue: "Please enter a valid 6-digit code.",
        }),
      );
      return;
    }

    setVerifyingType("code");
    openContainer(
      {
        id: containerId,
        payload: { code6digit: code },
      },
      {
        onSuccess: () => {
          setUnlocked(true);
          setVerifyingType(null);
        },
        onError: () => {
          setVerifyingType(null);
        },
      },
    );
  };

  const handleVerifyBarcode = () => {
    if (files.length === 0) {
      showErrorNotification(
        t("marketplace:open_container.validation_error_barcode", {
          defaultValue: "Please upload a barcode image first.",
        }),
      );
      return;
    }

    setVerifyingType("barcode");
    openContainer(
      {
        id: containerId,
        payload: { barcode: files[0] },
      },
      {
        onSuccess: () => {
          setUnlocked(true);
          setVerifyingType(null);
        },
        onError: () => {
          setVerifyingType(null);
        },
      },
    );
  };

  if (!state.item_id) return <NotFoundPage />;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Navigation & Breadcrumbs */}
        <Group justify="space-between" align="center">
          <MyBreadcrumbs
            breadcrumbs={[
              {
                title: t("home:title", { defaultValue: "Home" }),
                href: PATHS.HOME,
              },
              ...(state?.item_title && state?.item_id
                ? [
                    {
                      title: t("marketplace:market"),
                      href: PATHS.MARKETPLACE.HOME,
                    },
                    {
                      title: t("marketplace:my_listings"),
                      href: PATHS.MARKETPLACE.ME,
                    },
                    {
                      title: state?.item_title || "Item details",
                      href: PATHS.MARKETPLACE.ME + "/" + state.item_id,
                    },
                  ]
                : []),
              {
                title: t("marketplace:open_container.title", {
                  defaultValue: "Open Container",
                }),
                href: "#",
              },
            ]}
          />
        </Group>

        {unlocked ? (
          /* Unlocked Success State Screen */
          <Paper
            p={{ base: "xl", sm: 50 }}
            radius="lg"
            withBorder
            shadow="md"
            variant="primary"
            style={{
              background: "var(--mantine-color-body)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              minHeight: "400px",
              borderTop: "6px solid var(--upagain-neutral-green, #2b8a3e)",
            }}
          >
            <ThemeIcon
              size={100}
              radius="xl"
              color="green.1"
              style={{
                color: "var(--upagain-neutral-green, #2b8a3e)",
                marginBottom: "24px",
                animation: "pulse 2s infinite",
              }}
            >
              <IconCircleCheck size={64} stroke={1.5} />
            </ThemeIcon>

            <Title
              order={1}
              mb="md"
              style={{ color: "var(--upagain-neutral-green, #2b8a3e)" }}
            >
              {t("marketplace:open_container.success_title", {
                defaultValue: "Container Unlocked",
              })}
            </Title>

            <Text size="lg" c="dimmed" maw={500} mx="auto" mb={35}>
              {t("marketplace:open_container.success_desc", {
                defaultValue:
                  "Verification successful! The container lock has been released.",
              })}
            </Text>
          </Paper>
        ) : (
          /* Access Code / Barcode Entry Form Screen */
          <>
            <Paper p="xl" radius="lg" withBorder shadow="sm" variant="primary">
              <Stack gap="xs">
                <Title order={2}>
                  {containerId > 0
                    ? t("marketplace:open_container.opening_container", {
                        id: containerId,
                        defaultValue: `Open Container #${containerId}`,
                      })
                    : t("marketplace:open_container.title", {
                        defaultValue: "Open Container",
                      })}
                </Title>
                <Text size="sm" c="dimmed">
                  {t("marketplace:open_container.subtitle", {
                    defaultValue:
                      "Access verification for container deposits and retrievals.",
                  })}
                </Text>
              </Stack>
            </Paper>

            <Alert
              icon={<IconInfoCircle size={20} />}
              color="green"
              radius="md"
              variant="light"
            >
              {t("marketplace:open_container.instructions", {
                defaultValue:
                  "Please enter the 6-digit access code or upload the barcode image provided for this container.",
              })}
            </Alert>

            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {/* Option A: Code Enter */}
              <Paper
                p="xl"
                radius="lg"
                withBorder
                shadow="sm"
                variant="primary"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "450px",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  borderColor:
                    code.length === 6
                      ? "var(--upagain-neutral-green)"
                      : undefined,
                }}
              >
                <Stack gap="xl">
                  <Group gap="md">
                    <ThemeIcon
                      size="lg"
                      radius="md"
                      color="green"
                      variant="light"
                    >
                      <IconBinary size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} size="lg">
                        {t("marketplace:open_container.option_code_title", {
                          defaultValue: "Option A: 6-Digit Access Code",
                        })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t("marketplace:open_container.option_code_desc", {
                          defaultValue:
                            "Type the access code from your reservation.",
                        })}
                      </Text>
                    </div>
                  </Group>

                  <Divider />

                  <Box
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexGrow: 1,
                      padding: "20px 0",
                    }}
                  >
                    <PinInput
                      length={6}
                      type="alphanumeric"
                      size="lg"
                      placeholder=""
                      oneTimeCode
                      disabled={isPending}
                      value={code}
                      onChange={handleSetCode}
                      aria-label="6-Digit Access Code"
                      styles={{
                        input: {
                          width: "50px",
                          height: "58px",
                          fontSize: "24px",
                          fontWeight: 700,
                          borderRadius: "8px",
                          border:
                            "2px solid var(--mantine-color-default-border)",
                          transition: "border-color 0.15s ease",
                          "&:focus": {
                            borderColor: "var(--upagain-neutral-green)",
                          },
                        },
                      }}
                    />
                  </Box>
                </Stack>

                <Button
                  size="md"
                  variant="primary"
                  fullWidth
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6 || isPending}
                  loading={verifyingType === "code"}
                  leftSection={
                    verifyingType === "code" ? (
                      <Loader size="xs" color="white" />
                    ) : (
                      <IconLockOpen size={18} />
                    )
                  }
                >
                  {t("marketplace:open_container.verify_code", {
                    defaultValue: "Verify Access Code",
                  })}
                </Button>
              </Paper>

              {/* Option B: Barcode Upload */}
              <Paper
                p="xl"
                radius="lg"
                withBorder
                shadow="sm"
                variant="primary"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "450px",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  borderColor:
                    files.length > 0
                      ? "var(--mantine-color-blue-5)"
                      : undefined,
                }}
              >
                <Stack gap="xl" style={{ flexGrow: 1 }}>
                  <Group gap="md">
                    <ThemeIcon
                      size="lg"
                      radius="md"
                      color="blue"
                      variant="light"
                    >
                      <IconBarcode size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} size="lg">
                        {t("marketplace:open_container.option_barcode_title", {
                          defaultValue: "Option B: Barcode Upload",
                        })}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t("marketplace:open_container.option_barcode_desc", {
                          defaultValue:
                            "Upload a clear photo of the container's barcode.",
                        })}
                      </Text>
                    </div>
                  </Group>

                  <Divider />

                  <Box style={{ flexGrow: 1 }}>
                    <ImageDropzone
                      files={files}
                      setFiles={setFiles}
                      loading={verifyingType === "barcode"}
                      disabled={isPending || files.length > 0}
                      maxSizeDescription={t(
                        "marketplace:open_container.dropzone_desc",
                        {
                          defaultValue: "Click or drag your barcode image here",
                        },
                      )}
                      extraDescription=""
                    />
                  </Box>
                </Stack>

                <Button
                  size="md"
                  variant="primary"
                  fullWidth
                  mt="xl"
                  onClick={handleVerifyBarcode}
                  disabled={files.length === 0 || isPending}
                  loading={verifyingType === "barcode"}
                  leftSection={
                    verifyingType === "barcode" ? (
                      <Loader size="xs" color="white" />
                    ) : (
                      <IconBarcode size={18} />
                    )
                  }
                >
                  {t("marketplace:open_container.verify_barcode", {
                    defaultValue: "Verify Barcode",
                  })}
                </Button>
              </Paper>
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Container>
  );
}
