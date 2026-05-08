import {
  Container,
  Paper,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Title,
  Text,
  Group,
  Button,
  Grid,
  SimpleGrid,
  Badge,
  Divider,
  Box,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import {
  IconPackage,
  IconMapPin,
  IconTruckDelivery,
  IconCurrentLocation,
  IconChevronRight,
  IconMap,
  IconCheck,
  IconBox,
  IconLeaf,
} from "@tabler/icons-react";
import ImageDropzone from "../../../components/input/ImageDropzone";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import { showSuccessNotification } from "../../../components/common/NotificationToast";

// Emission factors based on backend/utils/helpers/scoreHelper.go
const EMISSION_FACTORS: Record<
  string,
  { co2: number; water: number; energy: number }
> = {
  wood: { co2: 0.6, water: 20, energy: 2 },
  metal: { co2: 2.5, water: 120, energy: 18 },
  textile: { co2: 4, water: 2500, energy: 6 },
  glass: { co2: 0.3, water: 15, energy: 4 },
  plastic: { co2: 1.2, water: 60, energy: 10 },
  mixed: { co2: 0.5, water: 40, energy: 5 },
  other: { co2: 0.1, water: 40, energy: 3 },
};

export default function NewItem() {
  const { t } = useTranslation([
    "create_item",
    "common",
    "home",
    "marketplace",
  ]);
  const [retrievalMethod, setRetrievalMethod] = useState<"deposit" | "listing">(
    "deposit",
  );
  const [images, setImages] = useState<any[]>([]);

  // FORM STATES
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>(0);
  const [weight, setWeight] = useState<number | string>(1);
  const [material, setMaterial] = useState<string | null>("other");
  const [state, setState] = useState<string | null>("good");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [containerId, setContainerId] = useState<number | null>(null);

  // ERROR STATES
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const [errorWeight, setErrorWeight] = useState("");
  const [errorMaterial, setErrorMaterial] = useState("");
  const [errorState, setErrorState] = useState("");
  const [errorStreet, setErrorStreet] = useState("");
  const [errorCity, setErrorCity] = useState("");
  const [errorPostalCode, setErrorPostalCode] = useState("");
  const [errorContainer, setErrorContainer] = useState("");

  // VALIDATION FUNCTIONS
  const validateTitle = (val: string) => {
    if (val.length < 3) {
      setErrorTitle(t("validation.required"));
      return false;
    }
    setErrorTitle("");
    return true;
  };

  const validateDescription = (val: string) => {
    if (val.length < 10) {
      setErrorDescription(t("validation.required"));
      return false;
    }
    setErrorDescription("");
    return true;
  };

  const validateWeight = (val: number | string) => {
    if (Number(val) < 0.1) {
      setErrorWeight(t("validation.min_weight"));
      return false;
    }
    setErrorWeight("");
    return true;
  };

  const validateMaterial = (val: string | null) => {
    if (!val) {
      setErrorMaterial(t("validation.required"));
      return false;
    }
    setErrorMaterial("");
    return true;
  };

  const validateState = (val: string | null) => {
    if (!val) {
      setErrorState(t("validation.required"));
      return false;
    }
    setErrorState("");
    return true;
  };

  const validateAddress = () => {
    let valid = true;
    if (retrievalMethod === "listing") {
      if (!street) {
        setErrorStreet(t("validation.required"));
        valid = false;
      } else {
        setErrorStreet("");
      }
      if (!city) {
        setErrorCity(t("validation.required"));
        valid = false;
      } else {
        setErrorCity("");
      }
      if (!postalCode) {
        setErrorPostalCode(t("validation.required"));
        valid = false;
      } else {
        setErrorPostalCode("");
      }
    } else if (retrievalMethod === "deposit") {
      if (!containerId) {
        setErrorContainer(t("validation.select_container"));
        valid = false;
      } else {
        setErrorContainer("");
      }
    }
    return valid;
  };

  // Calculate estimated score in real-time
  const estimatedScore = useMemo(() => {
    const factors =
      EMISSION_FACTORS[material || "other"] || EMISSION_FACTORS.other;
    const w = Number(weight) || 0;
    const co2 = w * factors.co2;
    const water = w * factors.water;
    const electricity = w * factors.energy;
    return Math.round(co2 * 10 + water * 0.002 + electricity * 2);
  }, [material, weight]);

  // Mock containers for UI demo
  const MOCK_CONTAINERS = [
    {
      id: 1,
      city: "Paris",
      postal_code: "75012",
      street: "21 Rue Erard",
      status: "ready",
    },
    {
      id: 2,
      city: "Paris",
      postal_code: "75011",
      street: "10 Boulevard Voltaire",
      status: "ready",
    },
    {
      id: 3,
      city: "Paris",
      postal_code: "75020",
      street: "55 Rue de Bagnolet",
      status: "ready",
    },
  ];

  const MATERIALS = [
    { value: "wood", label: t("common:materials.wood") },
    { value: "metal", label: t("common:materials.metal") },
    { value: "textile", label: t("common:materials.textile") },
    { value: "glass", label: t("common:materials.glass") },
    { value: "plastic", label: t("common:materials.plastic") },
    { value: "mixed", label: t("common:materials.mixed") },
    { value: "other", label: t("common:materials.other") },
  ];

  const STATES = [
    { value: "new", label: t("common:states.new") },
    { value: "very_good", label: t("common:states.very_good") },
    { value: "good", label: t("common:states.good") },
    { value: "need_repair", label: t("common:states.need_repair") },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v1 = validateTitle(title);
    const v2 = validateDescription(description);
    const v3 = validateWeight(weight);
    const v4 = validateMaterial(material);
    const v5 = validateState(state);
    const v6 = validateAddress();

    if (v1 && v2 && v3 && v4 && v5 && v6) {
      console.log("Submitting:", {
        title,
        description,
        price,
        weight,
        material,
        state,
        retrievalMethod,
        street,
        city,
        postalCode,
        containerId,
        images,
      });
      showSuccessNotification(t("success"), "");
    }
  };

  return (
    <Container size="xl" py={50}>
      <form onSubmit={handleSubmit}>
        <Stack gap="xl">
          {/* Header */}
          <Stack gap="xs">
            <MyBreadcrumbs
              breadcrumbs={[
                { title: t("home:title"), href: PATHS.HOME },
                {
                  title: t("marketplace:market", {
                    defaultValue: "Marketplace",
                  }),
                  href: PATHS.MARKETPLACE.HOME,
                },
                { title: t("title"), href: "#" },
              ]}
            />
            <Title order={1} size={42} fw={900}>
              {t("title")}
            </Title>
            <Text c="dimmed" size="lg">
              {t("subtitle")}
            </Text>
          </Stack>

          <Grid gap={"xl"}>
            {/* Left Column: Form Inputs */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap={"xl"}>
                {/* Section 1: Basic Info */}
                <Paper
                  p="xl"
                  radius="lg"
                  withBorder
                  shadow="sm"
                  variant="primary"
                >
                  <Stack gap="md">
                    <Group gap="sm">
                      <Box
                        bg="var(--upagain-neutral-green)"
                        p="xs"
                        style={{
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconPackage size={20} color="white" />
                      </Box>
                      <Title order={3}>{t("sections.basic_info")}</Title>
                    </Group>
                    <ImageDropzone files={images} setFiles={setImages} />
                    <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
                      <TextInput
                        label={t("fields.title")}
                        placeholder={t("fields.title_placeholder")}
                        required
                        size="md"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => validateTitle(title)}
                        error={errorTitle}
                      />
                      <Select
                        label={t("fields.material")}
                        data={MATERIALS}
                        required
                        size="md"
                        value={material}
                        onChange={(val) => {
                          setMaterial(val);
                          validateMaterial(val);
                        }}
                        error={errorMaterial}
                      />
                    </SimpleGrid>
                    <Textarea
                      label={t("fields.description")}
                      placeholder={t("fields.description_placeholder")}
                      required
                      minRows={4}
                      size="md"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={() => validateDescription(description)}
                      error={errorDescription}
                    />
                  </Stack>
                </Paper>

                {/* Section 2: Attributes */}
                <Paper
                  p="xl"
                  radius="lg"
                  withBorder
                  shadow="sm"
                  variant="primary"
                >
                  <Stack gap="md">
                    <Group gap="sm">
                      <Box
                        bg="var(--upagain-neutral-green)"
                        p="xs"
                        style={{
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconChevronRight size={20} color="white" />
                      </Box>
                      <Title order={3}>{t("sections.attributes")}</Title>
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      <Stack gap={0}>
                        <NumberInput
                          label={t("fields.price")}
                          prefix="€ "
                          min={0}
                          size="md"
                          value={price}
                          onChange={setPrice}
                          w="100%"
                        />
                        <Text size="xs" c="dimmed" mt={4}>
                          {t("fields.price_free")}
                        </Text>
                      </Stack>
                      <Stack gap={0}>
                        <NumberInput
                          label={t("fields.weight")}
                          suffix=" kg"
                          min={0.1}
                          required
                          size="md"
                          value={weight}
                          onChange={setWeight}
                          onBlur={() => validateWeight(weight)}
                          error={errorWeight}
                          w="100%"
                        />
                        {/* Hidden text to match height of price description */}
                        <Text size="xs" opacity={0} mt={4}>
                          spacer
                        </Text>
                      </Stack>
                      <Select
                        label={t("fields.state")}
                        data={STATES}
                        required
                        size="md"
                        value={state}
                        onChange={(val) => {
                          setState(val);
                          validateState(val);
                        }}
                        error={errorState}
                      />
                    </SimpleGrid>
                  </Stack>
                </Paper>

                {/* Section 3: Retrieval Method Choice */}
                <Paper
                  p="xl"
                  radius="lg"
                  withBorder
                  shadow="sm"
                  variant="primary"
                >
                  <Stack gap="xl">
                    <Group gap="sm">
                      <Box
                        bg="var(--upagain-neutral-green)"
                        p="xs"
                        style={{
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconTruckDelivery size={20} color="white" />
                      </Box>
                      <Title order={3}>{t("sections.retrieval")}</Title>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                      {/* Deposit Option */}
                      <UnstyledButton
                        onClick={() => {
                          setRetrievalMethod("deposit");
                          setContainerId(null);
                        }}
                        style={{
                          border: `2px solid ${retrievalMethod === "deposit" ? "var(--upagain-neutral-green)" : "var(--mantine-color-gray-3)"}`,
                          borderRadius: "var(--mantine-radius-lg)",
                          padding: "var(--mantine-spacing-lg)",
                          transition: "all 0.2s ease",
                          backgroundColor:
                            retrievalMethod === "deposit"
                              ? "var(--mantine-color-green-0)"
                              : "transparent",
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <IconBox
                              size={32}
                              color={
                                retrievalMethod === "deposit"
                                  ? "var(--upagain-neutral-green)"
                                  : "var(--mantine-color-gray-5)"
                              }
                            />
                            {retrievalMethod === "deposit" && (
                              <IconCheck color="var(--upagain-neutral-green)" />
                            )}
                          </Group>
                          <Title
                            order={4}
                            c={
                              retrievalMethod === "deposit"
                                ? "var(--upagain-neutral-green)"
                                : undefined
                            }
                          >
                            {t("methods.deposit.title")}
                          </Title>
                          <Text size="sm" c="dimmed">
                            {t("methods.deposit.description")}
                          </Text>
                        </Stack>
                      </UnstyledButton>

                      {/* Listing Option */}
                      <UnstyledButton
                        onClick={() => {
                          setRetrievalMethod("listing");
                          setStreet("");
                          setCity("");
                          setPostalCode("");
                        }}
                        style={{
                          border: `2px solid ${retrievalMethod === "listing" ? "var(--upagain-neutral-green)" : "var(--mantine-color-gray-3)"}`,
                          borderRadius: "var(--mantine-radius-lg)",
                          padding: "var(--mantine-spacing-lg)",
                          transition: "all 0.2s ease",
                          backgroundColor:
                            retrievalMethod === "listing"
                              ? "var(--mantine-color-green-0)"
                              : "transparent",
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <IconMapPin
                              size={32}
                              color={
                                retrievalMethod === "listing"
                                  ? "var(--upagain-neutral-green)"
                                  : "var(--mantine-color-gray-5)"
                              }
                            />
                            {retrievalMethod === "listing" && (
                              <IconCheck color="var(--upagain-neutral-green)" />
                            )}
                          </Group>
                          <Title
                            order={4}
                            c={
                              retrievalMethod === "listing"
                                ? "var(--upagain-neutral-green)"
                                : undefined
                            }
                          >
                            {t("methods.listing.title")}
                          </Title>
                          <Text size="sm" c="dimmed">
                            {t("methods.listing.description")}
                          </Text>
                        </Stack>
                      </UnstyledButton>
                    </SimpleGrid>

                    <Divider />

                    {/* Method Specific Details */}
                    {retrievalMethod === "deposit" ? (
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={4}>
                            {t("methods.deposit.select_container")}
                          </Title>
                          <Button
                            variant="secondary"
                            leftSection={<IconCurrentLocation size={16} />}
                            color="var(--upagain-neutral-green)"
                            // onClick={() => getClosestContainer()}
                          >
                            {t("methods.deposit.closest")}
                          </Button>
                        </Group>

                        {errorContainer && (
                          <Text c="red" size="sm">
                            {errorContainer}
                          </Text>
                        )}

                        <Grid gap="md">
                          <Grid.Col span={{ base: 12, md: 5 }}>
                            <Stack gap="sm">
                              {MOCK_CONTAINERS.map((container) => (
                                <Paper
                                  key={container.id}
                                  withBorder
                                  p="md"
                                  radius="md"
                                  onClick={() => {
                                    setContainerId(container.id);
                                    setErrorContainer("");
                                  }}
                                  style={{
                                    cursor: "pointer",
                                    borderColor:
                                      containerId === container.id
                                        ? "var(--upagain-neutral-green)"
                                        : undefined,
                                    backgroundColor:
                                      containerId === container.id
                                        ? "var(--mantine-color-green-0)"
                                        : undefined,
                                    transition: "transform 0.1s ease",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform =
                                      "scale(1.02)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform =
                                      "scale(1)")
                                  }
                                >
                                  <Group justify="space-between" wrap="nowrap">
                                    <Stack gap={2}>
                                      <Text fw={700} size="sm">
                                        Container #{container.id}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {container.street},{" "}
                                        {container.postal_code} {container.city}
                                      </Text>
                                    </Stack>
                                    <Button
                                      variant="subtle"
                                      size="compact-xs"
                                      leftSection={<IconMap size={14} />}
                                    >
                                      {t("methods.deposit.view_map")}
                                    </Button>
                                  </Group>
                                </Paper>
                              ))}
                            </Stack>
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 7 }}>
                            <Box
                              h="100%"
                              mih={300}
                              bg="var(--mantine-color-gray-1)"
                              style={{
                                borderRadius: "var(--mantine-radius-md)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border:
                                  "2px dashed var(--mantine-color-gray-3)",
                              }}
                            >
                              <Stack align="center" gap="xs">
                                <IconMap
                                  size={48}
                                  color="var(--mantine-color-gray-4)"
                                  stroke={1}
                                />
                                <Text c="dimmed" size="sm">
                                  {t("methods.deposit.map_placeholder")}
                                </Text>
                              </Stack>
                            </Box>
                          </Grid.Col>
                        </Grid>
                      </Stack>
                    ) : (
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={4}>
                            {t("methods.listing.address_info")}
                          </Title>
                          <Button
                            variant="secondary"
                            leftSection={<IconCurrentLocation size={16} />}
                            color="var(--upagain-neutral-green)"
                            // onClick={}
                          >
                            {t("methods.listing.current_location")}
                          </Button>
                        </Group>
                        <TextInput
                          label={t("methods.listing.street")}
                          placeholder="123 Rue de la Paix"
                          size="md"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          error={errorStreet}
                        />
                        <SimpleGrid cols={{ base: 1, sm: 2 }}>
                          <TextInput
                            label={t("methods.listing.city")}
                            placeholder="Paris"
                            size="md"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            error={errorCity}
                          />
                          <TextInput
                            label={t("methods.listing.postal_code")}
                            placeholder="75001"
                            size="md"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            error={errorPostalCode}
                          />
                        </SimpleGrid>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>

            {/* Right Column: Summary & Actions (Sticky) */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Box style={{ position: "sticky", top: rem(80) }}>
                <Paper
                  p="xl"
                  radius="lg"
                  withBorder
                  variant="primary"
                  shadow="md"
                >
                  <Stack gap="xl">
                    <Title order={3}>
                      {t("common:actions.summary", { defaultValue: "Summary" })}
                    </Title>

                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t("fields.material")}
                        </Text>
                        <Badge
                          variant="light"
                          color="var(--upagain-neutral-green)"
                        >
                          {material
                            ? t(`common:materials.${material}`).toUpperCase()
                            : "---"}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t("fields.state")}
                        </Text>
                        <Badge
                          variant="light"
                          color="var(--upagain-neutral-green)"
                        >
                          {state
                            ? t(`common:states.${state}`).toUpperCase()
                            : "---"}
                        </Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {t("sections.retrieval")}
                        </Text>
                        <Text size="sm" fw={700}>
                          {retrievalMethod === "deposit"
                            ? t("methods.deposit.title")
                            : t("methods.listing.title")}
                        </Text>
                      </Group>
                    </Stack>

                    <Divider />

                    {/* Upcycling Score Summary */}
                    <Paper p="md" radius="md" withBorder>
                      <Stack gap="xs" align="center">
                        <Group gap={6}>
                          <IconLeaf
                            size={18}
                            color="var(--upagain-neutral-green)"
                          />
                          <Text
                            fw={700}
                            size="sm"
                            c="var(--upagain-neutral-green)"
                          >
                            {t("fields.upcycling_score")}
                          </Text>
                        </Group>
                        <Title order={2} c="var(--upagain-neutral-green)">
                          {estimatedScore}
                        </Title>
                        <Text size="xs" c="dimmed" ta="center">
                          {t("upcycling_score_note")}
                        </Text>
                      </Stack>
                    </Paper>

                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      radius="md"
                      color="var(--upagain-neutral-green)"
                      leftSection={<IconCheck size={20} />}
                      style={{
                        transition: "transform 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-2px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      {t("submit")}
                    </Button>

                    <Text size="xs" c="dimmed" ta="center">
                      By publishing this item, you agree to our Terms of Service
                      regarding upcycled materials.
                    </Text>
                  </Stack>
                </Paper>
              </Box>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </Container>
  );
}
