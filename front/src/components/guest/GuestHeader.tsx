import { Button, Group, Image, UnstyledButton, Tooltip } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import classes from "../../styles/Guest.module.css";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { PATHS } from "../../../src/routes/paths";

interface NavbarLinkProps {
  icon: typeof IconMoon;
  label: string;
  active?: boolean;
  path?: string;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, onClick }: NavbarLinkProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={handleClick}
        className={classes.toggleButton}
        aria-label={label}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

function ThemeToggleButton() {
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");

  const toggle = () => setColorScheme(scheme === "dark" ? "light" : "dark");

  return (
    <NavbarLink
      icon={scheme === "dark" ? IconSun : IconMoon}
      label="Toggle theme"
      onClick={toggle}
    />
  );
}

function HeaderLink({ label, path }: { label: string; path: string }) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(path);
  };
  return (
    <UnstyledButton className={`${classes.link}`} onClick={handleClick}>
      {label}
    </UnstyledButton>
  );
}

export function GuestHeader() {
  return (
    <Group justify="space-between" h="100%" px="xl" className={classes.header}>
      {/* 1. Brand Section */}
      <UnstyledButton>
        <Group gap="xs">
          <Image src="/logo.png" h={28} w="auto" />
          <Image src="/brand-name.png" h={32} w="auto" />
        </Group>
      </UnstyledButton>

      {/* 2. Navigation Section */}
      <Group h="100%" gap="sm" visibleFrom="sm">
        <HeaderLink label="Community" path={PATHS.GUEST.POSTS} />
        <HeaderLink label="About Us" path={PATHS.GUEST.ABOUT} />
        <HeaderLink label="Pricing" path={PATHS.GUEST.PRICING} />
        <HeaderLink label="Contact" path={PATHS.GUEST.CONTACT} />
      </Group>

      {/* 3. Actions Section */}
      <Group gap="md">
        <ThemeToggleButton />

        <Group gap="xs" visibleFrom="xs">
          <Button variant="subtle" color="gray" radius="md">
            Log in
          </Button>
          <Button radius="md" px="lg">
            Sign up
          </Button>
        </Group>
      </Group>
    </Group>
  );
}
