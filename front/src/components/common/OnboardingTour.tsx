import { useEffect, useRef, useState } from "react";
import {
  useJoyride,
  EVENTS,
  STATUS,
  type Step,
  type EventData,
  type Controls,
} from "react-joyride";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  useAccountDetails,
  useCompleteOnboarding,
} from "../../hooks/accountHooks";
import { PATHS } from "../../routes/paths";
import { useMantineTheme, Modal, Button, Text, Stack } from "@mantine/core";

export default function OnboardingTour() {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useMantineTheme();
  const [showFinishedModal, setShowFinishedModal] = useState(false);

  const { data: accountDetails, isLoading } = useAccountDetails(
    user?.id || 0,
    !!user,
  );
  const { mutateAsync: completeOnboardingAsync } = useCompleteOnboarding(
    user?.id || 0,
  );

  const controlsRef = useRef<Controls | null>(null);
  const pendingStepRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  const isPro = accountDetails?.role === "pro";
  const startPath = isPro ? PATHS.MARKETPLACE.HOME : PATHS.HOME;

  const userSteps: Step[] = [
    // 1. UserHome (steps 0–2)
    {
      target: "#onboard-impact",
      content: t("common:onboarding.step_impact", {
        defaultValue:
          "Here is your impact overview. You can see how much CO2, water, and electricity you have saved!",
      }),
      placement: "bottom",
    },
    {
      target: "#onboard-manage",
      content: t("common:onboarding.step_manage", {
        defaultValue:
          "Manage your listings and deposits easily from this section.",
      }),
      placement: "top",
    },
    {
      target: "#onboard-community-events",
      content: t("common:onboarding.step_quick_nav", {
        defaultValue: "Quickly navigate to events and the community here.",
      }),
      placement: "top",
    },
    // 2. MarketPage (steps 3–4)
    {
      target: "#onboard-market-list",
      content: t("common:onboarding.step_market_list", {
        defaultValue:
          "In the marketplace, you can see objects listed by other users.",
      }),
      placement: "top",
    },
    {
      target: "#onboard-market-post",
      content: t("common:onboarding.step_market_post", {
        defaultValue:
          "Ready to contribute? Click here to post your first object!",
      }),
      placement: "bottom",
    },
    // 3. MyItems (step 5)
    {
      target: "#onboard-myitems",
      content: t("common:onboarding.step_myitems", {
        defaultValue:
          "Track the status, reservations, and purchases of all your listings in one place.",
      }),
      placement: "center",
    },
    // 4. PostsPage (steps 6–7)
    {
      target: "#onboard-posts-list",
      content: t("common:onboarding.step_posts_list", {
        defaultValue:
          "Explore exciting articles and projects from professionals in our community.",
      }),
      placement: "top",
    },
    {
      target: "#onboard-posts-saved",
      content: t("common:onboarding.step_posts_saved", {
        defaultValue: "See all your favorite saved posts here.",
      }),
      placement: "bottom",
    },
    // 5. EventPage (steps 8–9)
    {
      target: "#onboard-events-list",
      content: t("common:onboarding.step_events_list", {
        defaultValue: "Participate in our engaging events and workshops.",
      }),
      placement: "top",
    },
    {
      target: "#onboard-events-my",
      content: t("common:onboarding.step_events_my", {
        defaultValue: "Manage your event registrations here.",
      }),
      placement: "bottom",
    },
    // 6. EventPlanningPage (step 10)
    {
      target: "#onboard-events-planning",
      content: t("common:onboarding.step_events_planning", {
        defaultValue: "See all the events you are registered for in one place.",
      }),
      placement: "top",
    },
  ];

  const proSteps: Step[] = [
    // 1. Marketplace (step 0)
    {
      target: "#onboard-market-list",
      content: t("common:onboarding.step_market_list_pro", {
        defaultValue:
          "Welcome to the marketplace! Here, you can buy materials for your projects.",
      }),
      placement: "top",
    },
    // 2. MyItems (step 1)
    {
      target: "#onboard-myitems",
      content: t("common:onboarding.step_myitems_pro", {
        defaultValue:
          "Manage your reservations and purchases in one place under My Items.",
      }),
      placement: "center",
    },
    // 3. PostsPage (step 2)
    {
      target: "#onboard-posts-list",
      content: t("common:onboarding.step_posts_list_pro", {
        defaultValue:
          "Explore the posts and tutorials, view your saved posts, and post your own projects here.",
      }),
      placement: "top",
    },
    // 4. EventPage (step 3)
    {
      target: "#onboard-events-list",
      content: t("common:onboarding.step_events_list_pro", {
        defaultValue: "Explore and participate in events organized by our employees.",
      }),
      placement: "top",
    },
    // 5. EventPlanningPage (step 4)
    {
      target: "#onboard-events-planning",
      content: t("common:onboarding.step_events_planning", {
        defaultValue: "See all the events you are registered for in one place.",
      }),
      placement: "top",
    },
  ];

  const steps = isPro ? proSteps : userSteps;

  /** Returns the target route path for a given step index */
  function getRouteForStep(stepIndex: number): string {
    if (isPro) {
      if (stepIndex === 0) return PATHS.MARKETPLACE.HOME;
      if (stepIndex === 1) return PATHS.MARKETPLACE.ME;
      if (stepIndex === 2) return PATHS.USER.POSTS.ALL;
      if (stepIndex === 3) return PATHS.EVENTS.HOME;
      return PATHS.EVENTS.PLANNING;
    }
    // User route mapping
    if (stepIndex <= 2) return PATHS.HOME;
    if (stepIndex <= 4) return PATHS.MARKETPLACE.HOME;
    if (stepIndex === 5) return PATHS.MARKETPLACE.ME;
    if (stepIndex <= 7) return PATHS.USER.POSTS.ALL;
    if (stepIndex <= 9) return PATHS.EVENTS.HOME;
    return PATHS.EVENTS.PLANNING;
  }

  const handleEvent = async (data: EventData, controls: Controls) => {
    controlsRef.current = controls;
    const { type, status, index, action } = data;

    // Tour finished or skipped
    if (type === EVENTS.TOUR_END) {
      if (status === STATUS.FINISHED) {
        await completeOnboardingAsync();
        setShowFinishedModal(true);
      } else if (status === STATUS.SKIPPED) {
        await completeOnboardingAsync();
        navigate(startPath);
      }
      return;
    }

    // After each step, check if we need to navigate to a different page
    if (type === EVENTS.STEP_AFTER) {
      const nextIndex = index + (action === "prev" ? -1 : 1);
      const currentRoute = getRouteForStep(index);
      const nextRoute = getRouteForStep(nextIndex);

      if (nextRoute !== currentRoute) {
        // Stop tour, navigate to the new page, then restart at the correct step
        isNavigatingRef.current = true;
        pendingStepRef.current = nextIndex;
        controls.stop();
        navigate(nextRoute);
        // The pathname useEffect below will restart at the right step once mounted
      }
      // For same-page steps: v3 handles advancement automatically
    }
  };

  const { Tour, controls, state } = useJoyride({
    steps,
    run: false,
    scrollToFirstStep: true,
    onEvent: handleEvent,
    options: {
      // Auto-open tooltip immediately — no beacon click required
      skipBeacon: true,
      // Remove the × close button; users navigate only via Next / Back / Skip
      buttons: ["back", "primary", "skip"],
      // Prevent accidental dismissal via overlay click or ESC
      overlayClickAction: false,
      dismissKeyAction: false,
      overlayColor: "rgba(0,0,0,0.55)",
      primaryColor: "var(--upagain-neutral-green, #5a9e6f)",
      zIndex: 10000,
      backgroundColor: theme.colors.gray[0],
      textColor: theme.colors.dark[9],
    },
    locale: {
      last: t("common:onboarding.last", { defaultValue: "Finish" }),
      next: t("common:onboarding.next", { defaultValue: "Next" }),
      skip: t("common:onboarding.skip", { defaultValue: "Skip" }),
      back: t("common:onboarding.back", { defaultValue: "Back" }),
      close: t("common:onboarding.next", { defaultValue: "Next" }),
    },
    styles: {
      buttonPrimary: {
        borderRadius: 8,
        fontWeight: 600,
      },
      buttonBack: {
        color: theme.colors.gray[6],
      },
    },
  });

  // Keep controls ref up to date
  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  // After navigating, resume the tour at the pending step
  useEffect(() => {
    if (pendingStepRef.current !== null && isNavigatingRef.current) {
      const targetRoute = getRouteForStep(pendingStepRef.current);
      if (location.pathname === targetRoute) {
        const stepToGo = pendingStepRef.current;
        pendingStepRef.current = null;
        isNavigatingRef.current = false;
        // Small delay to let the page render its target elements
        setTimeout(() => {
          controlsRef.current?.start(stepToGo);
        }, 600);
      }
    }
  }, [location.pathname]);

  // Auto-start if onboarding not completed
  useEffect(() => {
    if (user && !isLoading && accountDetails) {
      if (
        accountDetails.completed_onboard === false &&
        state.status === "idle"
      ) {
        if (location.pathname !== startPath) {
          navigate(startPath);
          setTimeout(() => {
            controls.start(0);
          }, 600);
        } else {
          setTimeout(() => {
            controls.start(0);
          }, 300);
        }
      }
    }
  }, [user, isLoading, accountDetails, isPro, startPath]);

  // Expose method to manually trigger onboarding (for testing button)
  useEffect(() => {
    const handleTestOnboard = () => {
      controls.reset(false);
      if (location.pathname !== startPath) {
        navigate(startPath);
        setTimeout(() => {
          controls.start(0);
        }, 600);
      } else {
        setTimeout(() => {
          controls.start(0);
        }, 300);
      }
    };
    window.addEventListener("start-onboarding-test", handleTestOnboard);
    return () =>
      window.removeEventListener("start-onboarding-test", handleTestOnboard);
  }, [controls, navigate, location.pathname, isPro, startPath]);

  if (!user || isLoading) return null;

  return (
    <>
      {Tour}
      <Modal
        opened={showFinishedModal}
        onClose={() => {
          setShowFinishedModal(false);
          navigate(startPath);
        }}
        title={t("common:onboarding.finished_title", {
          defaultValue: "Onboarding Completed! 🎉",
        })}
        centered
        radius="md"
        size="md"
      >
        <Stack
          gap="md"
          align="center"
          style={{ textAlign: "center", padding: "10px 0" }}
        >
          <Text size="xl" fw={700} c="var(--upagain-neutral-green, #5a9e6f)">
            {t("common:onboarding.congrats", {
              defaultValue: "Congratulations!",
            })}
          </Text>
          <Text size="sm" c="dimmed">
            {t("common:onboarding.finished_message", {
              defaultValue:
                "You have completed the onboarding tour. You are now ready to explore and use all the features of UpAgain!",
            })}
          </Text>
          <Button
            color="var(--upagain-neutral-green, #5a9e6f)"
            onClick={() => {
              setShowFinishedModal(false);
              navigate(startPath);
            }}
            fullWidth
            radius="md"
            mt="md"
          >
            {t("common:onboarding.get_started", { defaultValue: "Let's Go!" })}
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
