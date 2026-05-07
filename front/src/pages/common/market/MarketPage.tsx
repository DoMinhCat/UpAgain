import {
  Container,
  Group,
  SegmentedControl,
  Stack,
  Button,
  Title,
  Text,
  TextInput,
  Select,
  SimpleGrid,
  Center,
  Loader,
} from "@mantine/core";
import { useAuth } from "../../../context/AuthContext";
import { NotFoundPage } from "../../error/404";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IconBox, IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useGetAllItems } from "../../../hooks/itemHooks";
import { useDebouncedValue } from "@mantine/hooks";
import ItemCard from "../../../components/market/ItemCard";
import PaginationFooter from "../../../components/common/PaginationFooter";

export default function MarketPage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["marketplace", "common", "community", "home"]);
  const { user } = useAuth();
  const role: string = user?.role || "";

  const [material, setMaterial] = useState("");
  const [sort, setSort] = useState("most_recent_creation");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const MATERIALS = [
    { value: "", label: t("common:materials.all") },
    { value: "wood", label: t("common:materials.wood") },
    { value: "metal", label: t("common:materials.metal") },
    { value: "textile", label: t("common:materials.textile") },
    { value: "glass", label: t("common:materials.glass") },
    { value: "plastic", label: t("common:materials.plastic") },
    { value: "mixed", label: t("common:materials.mixed") },
    { value: "other", label: t("common:materials.other") },
  ];

  const SORT_OPTIONS = [
    {
      value: "most_recent_creation",
      label: t("marketplace:sort.most_recent"),
    },
    {
      value: "oldest_creation",
      label: t("marketplace:sort.oldest"),
    },
    { value: "lowest_price", label: t("marketplace:sort.lowest_price") },
    { value: "highest_price", label: t("marketplace:sort.highest_price") },
  ];

  const { data, isLoading } = useGetAllItems(
    page,
    LIMIT,
    debouncedSearch || undefined,
    sort,
    "approved",
    material || undefined,
  );

  const items = data?.items ?? [];
  const totalRecords = data?.total_records ?? 0;
  const lastPage = data?.last_page ?? 1;
  const limit = data?.limit ?? LIMIT;

  if (role !== "pro" && role !== "user") {
    return <NotFoundPage />;
  }

  return (
    <Container px="md" py={50} size="xl">
      <Stack gap="xl" mb="xl">
        {/* Header */}
        <Stack gap={4}>
          <MyBreadcrumbs
            mb="md"
            breadcrumbs={[
              { title: t("home:title"), href: PATHS.HOME },
              { title: t("marketplace:market"), href: PATHS.MARKETPLACE.HOME },
            ]}
          />
          <Title order={1} size={36}>
            {t("marketplace:market")}
          </Title>
          <Group justify="space-between" wrap="wrap" gap="md">
            <Text c="dimmed" size="md">
              {t("marketplace:subtitle")}
            </Text>

            <Group justify="flex-end" wrap="wrap">
              {(role === "pro" || role === "user") && (
                <Button
                  leftSection={<IconBox stroke={2} />}
                  variant="primary"
                  onClick={() => {
                    navigate(PATHS.MARKETPLACE.ME);
                  }}
                >
                  {t("marketplace:my_listings")}
                </Button>
              )}
              {role === "user" && (
                <Button
                  leftSection={<IconPlus stroke={2} />}
                  variant="primary"
                  onClick={() => {
                    // open modal to post an object
                  }}
                >
                  {t("marketplace:create_listing")}
                </Button>
              )}
            </Group>
          </Group>
        </Stack>

        {/* Filters */}
        <Group justify="space-between" wrap="wrap" gap="md" my="lg">
          <TextInput
            placeholder={t("marketplace:search_placeholder")}
            leftSection={
              <IconSearch size={16} color="var(--upagain-neutral-green)" />
            }
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={{ base: "100%", sm: 280 }}
          />
          <Group gap="md">
            <SegmentedControl
              value={material}
              onChange={(v) => {
                setMaterial(v);
                setPage(1);
              }}
              data={MATERIALS}
              size="sm"
            />
            <Select
              data={SORT_OPTIONS}
              value={sort}
              onChange={(v) => {
                setSort(v ?? "most_recent_creation");
                setPage(1);
              }}
              w={180}
              size="sm"
              allowDeselect={false}
            />
          </Group>
        </Group>

        {/* Grid */}
        {isLoading ? (
          <Center py={80}>
            <Loader color="var(--upagain-neutral-green)" />
          </Center>
        ) : items.length === 0 ? (
          <Center py={80}>
            <Stack align="center" gap="xs">
              <IconBox
                size={48}
                color="var(--upagain-neutral-green)"
                stroke={1.5}
              />
              <Text c="dimmed" ta="center" maw={300}>
                {t("marketplace:empty.title")} {t("marketplace:empty.subtitle")}
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </SimpleGrid>
        )}

        <PaginationFooter
          activePage={page}
          setPage={setPage}
          total_records={totalRecords}
          last_page={lastPage}
          limit={limit}
          unit="items"
          loading={isLoading}
        />
      </Stack>
    </Container>
  );
}
