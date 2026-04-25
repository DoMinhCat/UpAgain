import {
  Paper,
  Grid,
  Title,
  Table,
  Button,
  Group,
  Text,
  Stack,
  TextInput,
  Select,
  Pill,
  Modal,
  Container,
  SimpleGrid,
} from "@mantine/core";
import {
  IconBox,
  IconPackage,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";
import { BarChart } from "@mantine/charts";
import { useTranslation } from "react-i18next";

import { AdminCardInfo } from "../../../components/dashboard/AdminCardInfo";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/common/PaginationFooter";

import {
  useGetAllContainers,
  useCreateContainer,
  useDeleteContainer,
} from "../../../hooks/containerHooks";
import { PATHS } from "../../../routes/paths";
import type { Container as ContainerInterface } from "../../../api/interfaces/container";

export default function AdminContainersModule() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const [selectedContainer, setSelectedContainer] =
    useState<ContainerInterface | null>(null);
  const [filters, setFilters] = useState<{
    searchValue: string;
    statusValue: string | null;
  }>({
    searchValue: "",
    statusValue: null,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [activePage, setPage] = useState(1);
  const LIMIT = 10;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      searchValue: "",
      statusValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const hasFilters = Boolean(
    appliedFilters.searchValue || appliedFilters.statusValue,
  );

  const { data: allData } = useGetAllContainers();
  const allContainers = allData?.containers || [];

  const { data: paginatedData, isLoading } = useGetAllContainers(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    appliedFilters.searchValue || undefined,
    appliedFilters.statusValue || undefined,
  );

  const filteredData = paginatedData?.containers || [];

  const createMutation = useCreateContainer();
  const deleteMutation = useDeleteContainer();
  const handleDeleteContainer = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        closeDelete();
      },
    });
  };

  const stats = useMemo(
    () => ({
      total: allContainers.length,
      ready: allContainers.filter(
        (c: ContainerInterface) => c.status === "ready",
      ).length,
      occupied: allContainers.filter(
        (c: ContainerInterface) => c.status === "occupied",
      ).length,
      maintenance: allContainers.filter(
        (c: ContainerInterface) => c.status === "maintenance",
      ).length,
      waiting: allContainers.filter(
        (c: ContainerInterface) => c.status === "waiting",
      ).length,
    }),
    [allContainers],
  );

  const chartData = useMemo(
    () => [
      { label: t("status.ready", { defaultValue: "Ready" }), value: stats.ready, color: "#45a575" },
      {
        label: t("status.occupied", { defaultValue: "Occupied" }),
        value: stats.occupied,
        color: "var(--mantine-color-yellow-6)",
      },
      {
        label: t("status.maintenance", { defaultValue: "Maintenance" }),
        value: stats.maintenance,
        color: "var(--mantine-color-red-6)",
      },
    ],
    [stats],
  );

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate(
      {
        city_name: formData.get("city") as string,
        postal_code: formData.get("zip") as string,
        street: formData.get("street") as string,
      },
      {
        onSuccess: () => closeCreate(),
      },
    );
  };

  const handleOpenDelete = (c: ContainerInterface) => {
    setSelectedContainer(c);
    openDelete();
  };
  const handleCloseDelete = () => {
    setSelectedContainer(null);
    closeDelete();
  };

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        {t("containers.title")}
      </Title>

      <Grid mb="xl" align="stretch">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" h="100%">
            <AdminCardInfo
              icon={IconBox}
              title={t("containers.stats.inventory")}
              value={stats.total}
              description={
                stats.total !== 1
                  ? t("containers.stats.inventory_desc")
                  : t("containers.stats.inventory_desc_single")
              }
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            />
            <AdminCardInfo
              icon={IconPackage}
              title={t("containers.stats.operational")}
              value={`${stats.ready + stats.occupied} / ${stats.total}`}
              description={
                stats.ready + stats.occupied !== 1
                  ? t("containers.stats.operational_desc")
                  : t("containers.stats.operational_desc_single")
              }
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper px="md" radius="lg" shadow="sm" h="100%" py="sm">
            <Title order={4} mb="lg">
              {t("containers.stats.distribution")}
            </Title>
            <BarChart
              h={300}
              data={chartData}
              dataKey="label"
              series={[{ name: "value", color: "green.6" }]}
              gridAxis="xy"
              barProps={{ radius: [8, 8, 0, 0] }}
              getBarColor={(value) => {
                const item = chartData.find((d) => d.value === value);
                return item ? item.color : "blue";
              }}
              tooltipProps={{
                cursor: { fill: "rgba(255, 255, 255, 0.05)" },
                content: ({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Paper withBorder p="xs" radius="md" shadow="md">
                        <Text
                          size="xs"
                          fw={700}
                          tt="uppercase"
                          style={{ color: data.color }}
                        >
                          {data.label}
                        </Text>
                        <Text fw={700} size="sm">
                          {data.value} {t("containers.stats.label_containers")}
                        </Text>
                      </Paper>
                    );
                  }
                  return null;
                },
              }}
            />
          </Paper>
        </Grid.Col>
      </Grid>

      <Stack gap="md">
        <Group justify="flex-end">
          <Button
            leftSection={<IconPlus size={16} />}
            variant="primary"
            onClick={openCreate}
          >
            {t("admin:actions.create")}
          </Button>
        </Group>
        <Group align="flex-end">
          <TextInput
            label={t("history.filters.search")}
            placeholder={t("containers.table.search_placeholder")}
            rightSection={<IconSearch size={16} />}
            value={filters.searchValue}
            onChange={(e) => handleFilterChange("searchValue", e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearchClick();
              }
            }}
            style={{ flex: 1 }}
          />
          <Select
            label={t("history.filters.status")}
            placeholder={t("users.status.all")}
            data={[
              { label: t("status.ready"), value: "ready" },
              { label: t("status.occupied"), value: "occupied" },
              { label: t("status.maintenance"), value: "maintenance" },
            ]}
            value={filters.statusValue}
            onChange={(val) => handleFilterChange("statusValue", val)}
            clearable
          />
          <Group gap="xs">
            <Button onClick={handleSearchClick} variant="primary">
              {t("history.filters.apply")}
            </Button>
            <Button onClick={handleResetFilters} variant="secondary">
              {t("history.filters.reset")}
            </Button>
          </Group>
        </Group>

        <AdminTable
          loading={isLoading}
          header={[
            t("validations.table.submitted_on"),
            t("users.table.id"),
            t("containers.table.location"),
            t("containers.table.zip"),
            t("users.table.status"),
            t("users.table.actions"),
          ]}
          footer={
            <PaginationFooter
              activePage={activePage}
              setPage={setPage}
              total_records={paginatedData?.total_records || 0}
              last_page={paginatedData?.last_page || 1}
              limit={LIMIT}
              loading={isLoading}
              hidden={hasFilters}
            />
          }
        >
          {filteredData.map((c) => (
            <Table.Tr
              key={c.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`${PATHS.ADMIN.CONTAINERS}/${c.id}`)}
            >
              <Table.Td ta="center">
                {dayjs(c.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">
                <strong>{c.id}</strong>
              </Table.Td>
              <Table.Td ta="center">{c.city_name}</Table.Td>
              <Table.Td ta="center">{c.postal_code}</Table.Td>
              <Table.Td ta="center">
                <Pill
                  bg={
                    c.status === "ready"
                      ? "var(--upagain-neutral-green)"
                      : c.status === "occupied" || c.status === "waiting"
                        ? "var(--mantine-color-yellow-6)"
                        : "var(--mantine-color-red-6)"
                  }
                  c="white"
                >
                  {t(`status.${c.status}` as any, { defaultValue: c.status.toUpperCase() })}
                </Pill>
              </Table.Td>
              <Table.Td ta="center">
                <Group gap="xs" justify="center">
                  <Button
                    variant="edit"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${PATHS.ADMIN.CONTAINERS}/${c.id}`);
                    }}
                  >
                    {t("common:actions.update")}
                  </Button>
                  <Button
                    variant="delete"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDelete(c);
                    }}
                  >
                    {t("common:actions.delete")}
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </AdminTable>
      </Stack>

      {/* modals */}

      {/* create */}
      <Modal
        opened={openedCreate}
        onClose={closeCreate}
        title={t("containers.create_modal.title")}
        centered
      >
        <form onSubmit={handleCreateSubmit}>
          <Stack>
            <TextInput
              label={t("containers.create_modal.street")}
              name="street"
              required
              placeholder="e.g. 21 Erard street"
            />
            <SimpleGrid cols={2}>
              <TextInput
                label={t("containers.create_modal.city")}
                name="city"
                required
                placeholder="e.g. Lyon"
              />
              <TextInput
                label={t("containers.create_modal.zip")}
                name="zip"
                required
                placeholder="e.g. 69000"
              />
            </SimpleGrid>
            <Group justify="flex-end" mt="md">
              <Button variant="grey" onClick={closeCreate}>
                {t("common:actions.cancel")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={createMutation.isPending}
              >
                {t("containers.create_modal.submit")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* delete */}
      <Modal
        opened={openedDelete}
        onClose={handleCloseDelete}
        title={t("containers.delete_modal.title")}
        centered
      >
        <Text size="sm" mb="lg">
          {t("containers.delete_modal.text", {
            id: selectedContainer?.id,
            city: selectedContainer?.city_name,
          })}
        </Text>
        <Group justify="flex-end">
          <Button variant="grey" onClick={handleCloseDelete}>
            {t("common:actions.cancel")}
          </Button>
          <Button
            variant="delete"
            loading={deleteMutation.isPending}
            onClick={() =>
              selectedContainer && handleDeleteContainer(selectedContainer.id)
            }
          >
            {t("containers.delete_modal.confirm")}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
