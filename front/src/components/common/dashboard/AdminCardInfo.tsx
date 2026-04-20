import { Card, Text, Flex, Title, Box, Group, Loader } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { type Icon } from "@tabler/icons-react";
import classes from "../../../styles/Admin.module.css";

interface StatsCardDescProps {
  description: string;
  icon?: React.ReactNode;
  stats: number;
}
export function StatsCardDesc({
  description,
  icon,
  stats,
}: StatsCardDescProps) {
  return (
    <Box>
      <Group gap="xs" mt="sm" align="flex-start" wrap="nowrap">
        <Text c="dimmed">{icon && icon}</Text>

        <Text c="dimmed" style={{ flex: 1 }}>
          + {stats}
          {description}
        </Text>
      </Group>
    </Box>
  );
}

interface AdminCardInfoProps extends Omit<
  import("@mantine/core").CardProps,
  "title" | "value"
> {
  title: string;
  icon: Icon;
  value: string | number;
  description?: React.ReactNode;
  path?: string;
  error?: boolean;
  loading?: boolean;
}

export function AdminCardInfo({
  title,
  icon: Icon,
  value,
  description,
  path,
  error,
  loading,
  className,
  ...others
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
      className={`${classes.card} ${className || ""}`}
      data-clickable={path ? true : undefined}
      {...others}
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

      {loading ? (
        <Loader />
      ) : error ? (
        <Text c="red">An error occured while fetching data</Text>
      ) : (
        <>
          <Title order={3} mt="lg">
            {value}
          </Title>
          {description}
        </>
      )}
    </Card>
  );
}
