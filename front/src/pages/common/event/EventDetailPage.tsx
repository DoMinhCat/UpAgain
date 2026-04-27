import {
  Container,
  Grid,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Avatar,
  Paper,
  Box,
  Button,
  Progress,
  Divider,
  SimpleGrid,
  useComputedColorScheme,
  Center,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useEffect, useState } from "react";
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconUsers,
  IconChevronRight,
  IconShieldCheck,
  IconClockCheck,
  IconEdit,
  IconCheck,
  IconX,
  IconCalendarOff,
} from "@tabler/icons-react";
import MyBreadcrumbs from "../../../components/nav/MyBreadcrumbs";
import { PATHS } from "../../../routes/paths";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { EventCard } from "../../../components/event/EventCard";
import { PhotosCarousel } from "../../../components/photo/PhotosCarousel";
import { useAuth } from "../../../context/AuthContext";
import { EditEventModal } from "../../../components/event/EditEventModal";
import { EventAttendeesModal } from "../../../components/event/EventAttendeesModal";
import { CancelEventModal } from "../../../components/event/CancelEventModal";
import { EventRegistrationModal } from "../../../components/event/EventRegistrationModal";
import { CancelRegistrationModal } from "../../../components/event/CancelRegistrationModal";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { NotFoundPage } from "../../error/404";
import {
  useGetAllEvents,
  useGetEventDetails,
  useRegisterToEvent,
  useCancelRegistration,
  useUpdateEventStatus,
} from "../../../hooks/eventHooks";
import FullScreenLoader from "../../../components/common/FullScreenLoader";
import { resolveUrl } from "../../../utils/imageUtils";
import dayjs from "dayjs";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../components/common/NotificationToast";
import {
  useHandleStripeEventRegistration,
  useVerifyStripeSession,
} from "../../../hooks/stripeHooks";
import { verifyStripeSession } from "../../../api/stripeModule";

export default function EventDetailPage() {
  const { t } = useTranslation(["events", "admin"]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const isUser = role === "user";
  const isPro = role === "pro";
  const isEmployee = role === "employee";
  const isAdmin = role === "admin";
  const theme = useComputedColorScheme("light");
  const location = useLocation();

  const { id } = useParams<{ id: string }>();
  const idEvent = parseInt(id || "0");
  const isValidId = !isNaN(idEvent) && idEvent > 0;

  const [searchParams] = useSearchParams();

  // REGISTER TO EVENT
  const registerToEvent = useRegisterToEvent();
  const handleRegisterToEvent = () => {
    if (event?.price != 0) {
      registerToEvent.mutate(
        {
          id_event: idEvent,
          origin_url: window.location.origin + window.location.pathname,
        },
        {
          onSuccess: (data) => {
            closeRegister();
            if (data.checkout_url) {
              window.location.href = data.checkout_url;
            }
          },
        },
      );
    } else {
      registerToEvent.mutate(
        { id_event: idEvent },
        {
          onSuccess: () => {
            showSuccessNotification(
              "Event registered successfully",
              "Event has been registered",
            );
            closeRegister();
          },
        },
      );
    }
  };

  // VERIFY PAYMENT SESSION
  const { isVerifying } = useHandleStripeEventRegistration(idEvent);

  // GET EVENT
  const { data: event, isLoading: isLoadingEvent } = useGetEventDetails(
    idEvent,
    isValidId,
  );

  // GET RANDOM SUGGESTED EVENTS
  const SUGGESTED_EVENT_LIMIT = 4;
  const { data: suggestedEventsData, isLoading: isLoadingSuggestedEvents } =
    useGetAllEvents(
      -1,
      SUGGESTED_EVENT_LIMIT,
      undefined,
      "approved",
      "random",
      event?.category,
      undefined,
      undefined,
    );
  const suggestedEventsAll = suggestedEventsData?.events || [];
  const suggestedEvents = suggestedEventsAll.filter(
    (event) => event.id !== idEvent,
  );

  // CANCEL REGISTRATION MODAL
  const [
    openedCancelRegistration,
    { open: openCancelRegistration, close: closeCancelRegistration },
  ] = useDisclosure(false);

  // CANCEL REGISTRATION TO EVENT
  const cancelRegistrationMutation = useCancelRegistration();
  const handleCancelRegistration = () => {
    cancelRegistrationMutation.mutate(
      { id_event: idEvent },
      {
        onSuccess: () => {
          closeCancelRegistration();
        },
      },
    );
  };

  // PHOTO CAROUSEL MODAL
  const [lightboxOpened, setLightboxOpened] = useState(false);
  const [lightboxSlide, setLightboxSlide] = useState(0);

  // Edit EVENT MODAL
  const [openedEdit, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  // EVENT ATTENDEES MODAL
  const [openedAttendees, { open: openAttendees, close: closeAttendees }] =
    useDisclosure(false);

  // CANCEL EVENT M
  const [openedCancel, { open: openCancel, close: closeCancel }] =
    useDisclosure(false);
  // REGISTER EVENT MODAL
  const [openedRegister, { open: openRegister, close: closeRegister }] =
    useDisclosure(false);
  const cancelEvent = useUpdateEventStatus(idEvent, "cancelled");
  const handleCancel = () => {
    cancelEvent.mutate(undefined, {
      onSuccess: () => {
        closeCancel();
      },
    });
  };

  const isRegistered = event?.attendees?.some((a) => a.id === user?.id);
  const isPast = dayjs(event?.end_at).isBefore(dayjs());

  if (isLoadingEvent || isLoadingSuggestedEvents) {
    return <FullScreenLoader />;
  }
  if (!isValidId || !event || event.status !== "approved") {
    return <NotFoundPage />;
  }
  return (
    <>
      <Stack gap={0} mb={120}>
        {/* 1. HERO SECTION */}
        <Box pos="relative">
          {event?.images && event.images.length > 0 ? (
            <Carousel
              withIndicators
              emblaOptions={{
                loop: true,
                dragFree: false,
                align: "center",
              }}
              height={500}
              styles={{
                indicator: {
                  width: 12,
                  height: 4,
                  transition: "width 250ms ease",
                  "&[dataActive]": { width: 40 },
                },
              }}
            >
              {event.images.map((url, index) => (
                <Carousel.Slide key={index}>
                  <Box
                    h="100%"
                    style={{
                      backgroundImage: `url("${resolveUrl(url)}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "zoom-in",
                    }}
                    onClick={() => {
                      setLightboxSlide(index);
                      setLightboxOpened(true);
                    }}
                  >
                    <Box
                      pos="absolute"
                      inset={0}
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                  </Box>
                </Carousel.Slide>
              ))}
            </Carousel>
          ) : (
            <Box
              h={500}
              style={{
                backgroundImage: `url("/banners/event-banner1-${theme}.png")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Box
                pos="absolute"
                inset={0}
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)",
                  pointerEvents: "none",
                }}
              />
            </Box>
          )}

          <Container
            size="xl"
            pos="absolute"
            bottom={0}
            left={0}
            right={0}
            pb={40}
            style={{ zIndex: 10, pointerEvents: "none" }}
          >
            <Stack gap="md" style={{ pointerEvents: "auto" }}>
              <Group gap="xs">
                <Badge
                  size="lg"
                  variant={
                    event.category === "other"
                      ? "gray"
                      : event.category === "workshop"
                        ? "blue"
                        : event.category === "conference"
                          ? "var(--upagain-neutral-green)"
                          : event.category === "meetups"
                            ? "var(--upagain-yellow)"
                            : "red"
                  }
                >
                  {event.category.toUpperCase()}
                </Badge>
              </Group>
              <Title order={1} size={48} c="white" fw={900}>
                {event.title}
              </Title>
            </Stack>
          </Container>
        </Box>

        {/* MAIN CONTENT AREA */}
        <Container size="xl" pb={40} pt={24} w="100%">
          <Stack gap="lg">
            <MyBreadcrumbs
              mb="xl"
              mt="md"
              breadcrumbs={[
                {
                  title: t("home:title", { defaultValue: "Home" }),
                  href: PATHS.HOME,
                },
                {
                  title: t("events", { defaultValue: "Events" }),
                  href: "/events",
                },
                ...(location.state?.from === "upcomingEvents"
                  ? [
                      {
                        title: t("events:my_events.title", {
                          defaultValue: "My Events",
                        }),
                        href: PATHS.EVENTS.PLANNING,
                      },
                    ]
                  : [
                      {
                        title: t(`categories.${event.category}_plural`),
                        href: `/events/${event.category}s`,
                      },
                    ]),

                { title: event.title, href: "#" },
              ]}
            />
            <Grid gap={40}>
              {/* LEFT COLUMN: Main Info */}
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap={40}>
                  {/* 2. METADATA SECTION (Organizer in Paper) */}
                  <Paper variant="primary" p="lg" radius="xl" withBorder>
                    <Group justify="space-between" align="center">
                      <Stack gap={4}>
                        <Text c="dimmed" size="xs" fw={700} tt="uppercase">
                          {t("detail.organized_by")}
                        </Text>
                        <Group gap="sm">
                          <Avatar.Group>
                            {event.organizers?.slice(0, 3).map((org, i) => (
                              <Avatar
                                key={i}
                                src={resolveUrl(org.avatar || "")}
                                name={org.username}
                                color="initials"
                                radius="xl"
                              />
                            ))}
                            {event.organizers?.length! > 3 && (
                              <Avatar radius="xl">
                                +{event.organizers?.length! - 3}
                              </Avatar>
                            )}
                          </Avatar.Group>
                          {/* <Anchor
                          size="sm"
                          fw={700}
                          onClick={() => navigate("#")}
                          style={{
                            cursor: "pointer",
                          }}
                          c="var(--color-text)"
                        >
                          {event.organizers.map((o) => o.name).join(", ")}
                        </Anchor> */}
                          <Group gap={4} wrap="wrap">
                            {event.organizers?.map((organizer, index) => (
                              <Group key={organizer.username || index} gap={4}>
                                <Text
                                  className="text"
                                  size="sm"
                                  fw={700}
                                  onClick={() => navigate("#")}
                                  style={{
                                    color: "var(--mantine-color-text)",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease-in-out",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration =
                                      "underline";
                                    e.currentTarget.style.color =
                                      "var(--upagain-neutral-green)"; // Added brand touch
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration =
                                      "none";
                                    e.currentTarget.style.color =
                                      "var(--mantine-color-text)";
                                  }}
                                >
                                  {organizer.username}
                                </Text>

                                {/* Add a comma if it's not the last organizer */}
                                {index < event.organizers!.length - 1 && (
                                  <Text size="sm" c="dimmed">
                                    ,{" "}
                                  </Text>
                                )}
                              </Group>
                            ))}
                          </Group>
                        </Group>
                      </Stack>
                      <Stack gap={4} align="flex-end">
                        <Text c="dimmed" size="xs" fw={700} tt="uppercase">
                          {t("detail.published_on")}
                        </Text>
                        <Group gap={6}>
                          <IconClock size={16} color="dimmed" />
                          <Text size="sm" fw={600}>
                            {new Date(event.created_at).toLocaleDateString()}
                          </Text>
                        </Group>
                      </Stack>
                    </Group>
                  </Paper>

                  {/* 3. CONTENT SECTION (HTML Rendering) */}
                  <Stack gap="md">
                    <Title order={3}>{t("detail.about")}</Title>
                    <div
                      style={{ lineHeight: 1.6, fontSize: "1.05rem" }}
                      dangerouslySetInnerHTML={{
                        __html: event.description,
                      }}
                    />
                  </Stack>

                  <Divider />

                  {/* 4. LOCATION SECTION */}
                  <Stack gap="xl">
                    <Stack gap="xs">
                      <Title order={3}>{t("detail.location")}</Title>
                      <Group gap={8}>
                        <IconMapPin
                          size={20}
                          color="var(--upagain-neutral-green)"
                        />
                        <Text size="lg" fw={500}>
                          {event.street}, {event.city} {event.location_detail}
                        </Text>
                      </Group>
                    </Stack>

                    {/* Google Maps Placeholder */}
                    <Box
                      h={300}
                      bg="var(--mantine-color-gray-1)"
                      style={{
                        borderRadius: "var(--mantine-radius-lg)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed var(--mantine-color-gray-3)",
                      }}
                    >
                      <IconMapPin
                        size={48}
                        color="var(--mantine-color-gray-4)"
                      />
                      <Text c="dimmed" fw={600} mt="sm">
                        {t("detail.map_placeholder")}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t("detail.map_api_note")}
                      </Text>
                    </Box>
                  </Stack>

                  <Divider />

                  {/* 6. EXPLORE RELEVANT EVENTS SECTION */}
                  <Stack gap="xl">
                    <Group justify="space-between" align="center">
                      <Title order={3}>{t("detail.relevant_events")}</Title>
                      <Button
                        variant="subtle"
                        color="var(--upagain-neutral-green)"
                        rightSection={<IconChevronRight size={14} />}
                      >
                        {t("categories.see_all", {
                          category: t(`categories.${event.category}_plural`),
                        })}
                      </Button>
                    </Group>
                    {suggestedEvents.length > 0 ? (
                      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                        {suggestedEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            onclick={() =>
                              navigate(`/events/${event.category}s/${event.id}`)
                            }
                            category={event.category}
                            title={event.title}
                            description={event.description}
                            authorName={event.employee_name || "Unknown"}
                            authorAvatar={event.employee_avatar || ""}
                            createdAt={event.created_at}
                            eventDate={event.start_at}
                            image={event.images?.[0] || ""}
                            price={event.price}
                            city={event.city}
                            registeredCount={event.registered}
                            fullEvent={event}
                          />
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Center mt="lg" w="100%" style={{ gridColumn: "1 / -1" }}>
                        <Stack align="center" gap="xs">
                          <IconCalendarOff
                            size={40}
                            stroke={1.5}
                            color="var(--mantine-color-dimmed)"
                            style={{ opacity: 0.6 }}
                          />
                          <Text c="dimmed" fw={500} size="sm" ta="center">
                            {t("events:detail.no_relevant_events")}
                          </Text>
                        </Stack>
                      </Center>
                    )}
                  </Stack>
                </Stack>
              </Grid.Col>

              {/* 5. FLOATING DETAILS CARD (Right Side) */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Box style={{ position: "sticky", top: 100 }}>
                  <Paper
                    variant="primary"
                    shadow="xl"
                    p="xl"
                    radius="lg"
                    withBorder
                  >
                    <Stack gap="lg">
                      {/* Price */}
                      <Group gap="sm">
                        <Title order={2} c="var(--upagain-neutral-green)">
                          {event.price > 0
                            ? `${event.price}€`
                            : t("detail.free_entry")}
                        </Title>
                        <Text size="sm" fw={700} tt="uppercase" c="dimmed">
                          {t("detail.per_person")}
                        </Text>
                      </Group>

                      {/* Dates */}
                      <Stack gap="md">
                        <Group gap="md" wrap="nowrap">
                          <IconCalendar
                            size={24}
                            color="var(--upagain-neutral-green)"
                          />
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                              {t("detail.start_date")}
                            </Text>
                            <Text size="sm" fw={700}>
                              {new Date(event.start_at).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}{" "}
                              -{" "}
                              {new Date(event.start_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </Stack>
                        </Group>
                        <Group gap="md" wrap="nowrap">
                          <IconClockCheck
                            size={24}
                            color="var(--upagain-neutral-green)"
                          />
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed">
                              {t("detail.end_date")}
                            </Text>
                            <Text size="sm" fw={700}>
                              {new Date(event.end_at).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                              {" - "}
                              {new Date(event.end_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </Stack>
                        </Group>
                      </Stack>

                      <Divider />

                      {/* Capacity */}
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Group gap={6}>
                            <IconUsers size={18} />
                            <Text size="sm" fw={600}>
                              {t("detail.capacity")}
                            </Text>
                          </Group>
                          <Text
                            size="sm"
                            fw={700}
                            c="var(--upagain-neutral-green)"
                          >
                            {event.capacity === null || event.capacity === 0
                              ? t("detail.spots_unspecified")
                              : t("detail.spots_left", {
                                  count: event.capacity - event.registered,
                                })}
                          </Text>
                        </Group>
                        <Progress
                          value={
                            event.capacity !== null && event.capacity !== 0
                              ? ((event.capacity - event.registered) /
                                  event.capacity) *
                                100
                              : 100
                          }
                          color="var(--upagain-neutral-green)"
                          size="md"
                          radius="xl"
                        />
                        <Text size="xs" c="dimmed">
                          {event.capacity !== null && event.capacity !== 0
                            ? t("detail.spots_left", {
                                count: event.capacity - event.registered,
                              })
                            : ""}
                        </Text>
                      </Stack>

                      {/* CTA */}
                      {isPast ? (
                        <Paper
                          withBorder
                          p="md"
                          radius="md"
                          bg="var(--mantine-color-gray-0)"
                        >
                          <Group gap="xs">
                            <IconCalendarOff
                              size={18}
                              color="var(--mantine-color-red-6)"
                            />
                            <Text size="sm" fw={600} c="red.6">
                              {t("detail.event_ended")}
                            </Text>
                          </Group>
                        </Paper>
                      ) : (
                        <>
                          {(isUser || isPro) && !isRegistered && (
                            <Button
                              size="lg"
                              radius="md"
                              variant="cta-reverse"
                              fullWidth
                              color="var(--upagain-neutral-green)"
                              rightSection={<IconChevronRight size={18} />}
                              onClick={openRegister}
                              loading={registerToEvent.isPending || isVerifying}
                            >
                              {t("detail.register_now")}
                            </Button>
                          )}
                          {(isUser || isPro) && isRegistered && (
                            <Button
                              size="lg"
                              radius="md"
                              variant="delete"
                              fullWidth
                              color="var(--upagain-neutral-green)"
                              rightSection={<IconX size={18} />}
                              onClick={openCancelRegistration}
                            >
                              {t("detail.cancel_registration")}
                            </Button>
                          )}
                        </>
                      )}

                      {(isEmployee || isAdmin) && (
                        <Group gap="sm">
                          <Button
                            radius="md"
                            variant="primary"
                            fullWidth
                            onClick={openAttendees}
                            rightSection={<IconUsers size={18} />}
                          >
                            {t("detail.see_attendees")}
                          </Button>
                          <Button
                            radius="md"
                            variant="edit"
                            disabled={
                              dayjs(event.start_at) < dayjs().startOf("day")
                            }
                            fullWidth
                            onClick={openEdit}
                            rightSection={<IconEdit size={18} />}
                          >
                            {t("detail.edit_event")}
                          </Button>
                          <Button
                            radius="md"
                            variant={
                              ["cancelled", "pending", "refused"].includes(
                                event.status ?? "",
                              )
                                ? "primary"
                                : "delete"
                            }
                            disabled={
                              dayjs(event.start_at) < dayjs().startOf("day")
                            }
                            fullWidth
                            onClick={openCancel}
                            rightSection={<IconX size={18} />}
                          >
                            {t("admin:events.details.cancel_event")}
                          </Button>
                        </Group>
                      )}

                      {/* Footer */}
                      <Group justify="center" gap={4} c="dimmed">
                        {(isUser || isPro) &&
                          //  TODO: not registered to this event &&
                          true && (
                            <>
                              <IconShieldCheck size={14} />
                              <Text size="xs" fw={500}>
                                {t("detail.secure_payment")}
                              </Text>
                            </>
                          )}
                        {(isUser || isPro) &&
                          //  TODO: already registered to this event &&
                          false && (
                            <>
                              <IconCheck size={14} />
                              <Text size="xs" fw={500}>
                                {t("detail.already_registered")}
                              </Text>
                            </>
                          )}
                      </Group>
                    </Stack>
                  </Paper>
                </Box>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>

        <EditEventModal
          opened={openedEdit}
          onClose={closeEdit}
          id_event={idEvent}
          eventDetails={event}
        />
        <EventAttendeesModal
          opened={openedAttendees}
          onClose={closeAttendees}
          attendees={event.attendees || []}
        />
        <CancelEventModal
          opened={openedCancel}
          onClose={closeCancel}
          onConfirm={() => {
            handleCancel();
          }}
          title={t("admin:events.details.cancel_modal.cancel_title")}
          message={t("admin:events.details.cancel_modal.cancel_msg")}
          confirmLabel={t("admin:events.details.cancel_modal.confirm_cancel")}
        />

        <EventRegistrationModal
          opened={openedRegister}
          onClose={closeRegister}
          onConfirm={handleRegisterToEvent}
          loading={registerToEvent.isPending}
          event={event}
        />

        <CancelRegistrationModal
          opened={openedCancelRegistration}
          onClose={closeCancelRegistration}
          onConfirm={handleCancelRegistration}
          loading={cancelRegistrationMutation.isPending}
        />

        <PhotosCarousel
          photos={event.images || []}
          opened={lightboxOpened}
          onClose={() => setLightboxOpened(false)}
          defaultActiveSlide={lightboxSlide}
        />
      </Stack>
    </>
  );
}
