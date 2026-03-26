import {
  Container,
  SimpleGrid,
  Title,
  Button,
  Modal,
  Group,
  Stack,
  TextInput,
  NumberInput,
  Grid,
  Select,
} from "@mantine/core";
import ImageDropzone from "../../../components/ImageDropzone";
import {
  IconCalendarEventFilled,
  IconArrowUp,
  IconCalendarTime,
  IconClockCheck,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import {
  AdminCardInfo,
  StatsCardDesc,
} from "../../../components/admin/AdminCardInfo";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { TextEditor } from "../../../components/TextEditor";
import { useGetPostsStats } from "../../../hooks/postHooks";
import { useState } from "react";

export const AdminPostsModule = () => {
  const navigate = useNavigate();

  // STATS CARD
  const {
    data: postStats,
    isLoading: isLoadingPostStats,
    isError: isErrorPostStats,
  } = useGetPostsStats();

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
      setErrorTitle("Title is required");
    } else {
      setErrorTitle("");
    }
  };
  const validateCategory = () => {
    if (!category) {
      setErrorCategory("Category is required");
    } else if (category === "project") {
      setErrorCategory("Only professionals can create a project");
    } else {
      setErrorCategory("");
    }
  };
  const validateDescription = () => {
    if (!description || description.trim() === "") {
      setErrorDescription("Post's content is required");
    } else {
      setErrorDescription("");
    }
  };

  const handleCloseCreate = () => {
    setErrorTitle("");
    setErrorCategory("");
    setErrorDescription("");
    closeCreate();
  };

  return (
    <Container px="md" size="xl">
      <Title order={2} mt="lg" mb="xl">
        Post Management
      </Title>

      {/* stats cards */}
      <SimpleGrid cols={{ base: 1, sm: 3, lg: 3 }} spacing="lg">
        <AdminCardInfo
          icon={IconCalendarEventFilled}
          title="Total active posts"
          value={postStats?.total_posts ?? 0}
          error={isErrorPostStats}
          loading={isLoadingPostStats}
          description={
            <StatsCardDesc
              stats={postStats?.total_new_posts_since ?? 0}
              icon={IconArrowUp}
              description={" posts since last month"}
            />
          }
        />
        <AdminCardInfo
          icon={IconCalendarTime}
          title="Engagement rate"
          value={postStats?.engagement_rate ?? 0 + "%"}
          error={isErrorPostStats}
          loading={isLoadingPostStats}
          description={
            <StatsCardDesc
              stats={postStats?.total_new_posts_since ?? 0}
              icon={IconArrowUp}
              description={" interactions per post"}
            />
          }
        />
        <AdminCardInfo
          icon={IconClockCheck}
          title="Pending approval"
          value={postStats?.pending ?? 0}
          error={isErrorPostStats}
          loading={isLoadingPostStats}
          description={
            <StatsCardDesc
              stats={postStats?.pending ?? 0}
              description={" posts require validation"}
            />
          }
        />
      </SimpleGrid>

      <Stack gap="md" my="xl">
        <Group justify="space-between" align="flex-end">
          <Title c="dimmed" order={3}>
            Manage events and assign employees
          </Title>

          <Group gap="xs" align="flex-end">
            <Button
              variant="primary"
              leftSection={<IconPlus size={16} />}
              onClick={openCreate}
            >
              New Post
            </Button>

            {/* create modal */}
            <Modal
              opened={openedCreate}
              onClose={handleCloseCreate}
              title="Create Post"
              size="xl"
            >
              <Stack mb="md">
                <TextInput
                  data-autofocus
                  withAsterisk
                  placeholder="Give the post a catchy title"
                  label="Title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  onBlur={() => validateTitle()}
                  error={errorTitle}
                  // disabled={createEventMutation.isPending}
                  required
                />
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}></Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}></Grid.Col>
                </Grid>
                <Select
                  withAsterisk
                  clearable
                  label="Category"
                  value={category}
                  // disabled={createEventMutation.isPending}
                  placeholder="Select a category"
                  error={errorCategory}
                  onBlur={() => validateCategory()}
                  data={[
                    { value: "tutorial", label: "Tutorial" },
                    { value: "tips", label: "Tips" },
                    { value: "news", label: "News" },
                    { value: "case_study", label: "Case Study" },
                    { value: "project", label: "Project", disabled: true },
                    { value: "other", label: "Other" },
                  ]}
                  onChange={(value) => {
                    setCategory(value as string);
                  }}
                />
                <TextEditor
                  label="Content"
                  value={description}
                  placeholder="Write your post content here..."
                  error={errorDescription}
                  onChange={(value) => {
                    setDescription(value);
                  }}
                />
              </Stack>
              <ImageDropzone
                // loading={createEventMutation.isPending}
                files={files}
                setFiles={setFiles}
              />
              <Group mt="lg" justify="center">
                <Button variant="grey">Cancel</Button>
                <Button
                  // onClick={(e) => {
                  //   handleSubmitCreate(e);
                  // }}
                  // loading={createEventMutation.isPending}
                  variant="primary"
                >
                  Confirm
                </Button>
              </Group>
            </Modal>
          </Group>
        </Group>
        {/* filter options */}
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              variant="filled"
              placeholder="Search by employee's name, event's ID or title..."
              rightSection={<IconSearch size={14} />}
              // disabled={createEventMutation.isPending}
              // value={filters.searchValue}
              // onChange={(e) =>
              //   handleFilterChange("searchValue", e.target.value)
              // }
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Select
              label="Sort by"
              placeholder="Pick one sort method"
              data={[
                {
                  value: "most_recent_creation",
                  label: "Most recent creation",
                },
                { value: "oldest_creation", label: "Oldest creation" },
                {
                  value: "highest_price",
                  label: "Highest price",
                },
                {
                  value: "lowest_price",
                  label: "Lowest price",
                },
                {
                  value: "earliest_start_date",
                  label: "Earliest start date",
                },
                {
                  value: "latest_start_date",
                  label: "Latest start date",
                },
              ]}
              // value={filters.sortValue}
              clearable
              // disabled={createEventMutation.isPending}
              // onChange={(val) => handleFilterChange("sortValue", val)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 2 }}>
            <Select
              label="Status"
              placeholder="All status"
              data={[
                { value: "active", label: "Active" },
                { value: "banned", label: "Banned" },
              ]}
              clearable
            />
          </Grid.Col>

          <Grid.Col span={{ base: 6, sm: 4, md: 3 }}>
            <Group gap="xs" grow>
              <Button variant="primary">Apply filters</Button>
              <Button variant="secondary">Reset</Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};
