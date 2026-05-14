import {
  Container,
  Group,
  SegmentedControl,
  Stack,
  Button,
  Title,
  Text,
  TextInput,
  SimpleGrid,
  Box,
  Select,
  Loader,
  Center,
} from "@mantine/core";
import { useAuth } from "../../../context/AuthContext";
import { NotFoundPage } from "../../error/404";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import ItemCard from "../../../components/market/ItemCard";
import PaginationFooter from "../../../components/common/PaginationFooter";
import { useGetMyItems } from "../../../hooks/itemHooks";
import { useDebouncedValue } from "@mantine/hooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";

export default function MyItems() {
  const navigate = useNavigate();
  const { t } = useTranslation(["marketplace", "common", "home"]);
  const { user } = useAuth();
  const role: string = user?.role || "";

  const [material, setMaterial] = useState("all");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("most_recent_creation");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [page, setPage] = useState(1);
  const LIMIT = 8;

  const MATERIALS = [
    { value: "all", label: t("common:materials.all") },
    { value: "wood", label: t("common:materials.wood") },
    { value: "metal", label: t("common:materials.metal") },
    { value: "textile", label: t("common:materials.textile") },
    { value: "glass", label: t("common:materials.glass") },
    { value: "plastic", label: t("common:materials.plastic") },
  ];

  const STATUS_OPTIONS =
    role === "pro"
      ? [
          { value: "all", label: t("common:status.all") },
          { value: "reserved", label: t("common:status.reserved") },
          { value: "bought", label: t("common:status.bought") },
          { value: "to_retrieve", label: t("common:status.to_retrieve") },
        ]
      : [
          { value: "all", label: t("common:status.all") },
          { value: "pending", label: t("common:status.pending") },
          { value: "approved", label: t("common:status.approved") },
          { value: "refused", label: t("common:status.refused") },
          { value: "reserved", label: t("common:status.reserved") },
          { value: "sold", label: t("common:status.sold") },
          { value: "to_drop_off", label: t("common:status.to_drop_off") },
        ];

  const CATEGORY_OPTIONS = [
    { value: "all", label: t("common:categories.all") },
    { value: "listing", label: t("common:categories.listing") },
    { value: "deposit", label: t("common:categories.deposit") },
  ];

  const SORT_OPTIONS = [
    {
      value: "most_recent_creation",
      label: t("marketplace:sort.most_recent_creation"),
    },
    { value: "oldest_creation", label: t("marketplace:sort.oldest_creation") },
    { value: "highest_price", label: t("marketplace:sort.highest_price") },
    { value: "lowest_price", label: t("marketplace:sort.lowest_price") },
  ];

  const { data, isLoading } = useGetMyItems(
    page,
    LIMIT,
    debouncedSearch || undefined,
    sort,
    status === "all" ? undefined : status,
    material === "all" ? undefined : material,
    category === "all" ? undefined : category,
  );

  const items = data?.items ?? [];
  const totalRecords = data?.total_records ?? 0;
  const lastPage = data?.last_page ?? 1;

  if (role !== "pro" && role !== "user") {
    return <NotFoundPage />;
  }

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Container px="md" py={50} size="xl">
      <Stack gap="xl">
        {/* Navigation */}
        <MyBreadcrumbs
          breadcrumbs={[
            { title: t("home:title"), href: PATHS.HOME },
            { title: t("marketplace:market"), href: PATHS.MARKETPLACE.HOME },
            { title: t("marketplace:my_listings"), href: PATHS.MARKETPLACE.ME },
          ]}
        />

        {/* Title and Description */}
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <Box>
            <Title order={1} size={36} mb={4}>
              {t("marketplace:my_listings")}
            </Title>
            <Text c="dimmed" size="md">
              {t("marketplace:my_objects_description")}
            </Text>
          </Box>
          {role === "user" && (
            <Button
              leftSection={<IconPlus size={20} />}
              variant="primary"
              onClick={() =>
                navigate(PATHS.MARKETPLACE.NEW, { state: { from: "myItems" } })
              }
              size="md"
            >
              {t("marketplace:new_item")}
            </Button>
          )}
        </Group>

        {/* Filters */}
        <Stack gap="md" mt="md">
          <Group justify="space-between" wrap="wrap" gap="md">
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
              w={{ base: "100%", sm: 300 }}
              radius="md"
            />
            <SegmentedControl
              value={material}
              onChange={(v) => {
                setMaterial(v);
                setPage(1);
              }}
              data={MATERIALS}
              radius="xl"
              size="sm"
            />
          </Group>

          <Group gap="sm" wrap="wrap">
            <Select
              placeholder={t("common:sort_by")}
              data={SORT_OPTIONS}
              value={sort}
              onChange={(v) => {
                setSort(v || "most_recent_creation");
                setPage(1);
              }}
              w={{ base: "100%", xs: 200 }}
              radius="md"
            />
            <Select
              placeholder={t("common:type")}
              data={CATEGORY_OPTIONS}
              value={category}
              onChange={(v) => {
                setCategory(v || "all");
                setPage(1);
              }}
              w={{ base: "100%", xs: 180 }}
              radius="md"
            />
            <Select
              placeholder={t("common:status.all")}
              data={STATUS_OPTIONS}
              value={status}
              onChange={(v) => {
                setStatus(v || "all");
                setPage(1);
              }}
              w={{ base: "100%", xs: 180 }}
              radius="md"
            />
          </Group>
        </Stack>

        {/* List of Items */}
        {isLoading ? (
          <Center h={300}>
            <Loader color="var(--upagain-neutral-green)" size="xl" />
          </Center>
        ) : items.length > 0 ? (
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing="lg"
            mt="md"
          >
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </SimpleGrid>
        ) : (
          <Center h={300}>
            <Stack align="center" gap="xs">
              <Text size="lg" fw={500}>
                {t("marketplace:empty.title")}
              </Text>
              <Text c="dimmed">{t("marketplace:empty.subtitle")}</Text>
            </Stack>
          </Center>
        )}

        {/* Pagination */}
        <PaginationFooter
          activePage={page}
          setPage={setPage}
          total_records={totalRecords}
          last_page={lastPage}
          limit={LIMIT}
          unit="items"
        />
      </Stack>
    </Container>
  );
}
