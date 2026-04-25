import {
  Container,
  Title,
  Button,
  Modal,
  Group,
  Stack,
  TextInput,
  Table,
  Grid,
  Select,
  Paper,
  Text,
  Badge,
  Tooltip,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";
import ImageDropzone from "../../../components/input/ImageDropzone";
import {
  IconCalendarEventFilled,
  IconCalendarTime,
  IconPlus,
  IconSearch,
  IconArrowUpRight,
  IconCrownFilled,
} from "@tabler/icons-react";
import {
  AdminCardInfo,
  StatsCardDesc,
} from "../../../components/dashboard/AdminCardInfo";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { TextEditor } from "../../../components/input/TextEditor";
import {
  useCreatePost,
  useDeletePost,
  useGetAllPosts,
  useGetPostsStats,
} from "../../../hooks/postHooks";
import { useState, useMemo } from "react";
import { showSuccessNotification } from "../../../components/common/NotificationToast";
import AdminTable from "../../../components/admin/AdminTable";
import PaginationFooter from "../../../components/common/PaginationFooter";
import dayjs from "dayjs";
import { PATHS } from "../../../routes/paths";
import type { Post } from "../../../api/interfaces/post";
import { useTranslation } from "react-i18next";

export const AdminPostsModule = () => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  // STATS CARD
  const {
    data: postStats,
    isLoading: isLoadingPostStats,
    isError: isErrorPostStats,
  } = useGetPostsStats();

  const chartData = useMemo(() => {
    if (!postStats?.category_counts) return [];
    return [
      {
        label: t("posts.categories.tutorial"),
        value: postStats.category_counts["tutorial"] || 0,
        color: "var(--mantine-color-blue-6)",
      },
      {
        label: t("posts.categories.project"),
        value: postStats.category_counts["project"] || 0,
        color: "var(--mantine-color-green-6)",
      },
      {
        label: t("posts.categories.tips"),
        value: postStats.category_counts["tips"] || 0,
        color: "var(--mantine-color-yellow-6)",
      },
      {
        label: t("posts.categories.news"),
        value: postStats.category_counts["news"] || 0,
        color: "var(--mantine-color-red-6)",
      },
      {
        label: t("posts.categories.case_study"),
        value: postStats.category_counts["case_study"] || 0,
        color: "var(--mantine-color-violet-6)",
      },
      {
        label: t("posts.categories.other"),
        value: postStats.category_counts["other"] || 0,
        color: "var(--mantine-color-gray-6)",
      },
    ];
  }, [postStats, t]);

  // CREATE MODAL
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [files, setFiles] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState<string>("");

  const validateTitle = () => {
    if (!title) {
      setErrorTitle(t("posts.create_modal.errors.title"));
      return false;
    } else {
      setErrorTitle("");
      return true;
    }
  };
  const validateCategory = () => {
    if (!category) {
      setErrorCategory(t("posts.create_modal.errors.category"));
      return false;
    } else if (category === "project") {
      setErrorCategory(t("posts.create_modal.errors.category_project"));
      return false;
    } else {
      setErrorCategory("");
      return true;
    }
  };
  const validateDescription = () => {
    const stripped = description.replace(/<[^>]*>/g, "").trim();
    if (!description || stripped === "") {
      setErrorDescription(t("posts.create_modal.errors.description"));
      return false;
    } else {
      setErrorDescription("");
      return true;
    }
  };

  const handleCloseCreate = () => {
    setErrorTitle("");
    setErrorCategory("");
    setErrorDescription("");
    setFiles([]);
    setTitle("");
    setCategory("");
    setDescription("");
    closeCreate();
  };

  const createPostMutation = useCreatePost();
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    validateTitle();
    validateCategory();
    validateDescription();
    if (errorTitle || errorCategory || errorDescription) {
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", description);
    files.forEach((file) => {
      formData.append("images", file);
    });
    createPostMutation.mutate(formData, {
      onSuccess: () => {
        showSuccessNotification(
          t("posts.notifications.created_title"),
          t("posts.notifications.created_msg"),
        );
        handleCloseCreate();
      },
    });
  };

  // GET ALL POSTS
  const [filters, setFilters] = useState<{
    searchValue: string | undefined;
    sortValue: string | null;
    categoryValue: string | null;
  }>({ searchValue: "", sortValue: null, categoryValue: null });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [activePage, setPage] = useState(1);
  const LIMIT = 10;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const hasFilters = Boolean(
    appliedFilters.searchValue ||
    appliedFilters.categoryValue ||
    appliedFilters.sortValue,
  );

  const {
    data: posts,
    error: allPostsError,
    isLoading: isAllPostsLoading,
  } = useGetAllPosts(
    hasFilters ? -1 : activePage,
    hasFilters ? -1 : LIMIT,
    appliedFilters.searchValue,
    appliedFilters.categoryValue || undefined,
    appliedFilters.sortValue || undefined,
  );

  const handleSearchClick = () => {
    setAppliedFilters(filters);
    setPage(1);
  };
  const handleResetFilters = () => {
    const defaultFilters = {
      searchValue: "",
      sortValue: null,
      categoryValue: null,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };
  const filteredPosts = posts?.posts || [];

  // DELETE POST
  const [openedDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure();
  const deletePostMutation = useDeletePost();
  const [selectedDeletePost, setSelectedDeletePost] = useState<Post | null>(
    null,
  );

  const handleModalDelete = (post: Post) => {
    setSelectedDeletePost(post);
    openDelete();
  };

  const handleDeletePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeletePost?.id) {
      deletePostMutation.mutate(selectedDeletePost.id, {
        onSuccess: () => {
          closeDelete();
          showSuccessNotification(
            t("posts.notifications.deleted_title"),
            t("posts.notifications.deleted_msg"),
          );
        },
      });
    }
  };
  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        {t("posts.title")}
      </Title>

      {/* stats cards */}
      <Grid mb="xl" align="stretch">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" h="100%">
            <AdminCardInfo
              icon={IconCalendarEventFilled}
              title={t("posts.stats.total_active")}
              value={postStats?.total_posts ?? 0}
              error={isErrorPostStats}
              loading={isLoadingPostStats}
              description={
                <StatsCardDesc
                  stats={postStats?.total_new_posts_since ?? 0}
                  icon={
                    <IconArrowUpRight
                      size={24}
                      color="var(--upagain-neutral-green)"
                    />
                  }
                  description={t("posts.stats.posts_since")}
                />
              }
            />
            <AdminCardInfo
              icon={IconCalendarTime}
              title={t("posts.stats.engagement_rate")}
              value={(postStats?.engagement_rate ?? 0) + "%"}
              error={isErrorPostStats}
              loading={isLoadingPostStats}
              description={
                <StatsCardDesc
                  stats={postStats?.interaction_per_post ?? 0}
                  icon={
                    <IconArrowUpRight
                      size={24}
                      color="var(--upagain-neutral-green)"
                    />
                  }
                  description={t("posts.stats.interactions_per_post")}
                />
              }
            />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper px="md" radius="lg" shadow="sm" h="100%">
            <Title order={4} mb="lg" pt="md">
              {t("posts.stats.distribution")}
            </Title>
            <BarChart
              h={300}
              data={chartData}
              dataKey="label"
              series={[{ name: "value", color: "blue.6" }]}
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
                          {data.value} {t("posts.stats.posts_count")}
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

      <Stack gap="md" my="xl">
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            {t("posts.manage_subtitle")}
          </Title>

          <Group gap="xs" align="flex-end">
            <Button
              variant="primary"
              leftSection={<IconPlus size={16} />}
              onClick={openCreate}
            >
              {t("posts.new_post")}
            </Button>

            {/* create modal */}
            <Modal
              opened={openedCreate}
              onClose={handleCloseCreate}
              title={t("posts.create_modal.title")}
              size="xl"
            >
              <Stack mb="md">
                <TextInput
                  data-autofocus
                  withAsterisk
                  placeholder={t("posts.create_modal.title_placeholder")}
                  label={t("posts.create_modal.title_label")}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  onBlur={() => validateTitle()}
                  error={errorTitle}
                  disabled={createPostMutation.isPending}
                  required
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}></Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}></Grid.Col>
                </Grid>
                <Select
                  withAsterisk
                  clearable
                  label={t("posts.create_modal.category_label")}
                  value={category}
                  disabled={createPostMutation.isPending}
                  placeholder={t("posts.create_modal.category_placeholder")}
                  error={errorCategory}
                  onBlur={() => validateCategory()}
                  data={[
                    {
                      value: "tutorial",
                      label: t("posts.categories.tutorial"),
                    },
                    { value: "tips", label: t("posts.categories.tips") },
                    { value: "news", label: t("posts.categories.news") },
                    {
                      value: "case_study",
                      label: t("posts.categories.case_study"),
                    },
                    {
                      value: "project",
                      label: t("posts.categories.project"),
                      disabled: true,
                    },
                    { value: "other", label: t("posts.categories.other") },
                  ]}
                  onChange={(value) => {
                    setCategory(value as string);
                  }}
                />
                <TextEditor
                  label={t("posts.create_modal.content_label")}
                  value={description}
                  placeholder={t("posts.create_modal.content_placeholder")}
                  error={errorDescription}
                  onChange={(value) => {
                    setDescription(value);
                  }}
                />
              </Stack>
              <ImageDropzone
                loading={createPostMutation.isPending}
                files={files}
                setFiles={setFiles}
              />
              <Group mt="lg" justify="center">
                <Button variant="grey" onClick={handleCloseCreate}>
                  {t("posts.create_modal.cancel", { defaultValue: "Cancel" })}
                </Button>
                <Button
                  onClick={(e) => {
                    handleCreatePost(e);
                  }}
                  loading={createPostMutation.isPending}
                  variant="primary"
                >
                  {t("common:actions.confirm")}
                </Button>
              </Group>
            </Modal>
          </Group>
        </Group>
        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label={t("common:search")}
              placeholder={t("posts.filters.search_placeholder")}
              rightSection={<IconSearch size={14} />}
              disabled={isAllPostsLoading}
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearchClick();
                }
              }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Select
              label={t("common:sort_by")}
              placeholder={t("common:sort_by")}
              data={[
                {
                  value: "most_recent_creation",
                  label: t("posts.filters.sort_options.most_recent_creation"),
                },
                {
                  value: "oldest_creation",
                  label: t("posts.filters.sort_options.oldest_creation"),
                },
                {
                  value: "highest_like",
                  label: t("posts.filters.sort_options.highest_like"),
                },
                {
                  value: "lowest_like",
                  label: t("posts.filters.sort_options.lowest_like"),
                },
                {
                  value: "highest_view",
                  label: t("posts.filters.sort_options.highest_view"),
                },
                {
                  value: "lowest_view",
                  label: t("posts.filters.sort_options.lowest_view"),
                },
              ]}
              value={filters.sortValue}
              clearable
              disabled={isAllPostsLoading}
              onChange={(val) => handleFilterChange("sortValue", val)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label={t("posts.table.category")}
              placeholder={t("posts.categories.all")}
              data={[
                { value: "tutorial", label: t("posts.categories.tutorial") },
                { value: "project", label: t("posts.categories.project") },
                { value: "tips", label: t("posts.categories.tips") },
                { value: "news", label: t("posts.categories.news") },
                {
                  value: "case_study",
                  label: t("posts.categories.case_study"),
                },
                { value: "other", label: t("posts.categories.other") },
                { value: "sponsored", label: t("posts.categories.sponsored") },
              ]}
              value={filters.categoryValue}
              disabled={isAllPostsLoading}
              onChange={(val) => handleFilterChange("categoryValue", val)}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4, md: 3 }}>
            <Group gap="xs" grow>
              <Button variant="primary" onClick={handleSearchClick}>
                {t("common:actions.apply_filters")}
              </Button>
              <Button variant="secondary" onClick={handleResetFilters}>
                {t("common:actions.reset")}
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* TODO: ads status col */}
      <AdminTable
        loading={isAllPostsLoading}
        error={allPostsError}
        header={[
          t("posts.table.created_on"),
          t("posts.table.id"),
          t("posts.table.title"),
          t("posts.table.creator"),
          t("posts.table.category"),
          t("posts.table.views"),
          t("posts.table.likes"),
          t("posts.table.actions"),
        ]}
        footer={
          <PaginationFooter
            activePage={activePage}
            setPage={setPage}
            total_records={posts?.total_records || 0}
            last_page={posts?.last_page || 1}
            limit={LIMIT}
            loading={isAllPostsLoading}
            hidden={hasFilters}
          />
        }
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Table.Tr
              key={post.id}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(PATHS.ADMIN.POSTS + "/" + post.id, {
                  state: { from: "allPosts" },
                })
              }
            >
              <Table.Td ta="center">
                {dayjs(post.created_at).format("DD/MM/YYYY")}
              </Table.Td>
              <Table.Td ta="center">{post.id}</Table.Td>
              <Table.Td ta="center">
                <Group>
                  <Text>{post.title}</Text>
                  {post.ads_id && (
                    <Tooltip
                      label={t("posts.details.sponsored")}
                      position="top"
                    >
                      <IconCrownFilled
                        size={16}
                        color="var(--upagain-yellow)"
                      />
                    </Tooltip>
                  )}
                </Group>
              </Table.Td>
              <Table.Td ta="center">{post.creator}</Table.Td>
              <Table.Td ta="center">
                <Badge
                  variant={
                    post.category === "other"
                      ? "gray"
                      : post.category === "tutorial"
                        ? "blue"
                        : post.category === "project"
                          ? "green"
                          : post.category === "tips"
                            ? "yellow"
                            : post.category === "case_study"
                              ? "violet"
                              : "red"
                  }
                >
                  {t(`posts.categories.${post.category}` as any, {
                    defaultValue:
                      post.category.charAt(0).toUpperCase() +
                      post.category.slice(1),
                  })}
                </Badge>
              </Table.Td>
              <Table.Td ta="center">{post.view_count}</Table.Td>
              <Table.Td ta="center">{post.like_count}</Table.Td>
              <Table.Td ta="center">
                <Group gap="xs" justify="center">
                  <Button
                    size="xs"
                    variant="edit"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigate(PATHS.ADMIN.POSTS + "/" + post.id);
                    }}
                  >
                    {t("common:actions.edit")}
                  </Button>
                  <Button
                    size="xs"
                    variant="delete"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleModalDelete(post);
                    }}
                  >
                    {t("common:actions.delete")}
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={8} ta="center">
              {t("posts.table.no_posts")}
            </Table.Td>
          </Table.Tr>
        )}
      </AdminTable>
      <Modal
        title={t("posts.delete_modal.title")}
        opened={openedDelete}
        onClose={closeDelete}
      >
        {t("posts.delete_modal.text")}
        <Group mt="lg" justify="flex-end">
          <Button onClick={closeDelete} variant="grey">
            {t("posts.delete_modal.cancel")}
          </Button>
          <Button
            onClick={(e) => {
              handleDeletePost(e);
            }}
            variant="delete"
            loading={deletePostMutation.isPending}
          >
            {t("posts.delete_modal.confirm")}
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};
