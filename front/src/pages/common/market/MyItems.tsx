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
import type { Item } from "../../../api/interfaces/item";

const MOCK_ITEMS: Item[] = [
  {
    id: 1,
    title: "Vintage Wooden Table",
    description:
      "A beautifully aged oak table, perfect for a rustic dining room.",
    price: 45,
    weight: 12,
    state: "Very Good",
    id_user: 1,
    username: "JohnDoe",
    category: "listing",
    material: "wood",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400",
    ],
    created_at: new Date().toISOString(),
    score: 15,
  },
  {
    id: 2,
    title: "Industrial Metal Shelf",
    description: "Sturdy metal shelving unit, great for workshops or garages.",
    price: 0,
    weight: 8,
    state: "Good",
    id_user: 1,
    username: "JohnDoe",
    category: "deposit",
    material: "metal",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=400",
    ],
    created_at: new Date().toISOString(),
    score: 10,
  },
  {
    id: 3,
    title: "Upcycled Cotton Tote Bag",
    description: "Hand-sewn tote bag made from recycled cotton fabrics.",
    price: 12,
    weight: 0.5,
    state: "New",
    id_user: 1,
    username: "JohnDoe",
    category: "listing",
    material: "textile",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400",
    ],
    created_at: new Date().toISOString(),
    score: 5,
  },
  {
    id: 4,
    title: "Glass Jar Set",
    description: "Set of 5 decorative glass jars for storage or crafts.",
    price: 5,
    weight: 2,
    state: "Very Good",
    id_user: 1,
    username: "JohnDoe",
    category: "listing",
    material: "glass",
    status: "approved",
    images: [
      "https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=400",
    ],
    created_at: new Date().toISOString(),
    score: 8,
  },
];

export default function MyItems() {
  const navigate = useNavigate();
  const { t } = useTranslation(["marketplace", "common", "home"]);
  const { user } = useAuth();
  const role: string = user?.role || "";

  const [material, setMaterial] = useState("all");
  const [search, setSearch] = useState("");
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

  // Simple filtering for mockup
  const filteredItems = MOCK_ITEMS.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesMaterial = material === "all" || item.material === material;
    return matchesSearch && matchesMaterial;
  });

  const paginatedItems = filteredItems.slice((page - 1) * LIMIT, page * LIMIT);

  if (role !== "pro" && role !== "user") {
    return <NotFoundPage />;
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
        </Group>

        {/* Filters */}
        <Group justify="space-between" wrap="wrap" gap="md" mt="md">
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

        {/* List of Items */}
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
          spacing="lg"
          mt="md"
        >
          {paginatedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </SimpleGrid>

        {/* Pagination */}
        <PaginationFooter
          activePage={page}
          setPage={setPage}
          total_records={filteredItems.length}
          last_page={Math.ceil(filteredItems.length / LIMIT)}
          limit={LIMIT}
          unit="items"
        />
      </Stack>
    </Container>
  );
}
