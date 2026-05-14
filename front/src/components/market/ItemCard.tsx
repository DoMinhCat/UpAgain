import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Box,
  Stack,
  useComputedColorScheme,
  Avatar,
} from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import type { Item } from "../../api/interfaces/item";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { resolveUrl } from "../../utils/imageUtils";
import { getTimeAgo } from "../../utils/timeUtils";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();
  const theme = useComputedColorScheme("light");
  const { t } = useTranslation(["common", "marketplace"]);

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="lg" // Upgraded to 'lg' to match your breadcrumbs/buttons
      withBorder
      className="item-card"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // Ensures all cards in a grid row are equal height
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
      }}
      onClick={() =>
        navigate(`${PATHS.MARKETPLACE.HOME}/${item.id}`, {
          state: { from: "marketplace" },
        })
      }
    >
      <Card.Section>
        <Image
          src={resolveUrl(item.images?.[0] || "")}
          height={200} // Slightly taller for better product visibility
          alt={item.title}
          fallbackSrc={`/banners/user-banner1-${theme}.png`}
          style={{ objectFit: "cover" }}
        />
      </Card.Section>

      <Stack
        gap="xs"
        mt="md"
        style={{ flex: 1, justifyContent: "space-between" }}
      >
        <Box>
          <Group justify="space-between" mb={4}>
            <Group gap={4} c="dimmed">
              <IconClock size={14} />
              <Text size="xs" fw={500}>
                {getTimeAgo(item.created_at, t)}
              </Text>
            </Group>
            <Text
              fw={800}
              c={
                item.price == 0
                  ? "var(--upagain-neutral-green)"
                  : "var(--upagain-yellow)"
              }
              style={{ whiteSpace: "nowrap" }}
            >
              {item.price === 0 ? t("common:free") : item.price + "€"}
            </Text>
          </Group>

          <Text fw={800} size="lg" lineClamp={1} mb={8}>
            {item.title}
          </Text>

          <Group gap={6} mb="sm">
            <Badge
              variant={
                item.material === "wood"
                  ? "blue"
                  : item.material === "metal"
                    ? "green"
                    : item.material === "textile"
                      ? "yellow"
                      : item.material === "glass"
                        ? "red"
                        : item.material === "plastic"
                          ? "violet"
                          : item.material === "other"
                            ? "gray"
                            : "cyan"
              }
              size="xs"
            >
              {t(`common:materials.${item.material}`, {
                defaultValue: item.material,
              })}
            </Badge>
            <Badge
              color="var(--upagain-neutral-green)"
              variant="light"
              size="xs"
            >
              {item.state}
            </Badge>
          </Group>

          <Text
            size="sm"
            c="dimmed"
            lineClamp={2} // Keeps vertical rhythm consistent
            component="div"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                item.description
                  .replace(/<[^>]*>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim(),
              ),
            }}
          />
        </Box>

        <Group gap={8} mt="md">
          <Avatar
            size="sm"
            src={resolveUrl(item.creator_avatar || "")}
            radius="xl"
            name={item.username}
            color="initials"
          />
          <Text size="xs" fw={700} c="var(--mantine-color-text)">
            {item.username}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
