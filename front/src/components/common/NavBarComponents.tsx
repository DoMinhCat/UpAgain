import { Tooltip, UnstyledButton } from "@mantine/core";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import classes from "../../styles/Guest.module.css";

export interface NavbarLinkProps {
  icon: typeof IconMoon;
  label: string;
  active?: boolean;
  path?: string;
  onClick?: () => void;
}

export function NavbarLink({ icon: Icon, label, onClick }: NavbarLinkProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Tooltip label={label} position="bottom" transitionProps={{ duration: 0 }}>
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

export function ThemeToggleButton() {
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

export function HeaderLink({
  label,
  path,
  onClick,
}: {
  label: string;
  path: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);

  const handleClick = () => {
    if (onClick) onClick();
    navigate(path);
  };
  return (
    <UnstyledButton
      className={`${classes.link} ${isActive ? classes.linkActive : ""}`}
      onClick={handleClick}
    >
      {label}
    </UnstyledButton>
  );
}
