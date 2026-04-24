import {
  Button,
  Group,
  Image,
  UnstyledButton,
  Tooltip,
  Menu,
  ActionIcon,
  Burger,
  Drawer,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import classes from "../../styles/Guest.module.css";
import { PATHS } from "../../routes/paths";
import { ThemeToggleButton, HeaderLink } from "../nav/NavBarComponents";
import { LANGUAGES } from "../../i18n/index";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../utils/langUtils";

export function GuestNavBar() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const currentLanguage =
    LANGUAGES.find((lang) => lang.lng === i18n.language)?.path ||
    "united-kingdom";

  return (
    <Group justify="space-between" h="100%" px="xl" className={classes.header}>
      {/* 1. Brand Section */}
      <UnstyledButton onClick={() => navigate(PATHS.HOME)}>
        <Group gap="xs">
          <Image src="/common/logo.png" h={28} w="auto" />
          <Image src="/common/brand-name.png" h={32} w="auto" />
        </Group>
      </UnstyledButton>

      {/* 2. Navigation Section */}
      <Group h="100%" gap="sm" visibleFrom="sm">
        <HeaderLink label={t("community:community")} path={PATHS.GUEST.POSTS} />
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
          radius="lg"
          offset={15}
        >
          <Menu.Target>
            <Tooltip
              label="Change language"
              position="bottom"
              transitionProps={{ duration: 0 }}
            >
              <ActionIcon variant="primary" color="grey" size="lg" radius="md">
                <Image
                  src={`/flags/${currentLanguage}.png`}
                  w="20px"
                  fit="contain"
                />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Languages</Menu.Label>
            {LANGUAGES.map((language) => (
              <Menu.Item
                key={language.path}
                onClick={() => changeLanguage(language.lng)}
                leftSection={
                  <Image
                    src={`/flags/${language.path}.png`}
                    w="20px"
                    fit="contain"
                  />
                }
              >
                {language.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <Group gap="xs" visibleFrom="xs">
          <Button
            variant="secondary"
            name="login"
            onClick={() => navigate(PATHS.GUEST.LOGIN)}
          >
            {t("auth:login")}
          </Button>
          <Button
            variant="primary"
            name="register"
            onClick={() => navigate(PATHS.GUEST.REGISTER)}
          >
            {t("auth:register")}
          </Button>
        </Group>

        <Burger
          opened={drawerOpened}
          onClick={toggleDrawer}
          hiddenFrom="sm"
          size="sm"
        />
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
          <HeaderLink
            label={t("community:community")}
            path={PATHS.GUEST.POSTS}
            onClick={closeDrawer}
          />
          <HeaderLink
            label="About Us"
            path={PATHS.GUEST.ABOUT}
            onClick={closeDrawer}
          />
          <HeaderLink
            label="Pricing"
            path={PATHS.GUEST.PRICING}
            onClick={closeDrawer}
          />
          <HeaderLink
            label="Contact"
            path={PATHS.GUEST.CONTACT}
            onClick={closeDrawer}
          />
          <Group grow>
            <Button
              variant="secondary"
              onClick={() => {
                navigate(PATHS.GUEST.LOGIN);
                closeDrawer();
              }}
            >
              {t("auth:login")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                navigate(PATHS.GUEST.REGISTER);
                closeDrawer();
              }}
            >
              {t("auth:register")}
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </Group>
  );
}
