import { Card, Title, Text } from "@mantine/core";
import { type Icon } from "@tabler/icons-react";
import classes from "./Admin.module.css";
import { useNavigate } from "react-router-dom";

interface AdminCardNavProps {
  icon: Icon;
  title: string;
  description: string;
  path: string;
}

export default function AdminCardNav({
  icon: Icon,
  title,
  description,
  path,
}: AdminCardNavProps) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Card
      shadow="sm"
      px="lg"
      pt="lg"
      pb="xl"
      radius="md"
      withBorder
      onClick={handleClick}
      className={classes.card}
      data-clickable
    >
      <Icon />
      <Title mt="lg" order={3}>
        {title}
      </Title>

      <Text mt="xs" c="dimmed">
        {description}
      </Text>
    </Card>
  );
}
