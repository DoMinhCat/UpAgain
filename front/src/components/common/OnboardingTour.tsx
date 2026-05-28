import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAccountDetails, useCompleteOnboarding } from "../../hooks/accountHooks";
import { PATHS } from "../../routes/paths";
import { useMantineTheme } from "@mantine/core";

export default function OnboardingTour() {
  const { t } = useTranslation(["common"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useMantineTheme();
  
  const { data: accountDetails, isLoading } = useAccountDetails(user?.id || 0, !!user);
  const { mutateAsync: completeOnboardingAsync } = useCompleteOnboarding(user?.id || 0);

  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Only run if user is logged in, details loaded, and not completed yet
    if (user && !isLoading && accountDetails) {
      if (accountDetails.completed_onboard === false) {
        // If not on home page, maybe redirect them to home first?
        if (location.pathname === PATHS.HOME) {
          setRun(true);
        } else if (stepIndex === 0 && !run) {
          // If we want to force start from home
          navigate(PATHS.HOME);
        }
      }
    }
  }, [user, isLoading, accountDetails, location.pathname]);

  const steps: Step[] = [
    // 1. UserHome
    {
      target: "#onboard-impact",
      content: t("common:onboarding.step_impact", { defaultValue: "Here is your impact overview. You can see how much CO2, water, and electricity you have saved!" }),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "#onboard-manage",
      content: t("common:onboarding.step_manage", { defaultValue: "Manage your listings and deposits easily from this section." }),
      placement: "top",
    },
    {
      target: "#onboard-community-events",
      content: t("common:onboarding.step_quick_nav", { defaultValue: "Quickly navigate to events and the community here." }),
      placement: "top",
    },
    // 2. MarketPage
    {
      target: "#onboard-market-list",
      content: t("common:onboarding.step_market_list", { defaultValue: "In the marketplace, you can see objects listed by other users." }),
      placement: "top",
      disableBeacon: true,
    },
    {
      target: "#onboard-market-post",
      content: t("common:onboarding.step_market_post", { defaultValue: "Ready to contribute? Click here to post your first object!" }),
      placement: "bottom",
    },
    // 3. MyItems
    {
      target: "#onboard-myitems",
      content: t("common:onboarding.step_myitems", { defaultValue: "Track the status, reservations, and purchases of all your listings in one place." }),
      placement: "top",
      disableBeacon: true,
    },
    // 4. PostsPage
    {
      target: "#onboard-posts-list",
      content: t("common:onboarding.step_posts_list", { defaultValue: "Explore exciting articles and projects from professionals in our community." }),
      placement: "top",
      disableBeacon: true,
    },
    {
      target: "#onboard-posts-saved",
      content: t("common:onboarding.step_posts_saved", { defaultValue: "See all your favorite saved posts here." }),
      placement: "bottom",
    },
    // 5. EventPage
    {
      target: "#onboard-events-list",
      content: t("common:onboarding.step_events_list", { defaultValue: "Participate in our engaging events and workshops." }),
      placement: "top",
      disableBeacon: true,
    },
    {
      target: "#onboard-events-my",
      content: t("common:onboarding.step_events_my", { defaultValue: "Manage your event registrations here." }),
      placement: "bottom",
    },
    // 6. EventPlanningPage
    {
      target: "#onboard-events-planning",
      content: t("common:onboarding.step_events_planning", { defaultValue: "See all the events you are registered for in one place." }),
      placement: "top",
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);
      await completeOnboardingAsync();
      navigate(PATHS.HOME);
    } else if (type === "step:after" || type === "error:target_not_found") {
      const nextStepIndex = index + (action === "prev" ? -1 : 1);

      // Handle Page Navigations based on next step index
      if (nextStepIndex === 3 && location.pathname !== PATHS.MARKETPLACE.HOME) {
        setRun(false);
        navigate(PATHS.MARKETPLACE.HOME);
        setTimeout(() => {
          setStepIndex(nextStepIndex);
          setRun(true);
        }, 500);
        return;
      } else if (nextStepIndex === 5 && location.pathname !== PATHS.MARKETPLACE.ME) {
        setRun(false);
        navigate(PATHS.MARKETPLACE.ME);
        setTimeout(() => {
          setStepIndex(nextStepIndex);
          setRun(true);
        }, 500);
        return;
      } else if (nextStepIndex === 6 && location.pathname !== PATHS.USER.POSTS.ALL) {
        setRun(false);
        navigate(PATHS.USER.POSTS.ALL);
        setTimeout(() => {
          setStepIndex(nextStepIndex);
          setRun(true);
        }, 500);
        return;
      } else if (nextStepIndex === 8 && location.pathname !== PATHS.EVENTS.HOME) {
        setRun(false);
        navigate(PATHS.EVENTS.HOME);
        setTimeout(() => {
          setStepIndex(nextStepIndex);
          setRun(true);
        }, 500);
        return;
      } else if (nextStepIndex === 10 && location.pathname !== PATHS.EVENTS.PLANNING) {
        setRun(false);
        navigate(PATHS.EVENTS.PLANNING);
        setTimeout(() => {
          setStepIndex(nextStepIndex);
          setRun(true);
        }, 500);
        return;
      } else if (action === "prev") {
        // Going backward handling
        if (nextStepIndex === 2 && location.pathname !== PATHS.HOME) {
          setRun(false);
          navigate(PATHS.HOME);
          setTimeout(() => { setStepIndex(nextStepIndex); setRun(true); }, 500);
          return;
        } else if (nextStepIndex === 4 && location.pathname !== PATHS.MARKETPLACE.HOME) {
          setRun(false);
          navigate(PATHS.MARKETPLACE.HOME);
          setTimeout(() => { setStepIndex(nextStepIndex); setRun(true); }, 500);
          return;
        } else if (nextStepIndex === 5 && location.pathname !== PATHS.MARKETPLACE.ME) {
          setRun(false);
          navigate(PATHS.MARKETPLACE.ME);
          setTimeout(() => { setStepIndex(nextStepIndex); setRun(true); }, 500);
          return;
        } else if (nextStepIndex === 7 && location.pathname !== PATHS.USER.POSTS.ALL) {
          setRun(false);
          navigate(PATHS.USER.POSTS.ALL);
          setTimeout(() => { setStepIndex(nextStepIndex); setRun(true); }, 500);
          return;
        } else if (nextStepIndex === 9 && location.pathname !== PATHS.EVENTS.HOME) {
          setRun(false);
          navigate(PATHS.EVENTS.HOME);
          setTimeout(() => { setStepIndex(nextStepIndex); setRun(true); }, 500);
          return;
        }
      }

      setStepIndex(nextStepIndex);
    }
  };

  // Expose a method to manually start onboarding (for testing)
  useEffect(() => {
    const handleTestOnboard = () => {
      setStepIndex(0);
      navigate(PATHS.HOME);
      setTimeout(() => setRun(true), 500);
    };
    window.addEventListener("start-onboarding-test", handleTestOnboard);
    return () => window.removeEventListener("start-onboarding-test", handleTestOnboard);
  }, [navigate]);

  if (!user || isLoading) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "var(--upagain-neutral-green)",
          zIndex: 10000,
          arrowColor: theme.colors.gray[0],
          backgroundColor: theme.colors.gray[0],
          textColor: theme.colors.dark[9],
        },
        buttonNext: {
          borderRadius: 8,
          fontWeight: 600,
        },
        buttonBack: {
          color: theme.colors.gray[6],
        },
      }}
      locale={{
        last: t("common:onboarding.last", { defaultValue: "Finish" }),
        next: t("common:onboarding.next", { defaultValue: "Next" }),
        skip: t("common:onboarding.skip", { defaultValue: "Skip" }),
        back: t("common:onboarding.back", { defaultValue: "Back" }),
      }}
    />
  );
}
