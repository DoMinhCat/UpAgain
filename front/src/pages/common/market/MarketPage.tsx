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
} from "@mantine/core";
import { useAuth } from "../../../context/AuthContext";
import { NotFoundPage } from "../../error/404";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IconBox, IconPlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";

export default function MartketPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const role: string = user?.role || "";

  const [material, setMaterial] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 8;

  const MATERIALS = [
    { value: "", label: t("community:filters.all") },
    { value: "wood", label: t("community:filters.wood") },
    { value: "metal", label: t("community:filters.metal") },
    { value: "textile", label: t("community:filters.textile") },
    { value: "glass", label: t("community:filters.glass") },
    { value: "plastic", label: t("community:filters.plastic") },
    { value: "mixed", label: t("community:filters.mixed") },
    { value: "other", label: t("community:filters.other") },
  ];
  const SORT_OPTIONS = [
    { value: "newest", label: t("community:filters.newest") },
    { value: "oldest", label: t("community:filters.oldest") },
    { value: "lowest_price", label: t("community:filters.lowest_price") },
  ];

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
              {(role == "pro" || role == "user") && (
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
            placeholder={t("community:search_placeholder")}
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
              w={160}
              size="sm"
              allowDeselect={false}
            />
          </Group>
        </Group>
      </Stack>
    </Container>
  );
}
