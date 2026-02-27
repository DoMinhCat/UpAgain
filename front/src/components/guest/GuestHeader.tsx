import {
  Button,
  Group,
  Image,
  UnstyledButton,
  Tooltip,
  Menu,
  ActionIcon,
  rem,
  Burger,
  Drawer,
  Stack,
} from "@mantine/core";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import classes from "../../styles/Guest.module.css";
import { PATHS } from "../../../src/routes/paths";
import { IconWorld, IconPhoto, IconSun, IconMoon } from "@tabler/icons-react";

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

function HeaderLink({ label, path, onClick }: { label: string; path: string; onClick?: () => void }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) onClick();
    navigate(path);
  };
  return (
    <UnstyledButton className={`${classes.link}`} onClick={handleClick}>
      {label}
    </UnstyledButton>
  );
}

export function GuestHeader() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

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
        <Menu
          shadow="md"
          width={200}
          position="bottom-end"
          transitionProps={{ transition: "pop" }}
        >
          <Menu.Target>
            <ActionIcon variant="primary" color="grey" size="lg" radius="md">
              <IconWorld size={20} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Languages</Menu.Label>
            <Menu.Item
              leftSection={
                <Image src="/united-kingdom.png" w="20px" fit="contain" />
              }
            >
              English
            </Menu.Item>
            <Menu.Item
              leftSection={<Image src="/france.png" w="20px" fit="contain" />}
            >
              Française
            </Menu.Item>
            <Menu.Item
              leftSection={
                <IconPhoto style={{ width: rem(14), height: rem(14) }} />
              }
            >
              Another language
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Group gap="xs" visibleFrom="xs">
          <Button variant="secondary">Log in</Button>
          <Button variant="primary">Sign up</Button>
        </Group>

        <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" size="sm" />
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <Stack gap="md">
          <HeaderLink label="Community" path={PATHS.GUEST.POSTS} onClick={closeDrawer} />
          <HeaderLink label="About Us" path={PATHS.GUEST.ABOUT} onClick={closeDrawer} />
          <HeaderLink label="Pricing" path={PATHS.GUEST.PRICING} onClick={closeDrawer} />
          <HeaderLink label="Contact" path={PATHS.GUEST.CONTACT} onClick={closeDrawer} />
          <Group grow>
            <Button variant="secondary" onClick={closeDrawer}>Log in</Button>
            <Button variant="primary" onClick={closeDrawer}>Sign up</Button>
          </Group>
        </Stack>
      </Drawer>
    </Group>
  );
}
