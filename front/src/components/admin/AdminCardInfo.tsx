import { Card, Text, Flex, Title, Box, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { type Icon } from "@tabler/icons-react";
import classes from "../../styles/Admin.module.css";

interface StatsCardDescProps {
  description: string;
  icon: Icon;
  stats: number;
  percentage: number;
}
export function StatsCardDesc({
  description,
  icon: Icon,
  stats,
  percentage,
}: StatsCardDescProps) {
  return (
    <Box>
      <Group gap="xs" mt="sm" align="flex-start" wrap="nowrap">
        <Text c="dimmed">
          <Icon size={24} />
        </Text>

        <Text c="dimmed" style={{ flex: 1 }}>
          + {percentage}% | {stats}
          {description}
        </Text>
      </Group>
    </Box>
  );
}

interface AdminCardInfoProps {
  title: string;
  icon: Icon;
  value: string | number;
  description?: React.ReactNode;
  path?: string;
}

export function AdminCardInfo({
  title,
  icon: Icon,
  value,
  description,
  path,
}: AdminCardInfoProps) {
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
      data-clickable={path ? true : undefined}
    >
      <Flex
        gap="xl"
        justify="space-between"
        align="center"
        direction="row"
        wrap="wrap"
      >
        <Text size="md">{title}</Text>
        <Icon />
      </Flex>

      <Title order={3} mt="lg">
        {value}
      </Title>

      {description}
    </Card>
  );
}
